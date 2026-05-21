import {
  BarChart3,
  CalendarDays,
  History,
  MessageCircle,
  Sparkles,
  Tags
} from "lucide-react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { listConsultationHistoriesByUser } from "@/lib/consultations";
import {
  calculateUsageRemaining,
  getUserById,
  PLAN_MONTHLY_LIMITS,
  resetUserUsageForCurrentMonth
} from "@/lib/users";
import {
  getTokyoWeekStartDate,
  getWeeklyHintByUserAndWeek
} from "@/lib/weekly-hints";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = 'force-dynamic';


export const metadata: Metadata = createPageMetadata({
  title: "ダッシュボード",
  description:
    "今月の残り相談回数、よく相談しているテーマ、今週の声かけのヒントを確認できます。",
  path: "/dashboard",
  noIndex: true
});

const planLabel = {
  free: "無料プラン",
  paid: "有料プラン"
} as const;

const formatMonth = (month: string) => {
  const [year, monthNumber] = month.split("-");

  return `${year}年${Number(monthNumber)}月`;
};

const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");

  return `${year}年${Number(month)}月${Number(day)}日`;
};

const getTagStats = (tags: string[]) => {
  const counts = tags.reduce<Record<string, number>>((accumulator, tag) => {
    accumulator[tag] = (accumulator[tag] ?? 0) + 1;

    return accumulator;
  }, {});

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "ja"));
};

const getTagClassName = (count: number, maxCount: number) => {
  const ratio = maxCount > 0 ? count / maxCount : 0;

  if (ratio >= 0.75) {
    return "bg-primary text-primary-foreground text-base";
  }

  if (ratio >= 0.45) {
    return "bg-emerald-100 text-emerald-800 text-sm";
  }

  return "bg-secondary text-slate-700 text-xs";
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const storedUser = await getUserById(userId);

  if (!storedUser) {
    redirect("/login");
  }

  const user = await resetUserUsageForCurrentMonth(storedUser);
  const currentWeekStart = getTokyoWeekStartDate();
  const [histories, weeklyHint] = await Promise.all([
    listConsultationHistoriesByUser(userId),
    getWeeklyHintByUserAndWeek(userId, currentWeekStart)
  ]);
  const usageLimit = PLAN_MONTHLY_LIMITS[user.plan];
  const usageRemaining = calculateUsageRemaining(user);
  const usagePercent = Math.min((user.usage_count / usageLimit) * 100, 100);
  const tagStats = getTagStats(histories.flatMap((history) => history.tags));
  const topTags = tagStats.slice(0, 12);
  const maxTagCount = topTags[0]?.count ?? 0;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <p className="text-sm font-semibold text-primary">ダッシュボード</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-950">
          今月の相談状況を確認する
        </h1>
      </header>

      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    今月の残り相談回数
                  </div>
                  <p className="mt-4 text-4xl font-bold text-slate-950">
                    {usageRemaining}
                    <span className="ml-2 text-base font-semibold text-slate-500">
                      / {usageLimit}回
                    </span>
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {formatMonth(user.usage_reset_month)}の利用状況です。
                  </p>
                </div>
                <Link
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  href="/chat"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  相談する
                </Link>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>利用済み {user.usage_count}回</span>
                  <span>{planLabel[user.plan]}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <History className="h-4 w-4" aria-hidden="true" />
                相談履歴
              </div>
              <p className="mt-4 text-4xl font-bold text-slate-950">
                {histories.length}
                <span className="ml-2 text-base font-semibold text-slate-500">
                  件
                </span>
              </p>
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                href="/history"
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                履歴を見る
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  今週の声かけのヒント
                </div>
                <h2 className="mt-2 text-lg font-bold text-slate-950">
                  {formatDate(currentWeekStart)}週
                </h2>
              </div>
              {user.plan === "free" ? (
                <Link
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  href="/settings"
                >
                  プランを確認
                </Link>
              ) : null}
            </div>

            {user.plan === "paid" && weeklyHint ? (
              <div className="mt-5 rounded-md bg-emerald-50 px-4 py-4">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-800">
                  {weeklyHint.content}
                </p>
              </div>
            ) : user.plan === "paid" ? (
              <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-950">
                  今週のヒントはまだ生成されていません
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  毎週月曜朝の自動配信後に、ここへ表示されます。
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-950">
                  有料プランで週次ヒントを利用できます
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  子どものプロファイルと相談履歴をもとに、毎週の声かけのヒントを表示します。
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Tags className="h-4 w-4" aria-hidden="true" />
                  よく相談しているテーマ
                </div>
                <h2 className="mt-2 text-lg font-bold text-slate-950">
                  タグから見る相談傾向
                </h2>
              </div>
              <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>

            {topTags.length > 0 ? (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {topTags.map(({ tag, count }) => (
                  <Link
                    className={`rounded-md px-3 py-2 font-semibold transition hover:opacity-85 ${getTagClassName(
                      count,
                      maxTagCount
                    )}`}
                    href={`/history?tag=${encodeURIComponent(tag)}`}
                    key={tag}
                  >
                    #{tag}
                    <span className="ml-1 opacity-75">{count}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-950">
                  テーマ集計はまだありません
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  タグ付きの相談履歴が増えると、ここに多いテーマが表示されます。
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
