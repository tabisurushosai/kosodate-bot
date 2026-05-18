import { listChildProfilesByUser } from "@/lib/child-profiles";
import { createClaudeResponse } from "@/lib/claude";
import { listRecentConsultationHistoriesByUser } from "@/lib/consultations";
import { kv, type JsonValue } from "@/lib/db";
import { createWeeklyHintPrompt, WEEKLY_HINT_SYSTEM_PROMPT } from "@/lib/prompts";
import type { AppUser } from "@/lib/users";

export type WeeklyHint = {
  id: string;
  user_id: string;
  week_start: string;
  content: string;
  model: string;
  created_at: string;
};

type StoredWeeklyHint = WeeklyHint & { [key: string]: JsonValue };

const weeklyHintKey = (userId: string, weekStart: string) =>
  `weekly_hint:${userId}:${weekStart}`;
const userWeeklyHintWeeksKey = (userId: string) =>
  `user:${userId}:weekly_hint_weeks`;

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const getTokyoWeekStartDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!year || !month || !day) {
    throw new Error("Failed to determine Tokyo week start");
  }

  const tokyoDateAsUtc = new Date(Date.UTC(year, month - 1, day));
  const daysSinceMonday = (tokyoDateAsUtc.getUTCDay() + 6) % 7;
  tokyoDateAsUtc.setUTCDate(tokyoDateAsUtc.getUTCDate() - daysSinceMonday);

  return formatDateKey(tokyoDateAsUtc);
};

const isWeeklyHint = (value: unknown): value is WeeklyHint => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const hint = value as Partial<WeeklyHint>;

  return (
    typeof hint.id === "string" &&
    typeof hint.user_id === "string" &&
    typeof hint.week_start === "string" &&
    typeof hint.content === "string" &&
    typeof hint.model === "string" &&
    typeof hint.created_at === "string"
  );
};

const assertValidWeeklyHint = (value: unknown, key: string): WeeklyHint => {
  if (!isWeeklyHint(value)) {
    throw new Error(`Invalid weekly hint record in KV: ${key}`);
  }

  return value;
};

export const getWeeklyHintByUserAndWeek = async (
  userId: string,
  weekStart = getTokyoWeekStartDate()
): Promise<WeeklyHint | null> => {
  const key = weeklyHintKey(userId, weekStart);
  const hint = await kv.get<StoredWeeklyHint>(key);

  return hint ? assertValidWeeklyHint(hint, key) : null;
};

export const saveWeeklyHint = async (hint: WeeklyHint): Promise<WeeklyHint> => {
  const normalizedHint: WeeklyHint = {
    ...hint,
    content: hint.content.trim()
  };

  await kv.set(
    weeklyHintKey(normalizedHint.user_id, normalizedHint.week_start),
    normalizedHint as StoredWeeklyHint
  );

  const weeksKey = userWeeklyHintWeeksKey(normalizedHint.user_id);
  const existingWeeks = (await kv.get<string[]>(weeksKey)) ?? [];
  const nextWeeks = [
    normalizedHint.week_start,
    ...existingWeeks.filter((week) => week !== normalizedHint.week_start)
  ];

  await kv.set(weeksKey, nextWeeks);

  return normalizedHint;
};

export const generateWeeklyHintForUser = async (
  user: AppUser,
  weekStart = getTokyoWeekStartDate()
) => {
  const existingHint = await getWeeklyHintByUserAndWeek(user.id, weekStart);

  if (existingHint) {
    return { hint: existingHint, generated: false };
  }

  const [childProfiles, recentHistories] = await Promise.all([
    listChildProfilesByUser(user.id),
    listRecentConsultationHistoriesByUser(user.id, 3)
  ]);
  const childProfile = childProfiles[0] ?? null;
  const claudeResponse = await createClaudeResponse({
    system: WEEKLY_HINT_SYSTEM_PROMPT,
    maxTokens: 900,
    messages: [
      {
        role: "user",
        content: createWeeklyHintPrompt({
          childProfile,
          recentHistories,
          weekStart
        })
      }
    ]
  });

  const hint = await saveWeeklyHint({
    id: `${user.id}:${weekStart}`,
    user_id: user.id,
    week_start: weekStart,
    content: claudeResponse.text,
    model: claudeResponse.model,
    created_at: new Date().toISOString()
  });

  return { hint, generated: true };
};
