"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function MainError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled main page error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-red-700">
              エラーが発生しました
            </p>
            <h1 className="mt-1 text-xl font-bold text-slate-950">
              この画面を表示できませんでした
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              データの取得に失敗した可能性があります。再読み込みしても解消しない場合は、時間をおいてお試しください。
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={reset}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            再読み込み
          </button>
          <Link
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            href="/dashboard"
          >
            ダッシュボードへ
          </Link>
        </div>
      </section>
    </div>
  );
}
