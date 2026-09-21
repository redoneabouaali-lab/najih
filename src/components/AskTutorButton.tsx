"use client";

import { openAssistant } from "@/lib/assist";

export function AskTutorButton({
  lang,
  promptAr,
  promptFr,
  contextAr,
  contextFr,
  labelAr,
  labelFr,
  className = "",
}: {
  lang: "ar" | "fr";
  promptAr: string;
  promptFr: string;
  contextAr?: string;
  contextFr?: string;
  labelAr: string;
  labelFr: string;
  className?: string;
}) {
  const send = () =>
    openAssistant({
      prompt: lang === "ar" ? promptAr : promptFr,
      context: lang === "ar" ? contextAr : contextFr,
    });
  return (
    <button type="button" onClick={send} className={className || "btn btn-ghost"}>
      🦉 {lang === "ar" ? labelAr : labelFr}
    </button>
  );
}