import { getServerSession } from "next-auth";

import {
  apiErrorResponse,
  unexpectedApiErrorResponse
} from "@/lib/api-errors";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/users";

export const runtime = "nodejs";

type StripeCustomerList = {
  data?: Array<{
    id: string;
  }>;
  error?: {
    message?: string;
  };
};

type StripePortalSession = {
  id: string;
  url: string | null;
  error?: {
    message?: string;
  };
};

const requiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const stripeFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const stripeSecretKey = requiredEnv("STRIPE_SECRET_KEY");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...init?.headers
    },
    cache: "no-store"
  });
  const body = (await response.json()) as T & {
    error?: {
      message?: string;
    };
  };

  if (!response.ok) {
    throw new Error(
      body.error?.message ??
        `Stripe request failed: ${response.status} ${response.statusText}`
    );
  }

  return body;
};

const findStripeCustomerIdByEmail = async (email: string) => {
  const customers = await stripeFetch<StripeCustomerList>(
    `customers?email=${encodeURIComponent(email)}&limit=1`
  );

  return customers.data?.[0]?.id ?? null;
};

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return apiErrorResponse("ログインが必要です。", 401, "AUTH_REQUIRED");
    }

    const user = await getUserById(userId);

    if (!user) {
      return apiErrorResponse(
        "ユーザー情報が見つかりません。",
        404,
        "NOT_FOUND"
      );
    }

    if (user.plan !== "paid") {
      return apiErrorResponse(
        "有料プランの管理は、有料プラン利用中のみ開けます。",
        409,
        "CONFLICT"
      );
    }

    const appUrl = requiredEnv("NEXTAUTH_URL").replace(/\/$/, "");
    const email = session.user?.email ?? user.email;
    const customerId = await findStripeCustomerIdByEmail(email);

    if (!customerId) {
      return apiErrorResponse(
        "Stripeの顧客情報が見つかりませんでした。",
        404,
        "NOT_FOUND"
      );
    }

    const params = new URLSearchParams({
      customer: customerId,
      return_url: `${appUrl}/settings`
    });
    const portalSession = await stripeFetch<StripePortalSession>(
      "billing_portal/sessions",
      {
        method: "POST",
        body: params.toString()
      }
    );

    if (!portalSession.url) {
      throw new Error("Stripe Billing Portal response did not include a URL");
    }

    return Response.json({
      portalSessionId: portalSession.id,
      url: portalSession.url
    });
  } catch (error) {
    return unexpectedApiErrorResponse({
      error,
      logMessage: "Failed to create Stripe Billing Portal session",
      message:
        "プラン管理画面を開けませんでした。時間をおいてもう一度お試しください。"
    });
  }
}
