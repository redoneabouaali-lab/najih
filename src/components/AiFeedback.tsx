"use client";

import { useState } from "react";

type Props = { question: string; lang: "ar" | "fr" };

export function AiFeedback({ question, lang }: Props) {
  const [v, setV] = useState<"good" | "bad" | null>(null);
  if (!question) return null;

  const send = (good: boolean) => {
    if (v) return;
    setV(good ? "good" : "bad");
    void fetch("/api/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, good }),
    }).catch(() => {});
  };

  return (
    <div className="flex items-center gap-1.5 mt-1.5" aria-live="polite">
      <span className="mono text-[9px] uppercase tracking-[.12em] text-[var(--l)]">
        {lang === "ar" ? "مفيد؟" : "utile ?"}
      </span>
      <button
        type="button"
        onClick={() => send(true)}
        aria-label="good"
        className={`grid place-items-center w-7 h-7 rounded-lg text-sm border transition-all active:scale-90 ${
          v === "good"
            ? "bg-emerald-100 border-emerald-300"
            : "border-[var(--p)] bg-transparent hover:bg-emerald-50"
        }`}
      >
        👍
      </button>
      <button
        type="button"
        onClick={() => send(false)}
        aria-label="bad"
        className={`grid place-items-center w-7 h-7 rounded-lg text-sm border transition-all active:scale-90 ${
          v === "bad"
            ? "bg-rose-100 border-rose-300"
            : "border-[var(--p)] bg-transparent hover:bg-rose-50"
        }`}
      >
        👎
      </button>
    </div>
  );
}