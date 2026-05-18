import { ChatClient } from "./chat-client";
import { createPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = createPageMetadata({
  title: "AI相談",
  description:
    "不登校や発達特性に関する今日の困りごとを入力し、具体的な声かけ例を受け取れます。",
  path: "/chat",
  noIndex: true
});

export default function ChatPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <p className="text-sm font-semibold text-primary">AI相談</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-950">
          今日の困りごとを相談する
        </h1>
      </header>

      <ChatClient />
    </div>
  );
}
