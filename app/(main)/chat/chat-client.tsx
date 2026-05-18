"use client";

import { Loader2, Send } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

import { readApiJson } from "@/lib/client-api";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  isStreaming?: boolean;
};

type ChatResponse = {
  response?: string;
  usageRemaining?: number;
  error?: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "相談したいことを入力してください。状況を整理しながら、次に試せる声かけを一緒に考えます。"
  }
];

const createMessageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `message_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const streamText = (
  text: string,
  onUpdate: (content: string, done: boolean) => void
) => {
  let index = 0;
  const chunkSize = 4;

  const intervalId = window.setInterval(() => {
    index = Math.min(index + chunkSize, text.length);
    onUpdate(text.slice(0, index), index >= text.length);

    if (index >= text.length) {
      window.clearInterval(intervalId);
    }
  }, 18);

  return () => window.clearInterval(intervalId);
};

export function ChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const streamCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(
    () => () => {
      streamCleanupRef.current?.();
    },
    []
  );

  const submitMessage = async () => {
    const message = input.trim();

    if (!message || isSubmitting) {
      return;
    }

    streamCleanupRef.current?.();
    setError(null);
    setInput("");
    setIsSubmitting(true);

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: message
    };
    const assistantMessageId = createMessageId();

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        isStreaming: true
      }
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });
      const data = await readApiJson<ChatResponse>(
        response,
        "相談の送信に失敗しました。"
      );

      if (!data.response) {
        throw new Error("相談の返答を取得できませんでした。");
      }

      if (typeof data.usageRemaining === "number") {
        setUsageRemaining(data.usageRemaining);
      }

      streamCleanupRef.current = streamText(data.response, (content, done) => {
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantMessageId
              ? { ...item, content, isStreaming: !done }
              : item
          )
        );

        if (done) {
          streamCleanupRef.current = null;
        }
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "相談の送信に失敗しました。";

      setError(message);
      setMessages((current) =>
        current.filter((item) => item.id !== assistantMessageId)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage();
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submitMessage();
    }
  };

  return (
    <section className="flex flex-1 flex-col px-4 py-5 sm:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <div
          className="flex-1 space-y-4 overflow-y-auto pb-2"
          aria-live="polite"
        >
          {messages.map((message) => (
            <div
              className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              key={message.id}
            >
              <div
                className={cn(
                  "max-w-[82%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6 shadow-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-slate-200 bg-white text-slate-700"
                )}
              >
                {message.content || (
                  <span className="inline-flex items-center gap-2 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    考えています
                  </span>
                )}
                {message.isStreaming && message.content ? (
                  <span className="ml-0.5 inline-block h-4 w-1 translate-y-0.5 animate-pulse rounded-full bg-slate-400" />
                ) : null}
              </div>
            </div>
          ))}
          <div ref={scrollAnchorRef} />
        </div>

        {usageRemaining !== null ? (
          <p className="mt-4 text-right text-xs text-slate-500">
            今月の残り相談回数: {usageRemaining}回
          </p>
        ) : null}

        {error ? (
          <div
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <form
          className="mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="message">
            相談内容
          </label>
          <textarea
            className="min-h-28 w-full resize-none rounded-md border-0 bg-transparent p-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
            disabled={isSubmitting}
            id="message"
            name="message"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="例: 子どもが朝になるとお腹が痛いと言います。どう受け止めればよいですか？"
            value={input}
          />
          <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              具体的な状況ほど返答が実用的になります。
            </p>
            <button
              className="flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting || input.trim().length === 0}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              送信
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
