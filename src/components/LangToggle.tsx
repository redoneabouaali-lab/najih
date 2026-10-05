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
      className="!text-[13px] !font-bold tracking-wide px-4 py-2 rounded-full bg-[var(--brand-tint)] text-[var(--brand)] border border-[var(--line)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-sunk)] transition-colors"
    >
      {lang === "ar" ? "FR" : "عربي"}
    </button>
  );
}