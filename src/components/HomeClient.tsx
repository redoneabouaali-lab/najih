"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t, type Lang } from "@/lib/lang";
import { getProfile } from "@/lib/profile";
import { Onboarding, type BranchOption } from "./Onboarding";
import { setClientLang } from "@/lib/lang";

export type BranchDto = BranchOption & {
  questionCount: number;
  resourceCount: number;
  lessonCount: number;
};

type Props = {
  lang: Lang;
  branches: BranchDto[];
};

export function HomeClient({ lang, branches }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ branchSlug: string; studyLang: Lang } | null>(null);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    let active = true;
    getProfile().then((p) => {
      if (!active) return;
      setProfile(p);
      setChanging(false);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--acc)] border-t-transparent" />
      </div>
    );
  }

  const displayLang: Lang = profile?.studyLang ?? lang;

  if (!profile || changing) {
    return (
      <Onboarding
        lang={displayLang}
        branches={branches}
        onDone={async () => {
          const p = await getProfile();
          setProfile(p);
          if (p) setClientLang(p.studyLang);
          router.refresh();
        }}
      />
    );
  }

  const branch = branches.find((b) => b.slug === profile.branchSlug);
  const icon = branch?.icon ?? "🎓";

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-sky-500 text-white px-4 py-12">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="max-w-4xl mx-auto flex items-center gap-5 relative">
          <span className="grid place-items-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur text-4xl">{icon}</span>
          <div>
            <p className="text-indigo-200 text-sm">{t(displayLang, "helloBranch")}</p>
            <h1 className="text-3xl font-bold">
              {displayLang === "ar" ? branch?.nameAr : branch?.nameFr}
            </h1>
            <p className="text-indigo-100 text-sm mt-1 opacity-90">
              {t(displayLang, "myDash")}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href={`/branches/${profile.branchSlug}`}
          className="block p-5 bg-white rounded-2xl border border-[var(--p)] shadow-sm hover:shadow-md hover:border-[var(--acc)] hover:-translate-y-1 transition-all"
        >
          <div className="text-3xl mb-2">📖</div>
          <h3 className="font-bold text-[var(--b)]">{t(displayLang, "cardLessonTitle")}</h3>
          <p className="text-sm text-[var(--l)] mt-1">{t(displayLang, "cardLessonDesc")}</p>
          <div className="text-xs text-[var(--acc)] mt-3 font-bold">
            {branch?.lessonCount ?? 0} {t(displayLang, "lessons")}
          </div>
        </Link>

        <Link
          href={`/branches/${profile.branchSlug}`}
          className="block p-5 bg-white rounded-2xl border border-[var(--p)] shadow-sm hover:shadow-md hover:border-[var(--acc)] hover:-translate-y-1 transition-all"
        >
          <div className="text-3xl mb-2">📝</div>
          <h3 className="font-bold text-[var(--b)]">{t(displayLang, "cardQuizTitle")}</h3>
          <p className="text-sm text-[var(--l)] mt-1">{t(displayLang, "cardQuizDesc")}</p>
          <div className="text-xs text-[var(--acc)] mt-3 font-bold">
            {branch?.questionCount ?? 0} {t(displayLang, "lessonCount")}
          </div>
        </Link>

        <Link
          href={`/resources/${profile.branchSlug}`}
          className="block p-5 bg-white rounded-2xl border border-[var(--p)] shadow-sm hover:shadow-md hover:border-[var(--acc)] hover:-translate-y-1 transition-all"
        >
          <div className="text-3xl mb-2">📄</div>
          <h3 className="font-bold text-[var(--b)]">{t(displayLang, "cardExamTitle")}</h3>
          <p className="text-sm text-[var(--l)] mt-1">{t(displayLang, "cardExamDesc")}</p>
          <div className="text-xs text-[var(--acc)] mt-3 font-bold">
            {branch?.resourceCount ?? 0} {t(displayLang, "examCount")}
          </div>
        </Link>

        <Link
          href="/ai"
          className="block p-5 bg-white rounded-2xl border border-[var(--p)] shadow-sm hover:shadow-md hover:border-[var(--acc)] hover:-translate-y-1 transition-all"
        >
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-bold text-[var(--b)]">{t(displayLang, "cardAiTitle")}</h3>
          <p className="text-sm text-[var(--l)] mt-1">{t(displayLang, "cardAiDesc")}</p>
        </Link>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-10">
        <button
          onClick={() => {
            setChanging(true);
          }}
          className="text-sm text-[var(--l)] underline hover:text-[var(--acc)]"
        >
          {t(displayLang, "changeProfile")}
        </button>
      </div>
    </div>
  );
}