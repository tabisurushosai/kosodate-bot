import {
  CalendarDays,
  CreditCard,
  Mail,
  MessageCircle,
  ShieldCheck,
  UserRound
} from "lucide-react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import {
  calculateUsageRemaining,
  getUserById,
  PLAN_MONTHLY_LIMITS,
  resetUserUsageForCurrentMonth
} from "@/lib/users";
import { createPageMetadata } from "@/lib/seo";

import { LogoutButton } from "./logout-button";
import { PlanSwitcher } from "./plan-switcher";

export const dynamic = 'force-dynamic';


export const metadata: Metadata = createPageMetadata({
  title: "設定",
  description:
    "Kosodate Botのアカウント情報、利用中のプラン、月次相談回数、ログアウト操作を確認できます。",
  path: "/settings",
  noIndex: true
});

const planLabels = {
  free: "無料プラン",
  paid: "有料プラン"
} as const;

const planDescriptions = {
  free: "月3回まで相談できます。相談履歴は7日間保存されます。",
  paid: "月30回まで相談できます。履歴参照、プロファイル連携、週次ヒントを利用できます。"
} as const;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeZone: "Asia/Tokyo"
  }).format(new Date(value));

const formatMonth = (month: string) => {
  const [year, monthNumber] = month.split("-");

  return `${year}年${Number(monthNumber)}月`;
};

export default async function SettingsPage() {
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
  const usageLimit = PLAN_MONTHLY_LIMITS[user.plan];
  const usageRemaining = calculateUsageRemaining(user);
  const usagePercent = Math.min((user.usage_count / usageLimit) * 100, 100);
  const displayEmail = session.user?.email ?? user.email;
  const displayName = session.user?.name ?? "未設定";

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <p className="text-sm font-semibold text-primary">設定</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-950">
          アカウントとプランを確認する
        </h1>
      </header>

      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-bold leading-7 text-slate-950">
                    アカウント
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    ログイン中のアカウント情報です。
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    メールアドレス
                  </dt>
                  <dd className="mt-2 break-all text-sm font-semibold text-slate-950">
                    {displayEmail}
                  </dd>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    表示名
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-slate-950">
                    {displayName}
                  </dd>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    登録日
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-slate-950">
                    {formatDate(user.created_at)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                    <CreditCard className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold leading-7 text-slate-950">
                      プラン
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      現在の利用枠と月次カウントです。
                    </p>
                  </div>
                </div>
                <span className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground">
                  {planLabels[user.plan]}
                </span>
              </div>

              <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">
                  {planDescriptions[user.plan]}
                </p>
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>{formatMonth(user.usage_reset_month)}</span>
                    <span>
                      残り {usageRemaining} / {usageLimit}回
                    </span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <PlanSwitcher currentPlan={user.plan} />
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                今月の相談
              </div>
              <p className="mt-4 text-4xl font-bold text-slate-950">
                {usageRemaining}
                <span className="ml-2 text-base font-semibold text-slate-500">
                  回
                </span>
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                上限 {usageLimit}回のうち、{user.usage_count}回利用済みです。
              </p>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">
                セッション
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                共有端末では、利用後にログアウトしてください。
              </p>
              <div className="mt-5">
                <LogoutButton />
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}
