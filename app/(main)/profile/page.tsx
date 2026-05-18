import { CheckCircle2, Save, UserRound } from "lucide-react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import {
  createChildProfile,
  getChildProfileById,
  listChildProfilesByUser,
  updateChildProfile
} from "@/lib/child-profiles";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "子どもプロファイル",
  description:
    "子どもの年齢、興味、苦手、最近の様子を保存し、AI相談の背景情報として活用できます。",
  path: "/profile",
  noIndex: true
});

type ProfilePageProps = {
  searchParams?: {
    saved?: string;
  };
};

const parseTextList = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(/[\n,、]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const parseAge = (value: FormDataEntryValue | null) => {
  const age = Number(value);

  if (!Number.isInteger(age) || age < 0 || age > 30) {
    throw new Error("年齢は0から30までの整数で入力してください。");
  }

  return age;
};

async function saveProfile(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const profileId = String(formData.get("profileId") ?? "");
  const input = {
    age: parseAge(formData.get("age")),
    notes: String(formData.get("notes") ?? ""),
    interests: parseTextList(formData.get("interests")),
    difficulties: parseTextList(formData.get("difficulties"))
  };

  if (profileId) {
    const profile = await getChildProfileById(profileId);

    if (!profile || profile.user_id !== userId) {
      throw new Error("更新対象のプロファイルが見つかりません。");
    }

    await updateChildProfile(profileId, input);
  } else {
    await createChildProfile({
      user_id: userId,
      ...input
    });
  }

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const profiles = await listChildProfilesByUser(userId);
  const profile = profiles[0] ?? null;
  const isSaved = searchParams?.saved === "1";

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <p className="text-sm font-semibold text-primary">
          子どもプロファイル
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-950">
          相談に使う情報を編集する
        </h1>
      </header>

      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <form
            action={saveProfile}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <input name="profileId" type="hidden" value={profile?.id ?? ""} />

            {isSaved ? (
              <div
                className="mb-5 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                role="status"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                プロファイルを保存しました。
              </div>
            ) : null}

            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold leading-7 text-slate-950">
                  基本情報
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  AI相談時の背景情報として使うため、必要な範囲で記録します。
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <label
                  className="text-sm font-semibold text-slate-800"
                  htmlFor="age"
                >
                  年齢
                </label>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-40"
                  defaultValue={profile?.age ?? ""}
                  id="age"
                  inputMode="numeric"
                  min={0}
                  max={30}
                  name="age"
                  placeholder="例: 9"
                  required
                  type="number"
                />
              </div>

              <div>
                <label
                  className="text-sm font-semibold text-slate-800"
                  htmlFor="interests"
                >
                  興味・好きなこと
                </label>
                <textarea
                  className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  defaultValue={profile?.interests.join("\n") ?? ""}
                  id="interests"
                  name="interests"
                  placeholder="例: 電車&#10;工作&#10;図鑑"
                />
              </div>

              <div>
                <label
                  className="text-sm font-semibold text-slate-800"
                  htmlFor="difficulties"
                >
                  苦手なこと・配慮が必要なこと
                </label>
                <textarea
                  className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  defaultValue={profile?.difficulties.join("\n") ?? ""}
                  id="difficulties"
                  name="difficulties"
                  placeholder="例: 大きな音&#10;予定変更&#10;朝の支度"
                />
              </div>

              <div>
                <label
                  className="text-sm font-semibold text-slate-800"
                  htmlFor="notes"
                >
                  最近の様子・診断名など
                </label>
                <textarea
                  className="mt-2 min-h-36 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  defaultValue={profile?.notes ?? ""}
                  id="notes"
                  name="notes"
                  placeholder="例: 2学期から登校しぶりが増えている。ASD傾向があり、見通しがあると安心しやすい。"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                type="submit"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                保存する
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-bold text-slate-950">保存状況</p>
              <p className="mt-3 text-2xl font-bold text-primary">
                {profile ? "登録済み" : "未登録"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                有料プランでは、相談時にこの内容を自動で参照します。
              </p>
            </div>

            {profile ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-950">現在の要約</p>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-500">年齢</dt>
                    <dd className="mt-1 text-slate-900">{profile.age}歳</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">興味</dt>
                    <dd className="mt-1 text-slate-900">
                      {profile.interests.length > 0
                        ? profile.interests.join("、")
                        : "未入力"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">苦手</dt>
                    <dd className="mt-1 text-slate-900">
                      {profile.difficulties.length > 0
                        ? profile.difficulties.join("、")
                        : "未入力"}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </div>
  );
}
