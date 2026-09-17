"use client";

import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/lang";
import { setClientLang } from "@/lib/lang";

export function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        setClientLang(lang === "ar" ? "fr" : "ar");
        router.refresh();
      }}
      className="mono !text-[11px] !font-bold tracking-widest px-4 py-2 rounded-full border border-[var(--p)] text-[var(--m)] hover:border-[var(--b)] hover:text-[var(--b)] transition-colors"
    >
      {lang === "ar" ? "FR" : "عربي"}
    </button>
  );
}