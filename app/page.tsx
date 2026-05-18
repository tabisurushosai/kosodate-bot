import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MessageCircle, Sparkles } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  description:
    "不登校や発達特性に関する悩みを、教育心理・発達心理の視点で整理し、具体的な声かけにつなげるAI相談サービスです。",
  path: "/"
});

export default function Home() {
  const features = [
    {
      title: "声かけ例を3パターンで提案",
      body: "子どもの状態を決めつけず、今日使える短い言葉から少し踏み込んだ関わり方まで整理します。"
    },
    {
      title: "プロファイルを相談に反映",
      body: "年齢、特性、興味、苦手、最近の変化を踏まえて、その子に合わせた返答につなげます。"
    },
    {
      title: "履歴とタグで振り返り",
      body: "相談内容を時系列とテーマで残し、同じ悩みが続くときも前回の整理を見失いません。"
    }
  ];

  const plans = [
    {
      name: "無料プラン",
      price: "0円",
      summary: "まずは月3回まで試したい方向け",
      points: ["月3回まで相談", "相談履歴は7日間保存", "1回1,500トークン以内"]
    },
    {
      name: "有料プラン",
      price: "月額980円",
      summary: "継続して家庭で使いたい方向け",
      points: [
        "月30回まで相談",
        "相談履歴を無期限保存",
        "過去の相談とプロファイルを反映",
        "毎週月曜に声かけのヒントを自動生成"
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-white/85 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <BrandLogo />
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            href="/login"
          >
            申込・ログイン
          </Link>
        </div>
      </header>

      <section className="border-b border-border px-5">
        <div className="mx-auto grid min-h-[82vh] max-w-6xl items-center gap-10 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-18">
          <div>
            <BrandLogo className="mb-8 lg:hidden" showText={false} />
            <p className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              不登校・発達特性の悩みに寄り添うAI相談
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Kosodate Bot
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              教育心理・発達心理の視点で、保護者と支援者の相談を整理します。子どもを責めない言葉選びと、次に試せる具体的な声かけをいつでも確認できます。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                href="/login"
              >
                無料で相談を始める
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-white px-6 text-base font-semibold text-slate-900 transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                href="#pricing"
              >
                料金を見る
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  今日の相談
                </p>
                <p className="text-xs text-slate-500">AI相談プレビュー</p>
              </div>
            </div>
            <div className="space-y-4 pt-5">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm leading-6 text-slate-700">
                  「学校に行きたくない」と言われた朝、どう返したらいいですか？
                </p>
              </div>
              <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
                <p className="text-sm font-semibold text-slate-950">
                  まずは気持ちの確認から
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  「行きたくないくらい、今日はしんどいんだね。何が一番重たい感じ？」のように、登校の判断より先に負荷を言葉にします。
                </p>
              </div>
              <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
                <p className="text-sm font-semibold text-slate-950">
                  選択肢を小さくする
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  「玄関まで」「先生に連絡だけ」など、達成しやすい一歩を一緒に選びます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-normal text-slate-950">
              相談を、次の行動に変えるための機能
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              その場の返答だけで終わらせず、子どもの状態や過去の相談を踏まえて継続的に使える相談環境を用意しています。
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                className="rounded-lg border border-border bg-white p-6"
                key={feature.title}
              >
                <h3 className="text-base font-semibold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white px-5 py-16" id="pricing">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-normal text-slate-950">
                料金
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
                無料では月3回まで相談できます。継続利用では履歴とプロファイルを活用できる有料プランを選べます。
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              href="/login"
            >
              申込へ進む
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {plans.map((plan) => (
              <article
                className="rounded-lg border border-border bg-background p-6"
                key={plan.name}
              >
                <h3 className="text-xl font-bold text-slate-950">
                  {plan.name}
                </h3>
                <p className="mt-3 text-3xl font-bold text-primary">
                  {plan.price}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {plan.summary}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.points.map((point) => (
                    <li
                      className="flex gap-3 text-sm leading-6 text-slate-700"
                      key={point}
                    >
                      <Check
                        className="mt-0.5 h-5 w-5 flex-none text-primary"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-lg border border-border bg-slate-950 p-7 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-normal">
              まずは無料プランで相談を始める
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
              Googleまたはメールでログインし、月3回までAI相談を試せます。
            </p>
          </div>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-base font-semibold text-slate-950 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
            href="/login"
          >
            申込・ログイン
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
