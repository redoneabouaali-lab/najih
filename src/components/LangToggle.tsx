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
      className="!text-[13px] !font-bold tracking-wide px-4 py-2 rounded-full bg-[var(--acc-soft)] text-[var(--acc)] hover:bg-[#e0e7ff] hover:text-[var(--acc)] transition-colors"
    >
      {lang === "ar" ? "FR" : "عربي"}
    </button>
  );
}