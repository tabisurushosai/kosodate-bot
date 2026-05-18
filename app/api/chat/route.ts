import { getServerSession } from "next-auth";

import {
  apiErrorResponse,
  unexpectedApiErrorResponse
} from "@/lib/api-errors";
import { authOptions } from "@/lib/auth";
import {
  getChildProfileById,
  listChildProfilesByUser
} from "@/lib/child-profiles";
import { createClaudeResponse, DEFAULT_MAX_TOKENS } from "@/lib/claude";
import { generateConsultationTags } from "@/lib/consultation-tags";
import {
  createConsultationHistory,
  listRecentConsultationHistoriesByUser
} from "@/lib/consultations";
import { createConsultationSystemPrompt } from "@/lib/prompts";
import {
  calculateUsageRemaining,
  getUserById,
  incrementUserUsage,
  resetUserUsageForCurrentMonth
} from "@/lib/users";

export const runtime = "nodejs";

type ChatRequestBody = {
  message?: unknown;
  profileId?: unknown;
};

const parseChatRequestBody = async (request: Request) => {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return {
      error: apiErrorResponse(
        "リクエスト本文が正しいJSONではありません。",
        400,
        "BAD_REQUEST"
      )
    };
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const profileId =
    typeof body.profileId === "string" ? body.profileId.trim() : undefined;

  if (!message) {
    return {
      error: apiErrorResponse("相談内容を入力してください。", 400, "BAD_REQUEST")
    };
  }

  return {
    value: {
      message,
      profileId: profileId || undefined
    }
  };
};

const resolveChildProfileForChat = async ({
  profileId,
  userId
}: {
  profileId?: string;
  userId: string;
}) => {
  if (profileId) {
    const childProfile = await getChildProfileById(profileId);

    if (childProfile && childProfile.user_id !== userId) {
      return { forbidden: true as const };
    }

    return { childProfile };
  }

  const childProfiles = await listChildProfilesByUser(userId);

  return { childProfile: childProfiles[0] ?? null };
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return apiErrorResponse("ログインが必要です。", 401, "AUTH_REQUIRED");
    }

    const parsedBody = await parseChatRequestBody(request);

    if ("error" in parsedBody) {
      return parsedBody.error;
    }

    const storedUser = await getUserById(userId);

    if (!storedUser) {
      return apiErrorResponse(
        "ユーザー情報が見つかりません。",
        404,
        "NOT_FOUND"
      );
    }

    const user = await resetUserUsageForCurrentMonth(storedUser);

    if (calculateUsageRemaining(user) <= 0) {
      return apiErrorResponse(
        "今月の相談回数の上限に達しました。",
        429,
        "RATE_LIMITED",
        { usageRemaining: 0 }
      );
    }

    const { message, profileId } = parsedBody.value;
    const resolvedProfile = await resolveChildProfileForChat({ profileId, userId });

    if ("forbidden" in resolvedProfile) {
      return apiErrorResponse(
        "指定された子どもプロファイルを利用できません。",
        403,
        "FORBIDDEN"
      );
    }

    const childProfile = resolvedProfile.childProfile;
    const recentHistories = await listRecentConsultationHistoriesByUser(userId, 3);

    const claudeResponse = await createClaudeResponse({
      system: createConsultationSystemPrompt({ childProfile, recentHistories }),
      maxTokens: DEFAULT_MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    });

    let tags: string[] = [];

    try {
      tags = await generateConsultationTags({
        message,
        response: claudeResponse.text
      });
    } catch (error) {
      console.error("Failed to generate consultation tags", error);
    }

    await createConsultationHistory({
      user_id: userId,
      message,
      response: claudeResponse.text,
      tags
    });

    const updatedUser = await incrementUserUsage(userId);

    return Response.json({
      response: claudeResponse.text,
      usageRemaining: calculateUsageRemaining(updatedUser),
      usage: claudeResponse.usage,
      responseLimit: {
        maxTokens: claudeResponse.maxTokens,
        truncated: claudeResponse.stopReason === "max_tokens"
      },
      model: claudeResponse.model
    });
  } catch (error) {
    return unexpectedApiErrorResponse({
      code: "SERVER_ERROR",
      error,
      logMessage: "Failed to process chat request",
      message:
        "相談の処理中に問題が発生しました。時間をおいてもう一度お試しください。"
    });
  }
}
