"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/lang";
import { setClientLang } from "@/lib/lang";
import { saveProfile } from "@/lib/profile";

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
        <div className="text-5xl mb-3">{step === 1 ? "🎓" : step === 2 ? "🗣️" : "✅"}</div>
        <h1 className="text-2xl font-bold text-emerald-700">
          {step === 1
            ? t(lang, "onboardTitleBranches")
            : step === 2
              ? t(lang, "onboardTitleLang")
              : t(lang, "onboardDoneTitle")}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {step === 1
            ? t(lang, "onboardSubBranches")
            : step === 2
              ? t(lang, "onboardSubLang")
              : t(lang, "onboardDoneSub")}
        </p>

        {step < 3 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <span
              className={`h-2.5 rounded-full ${step === 1 ? "w-8 bg-emerald-600" : "w-2.5 bg-gray-300"}`}
            />
            <span
              className={`h-2.5 rounded-full ${step === 2 ? "w-8 bg-emerald-600" : "w-2.5 bg-gray-300"}`}
            />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.map((b) => (
            <button
              key={b.slug}
              onClick={() => pickBranch(b.slug)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-gray-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-right"
            >
              <span className="text-3xl">{b.icon}</span>
              <span className="flex-1">
                <span className="block font-bold text-emerald-800">
                  {lang === "ar" ? b.nameAr : b.nameFr}
                </span>
                <span className="block text-xs text-gray-400">
                  {lang === "ar" ? b.nameFr : b.nameAr}
                </span>
              </span>
              <span className="text-emerald-500">←</span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
          {(
            [
              ["ar", t(lang, "onboardArabic"), "🇲🇦"],
              ["fr", t(lang, "onboardFrench"), "🇫🇷"],
            ] as const
          ).map(([value, label, emoji]) => (
            <button
              key={value}
              disabled={saving}
              onClick={() => pickLanguage(value)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-gray-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <span className="text-3xl">{emoji}</span>
              <span className="font-bold text-emerald-800">{label}</span>
              <span className="text-emerald-500">←</span>
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      )}
    </div>
  );
}