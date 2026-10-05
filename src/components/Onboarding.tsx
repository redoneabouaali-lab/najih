"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/lang";
import { setClientLang } from "@/lib/lang";
import { saveProfile } from "@/lib/profile";
import { Icon, branchIcon } from "@/components/Icon";

export type BranchOption = {
  slug: string;
  nameAr: string;
  nameFr: string;
  icon: string;
};

type Props = {
  lang: Lang;
  branches: BranchOption[];
  onDone: () => void;
};

export function Onboarding({ lang, branches, onDone }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [branchSlug, setBranchSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function pickBranch(slug: string) {
    setBranchSlug(slug);
    setStep(2);
  }

  async function pickLanguage(studyLang: Lang) {
    if (!branchSlug) return;
    setSaving(true);
    setClientLang(studyLang);
    await saveProfile(branchSlug, studyLang);
    setStep(3);
    setTimeout(onDone, 900);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mb-4">
          <span className="inline-grid place-items-center w-14 h-14 rounded-[var(--r-lg)] border border-[var(--line)] text-[var(--brand)]">
            <Icon name={step === 1 ? "cap" : step === 2 ? "language" : "check"} size={26} />
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink)]">
          {step === 1
            ? t(lang, "onboardTitleBranches")
            : step === 2
              ? t(lang, "onboardTitleLang")
              : t(lang, "onboardDoneTitle")}
        </h1>
        <p className="text-[var(--ink-3)] mt-1 text-sm">
          {step === 1
            ? t(lang, "onboardSubBranches")
            : step === 2
              ? t(lang, "onboardSubLang")
              : t(lang, "onboardDoneSub")}
        </p>

        {step < 3 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <span
              className={`h-2.5 rounded-full transition-all ${step === 1 ? "w-8 bg-[var(--acc)]" : "w-2.5 bg-[var(--line)]"}`}
            />
            <span
              className={`h-2.5 rounded-full transition-all ${step === 2 ? "w-8 bg-[var(--acc)]" : "w-2.5 bg-[var(--line)]"}`}
            />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--line)]" />
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.map((b) => (
            <button
              key={b.slug}
              onClick={() => pickBranch(b.slug)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-[var(--line)] shadow-sm hover:border-[var(--acc)] hover:shadow-md hover:-translate-y-0.5 transition-all text-right"
            >
              <Icon name={branchIcon(b.slug)} size={20} />
              <span className="flex-1">
                <span className="block font-bold text-[var(--ink)]">
                  {lang === "ar" ? b.nameAr : b.nameFr}
                </span>
                <span className="block text-xs text-[var(--ink-3)]">
                  {lang === "ar" ? b.nameFr : b.nameAr}
                </span>
              </span>
              <Icon name="chevronLeft" size={18} className="text-[var(--acc)]" />
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
          {(
            [
              ["ar", t(lang, "onboardArabic"), "language"],
              ["fr", t(lang, "onboardFrench"), "message"],
            ] as const
          ).map(([value, label, icon]) => (
            <button
              key={value}
              disabled={saving}
              onClick={() => pickLanguage(value)}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white border-2 border-[var(--line)] shadow-sm hover:border-[var(--acc)] hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <Icon name={icon} size={22} className="text-[var(--brand)]" />
              <span className="flex-1 font-bold text-[var(--ink)] text-right">{label}</span>
              <Icon name="chevronLeft" size={18} className="text-[var(--acc)]" />
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--acc)] border-t-transparent" />
        </div>
      )}
    </div>
  );
}