"use client";

import { CheckCircle2, CreditCard, Loader2, Settings2 } from "lucide-react";
import { useState } from "react";

import { readApiJson } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import type { UserPlan } from "@/lib/users";

type StripeRedirectResponse = {
  url?: string;
  error?: string;
};

type PlanSwitcherProps = {
  currentPlan: UserPlan;
};

const paidFeatures = [
  "月30回まで相談",
  "相談履歴を無期限保存",
  "プロファイルと過去履歴を相談に反映",
  "週次の声かけヒント"
];

const freeFeatures = ["月3回まで相談", "相談履歴を7日間保存"];

export function PlanSwitcher({ currentPlan }: PlanSwitcherProps) {
  const [action, setAction] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectToStripe = async (endpoint: string, nextAction: "checkout" | "portal") => {
    setAction(nextAction);
    setError(null);

    try {
      const response = await fetch(endpoint, { method: "POST" });
      const data = await readApiJson<StripeRedirectResponse>(
        response,
        "Stripeの画面を開けませんでした。"
      );

      if (!data.url) {
        throw new Error("Stripeの画面を開けませんでした。");
      }

      window.location.assign(data.url);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Stripeの画面を開けませんでした。"
      );
      setAction(null);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <PlanCard
          buttonLabel="現在のプラン"
          description="まず相談を試したい方向けの基本プランです。"
          disabled
          features={freeFeatures}
          isCurrent={currentPlan === "free"}
          name="無料プラン"
          price="0円"
        />

        <PlanCard
          buttonLabel={
            currentPlan === "paid"
              ? action === "portal"
                ? "開いています"
                : "変更・解約"
              : action === "checkout"
                ? "移動しています"
                : "有料プランに切り替え"
          }
          description="相談回数と履歴活用を増やしたい方向けの月額プランです。"
          disabled={action !== null}
          features={paidFeatures}
          icon={currentPlan === "paid" ? "settings" : "card"}
          isCurrent={currentPlan === "paid"}
          name="有料プラン"
          onClick={() =>
            void redirectToStripe(
              currentPlan === "paid"
                ? "/api/stripe/portal"
                : "/api/stripe/checkout",
              currentPlan === "paid" ? "portal" : "checkout"
            )
          }
          price="980円 / 月"
          showSpinner={action !== null}
        />
      </div>

      {error ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}

type PlanCardProps = {
  buttonLabel: string;
  description: string;
  disabled?: boolean;
  features: string[];
  icon?: "card" | "settings";
  isCurrent: boolean;
  name: string;
  onClick?: () => void;
  price: string;
  showSpinner?: boolean;
};

function PlanCard({
  buttonLabel,
  description,
  disabled = false,
  features,
  icon = "card",
  isCurrent,
  name,
  onClick,
  price,
  showSpinner = false
}: PlanCardProps) {
  const ButtonIcon = icon === "settings" ? Settings2 : CreditCard;

  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-4",
        isCurrent ? "border-primary shadow-sm" : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-950">{name}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {isCurrent ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            利用中
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-950">
        {price}
      </p>

      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        {features.map((feature) => (
          <li className="flex items-start gap-2" key={feature}>
            <CheckCircle2
              className="mt-1 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={cn(
          "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70",
          isCurrent && !onClick
            ? "border border-slate-200 bg-slate-50 text-slate-500"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {showSpinner ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ButtonIcon className="h-4 w-4" aria-hidden="true" />
        )}
        {buttonLabel}
      </button>
    </article>
  );
}
