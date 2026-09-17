"use client";

import { t, type Lang } from "@/lib/lang";

type Props = {
  lang: Lang;
  branchNameAr: string;
  branchNameFr: string;
  onPick: (lang: Lang) => void;
};

export function HomeLangStep({ lang, branchNameAr, branchNameFr, onPick }: Props) {
  const branchName = lang === "ar" ? branchNameAr : branchNameFr;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16">
      <div className="label mb-4">01 — 🗣️ {t(lang, "onboardTitleLang")}</div>
      <p className="sec-sub mb-10">
        {t(lang, "onboardSubLang")} — <b className="text-[var(--b)]">{branchName}</b>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onPick("ar")}
          className="svc-card text-left cursor-pointer"
        >
          <span className="svc-card__idx">A.1 — العربية</span>
          <div className="svc-card__body mt-4">
            <div className="text-4xl mb-3">🇲🇦</div>
            <h3>{t(lang, "onboardArabic")}</h3>
            <p className="mt-2">عربية، واضحة، لدراسة مريحة</p>
          </div>
          <span className="svc-card__arrow">{t(lang, "homeStart")} <i /></span>
        </button>
        <button
          onClick={() => onPick("fr")}
          className="svc-card text-left cursor-pointer"
        >
          <span className="svc-card__idx">A.2 — Français</span>
          <div className="svc-card__body mt-4">
            <div className="text-4xl mb-3">🇫🇷</div>
            <h3>{t(lang, "onboardFrench")}</h3>
            <p className="mt-2">En français, clair et agréable</p>
          </div>
          <span className="svc-card__arrow">{t(lang, "homeStart")} <i /></span>
        </button>
      </div>
    </div>
  );
}