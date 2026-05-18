import { Clock, Search, X } from "lucide-react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import {
  findConsultationHistoriesByTag,
  listConsultationHistoriesByUser
} from "@/lib/consultations";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "相談履歴",
  description:
    "過去のAI相談を時系列やタグで振り返り、保護者の声かけや支援の流れを確認できます。",
  path: "/history",
  noIndex: true
});

type HistoryPageProps = {
  searchParams?: {
    tag?: string;
  };
};

const normalizeTag = (tag: string) => tag.trim().replace(/^#/, "");

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo"
  }).format(new Date(value));

const truncate = (text: string, maxLength: number) => {
  const normalizedText = text.trim();

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, maxLength)}...`;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const activeTag = normalizeTag(searchParams?.tag ?? "");
  const histories = await listConsultationHistoriesByUser(userId);
  const filteredHistories = activeTag
    ? await findConsultationHistoriesByTag(userId, activeTag)
    : histories;
  const tags = Array.from(
    new Set(histories.flatMap((history) => history.tags))
  ).sort((a, b) => a.localeCompare(b, "ja"));

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <p className="text-sm font-semibold text-primary">相談履歴</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-950">
          過去の相談を振り返る
        </h1>
      </header>

      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-5">
          <form
            action="/history"
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <label
              className="text-sm font-semibold text-slate-800"
              htmlFor="tag"
            >
              タグ検索
            </label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  defaultValue={activeTag}
                  id="tag"
                  name="tag"
                  placeholder="例: 学校復帰"
                  type="search"
                />
              </div>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                type="submit"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                検索
              </button>
              {activeTag ? (
                <Link
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  href="/history"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  解除
                </Link>
              ) : null}
            </div>

            {tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                      tag === activeTag
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                    }`}
                    href={`/history?tag=${encodeURIComponent(tag)}`}
                    key={tag}
                    aria-current={tag === activeTag ? "page" : undefined}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            ) : null}
          </form>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {activeTag ? (
                <>
                  <span className="font-semibold text-slate-950">#{activeTag}</span>
                  {" の相談 "}
                </>
              ) : (
                "すべての相談 "
              )}
              {filteredHistories.length}件
            </p>
          </div>

          {filteredHistories.length > 0 ? (
            <div className="space-y-3">
              {filteredHistories.map((history) => (
                <article
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  key={history.id}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        <time dateTime={history.created_at}>
                          {formatDateTime(history.created_at)}
                        </time>
                      </div>
                      <h2 className="mt-3 text-base font-bold leading-7 text-slate-950">
                        {truncate(history.message, 90)}
                      </h2>
                    </div>

                    {history.tags.length > 0 ? (
                      <div className="flex shrink-0 flex-wrap gap-2 sm:max-w-56 sm:justify-end">
                        {history.tags.map((tag) => (
                          <Link
                            className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:text-primary"
                            href={`/history?tag=${encodeURIComponent(tag)}`}
                            key={tag}
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-500">
                        相談内容
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {history.message}
                      </p>
                    </div>
                    <div className="rounded-md bg-emerald-50 p-3">
                      <p className="text-xs font-semibold text-slate-500">
                        AIからの返答
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {truncate(history.response, 280)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
              <p className="text-base font-semibold text-slate-950">
                {activeTag
                  ? `#${activeTag} の相談履歴はありません`
                  : "相談履歴はまだありません"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {activeTag
                  ? "別のタグで検索するか、タグを解除してすべての相談を確認してください。"
                  : "AI相談を送信すると、ここに時系列で保存されます。"}
              </p>
              {activeTag ? (
                <Link
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  href="/history"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  タグを解除
                </Link>
              ) : (
                <Link
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  href="/chat"
                >
                  AI相談へ
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
