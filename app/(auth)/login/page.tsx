import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = createPageMetadata({
  title: "ログイン",
  description:
    "Kosodate Botにログインして、不登校や発達特性に関する悩みをAIに相談できます。",
  path: "/login",
  noIndex: true
});

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-10 lg:grid-cols-[1fr_420px]">
        <section className="max-w-2xl">
          <BrandLogo />
          <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
            相談したい瞬間に、次の声かけを整理する
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            不登校や発達特性に関する悩みを、批判せず受け止めながら具体的な行動につなげるための相談スペースです。
          </p>
          <div className="mt-8 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              声かけ例を3パターンで確認
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              相談履歴をあとから振り返り
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              子どもの特徴を相談に反映
            </div>
          </div>
        </section>
        <Suspense
          fallback={
            <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
              <div className="h-6 w-28 rounded bg-slate-100" />
              <div className="mt-4 h-8 w-56 rounded bg-slate-100" />
              <div className="mt-8 h-11 rounded bg-slate-100" />
              <div className="mt-4 h-11 rounded bg-slate-100" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
