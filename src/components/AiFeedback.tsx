"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

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
      <span className="mono text-[9px] uppercase tracking-[.12em] text-[var(--ink-3)]">
        {lang === "ar" ? "مفيد؟" : "utile ?"}
      </span>
      <button
        type="button"
        onClick={() => send(true)}
        aria-label="good"
        className={`grid place-items-center w-8 h-8 rounded-[var(--r-sm)] border transition-colors duration-200 ${
          v === "good"
            ? "bg-[var(--brand-tint)] border-[var(--brand)] text-[var(--brand)]"
            : "border-[var(--line)] bg-transparent text-[var(--ink-3)] hover:bg-[var(--surface-sunk)]"
        }`}
      >
        <Icon name="thumbsUp" size={15} />
      </button>
      <button
        type="button"
        onClick={() => send(false)}
        aria-label="bad"
        className={`grid place-items-center w-8 h-8 rounded-[var(--r-sm)] border transition-colors duration-200 ${
          v === "bad"
            ? "bg-[var(--brand-tint)] border-[var(--brand)] text-[var(--brand)]"
            : "border-[var(--line)] bg-transparent text-[var(--ink-3)] hover:bg-[var(--surface-sunk)]"
        }`}
      >
        <Icon name="thumbsDown" size={15} />
      </button>
    </div>
  );
}