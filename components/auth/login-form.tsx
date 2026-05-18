"use client";

import { Loader2, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const authErrorMessages: Record<string, string> = {
  OAuthSignin: "Googleログインの開始に失敗しました。時間をおいて再度お試しください。",
  OAuthCallback: "Google認証の確認に失敗しました。もう一度ログインしてください。",
  OAuthCreateAccount: "Googleアカウントの登録に失敗しました。",
  EmailCreateAccount: "メールアカウントの登録に失敗しました。",
  Callback: "認証処理に失敗しました。もう一度ログインしてください。",
  OAuthAccountNotLinked:
    "同じメールアドレスの別ログイン方法があります。以前の方法でログインしてください。",
  EmailSignin: "メール送信に失敗しました。メールアドレスを確認してください。",
  CredentialsSignin: "ログイン情報が正しくありません。",
  SessionRequired: "続行するにはログインしてください。",
  default: "ログインに失敗しました。時間をおいて再度お試しください。"
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/chat";
  const error = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const authError = useMemo(() => {
    if (!error) {
      return null;
    }

    return authErrorMessages[error] ?? authErrorMessages.default;
  }, [error]);

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl });
  };

  const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setEmailSent(false);

    if (!email.trim()) {
      setFormError("メールアドレスを入力してください。");
      return;
    }

    setIsEmailLoading(true);
    const result = await signIn("email", {
      email: email.trim(),
      callbackUrl,
      redirect: false
    });

    setIsEmailLoading(false);

    if (result?.error) {
      setFormError(authErrorMessages.EmailSignin);
      return;
    }

    setEmailSent(true);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold text-primary">ログイン</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-950">
          Kosodate Botをはじめる
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Googleアカウント、またはメールリンクでログインできます。
        </p>
      </div>

      {(authError || formError) && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {formError ?? authError}
        </div>
      )}

      {emailSent && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          ログインリンクを送信しました。メールをご確認ください。
        </div>
      )}

      <div className="mt-6 space-y-4">
        <button
          className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isGoogleLoading || isEmailLoading}
          type="button"
          onClick={handleGoogleSignIn}
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-xs font-bold">
              G
            </span>
          )}
          Googleでログイン
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-slate-200" />
          <span>または</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form className="space-y-3" onSubmit={handleEmailSignIn}>
          <label className="block text-sm font-medium text-slate-800" htmlFor="email">
            メールアドレス
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <button
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isGoogleLoading || isEmailLoading}
            type="submit"
          >
            {isEmailLoading && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            メールリンクを送信
          </button>
        </form>
      </div>
    </div>
  );
}
