"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t, type Lang } from "@/lib/lang";
import { getProfile, saveProfile } from "@/lib/profile";
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

  async function load() {
    setLoading(true);
    const p = await getProfile();
    setProfile(p);
    setChanging(false);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
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
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white px-4 py-12">
        <div className="max-w-4xl mx-auto flex items-center gap-5">
          <span className="text-6xl">{icon}</span>
          <div>
            <p className="text-emerald-200 text-sm">{t(displayLang, "helloBranch")}</p>
            <h1 className="text-3xl font-bold">
              {displayLang === "ar" ? branch?.nameAr : branch?.nameFr}
            </h1>
            <p className="text-emerald-100 text-sm mt-1 opacity-90">
              {t(displayLang, "myDash")}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href={`/branches/${profile.branchSlug}`}
          className="block p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
        >
          <div className="text-3xl mb-2">📖</div>
          <h3 className="font-bold text-emerald-800">{t(displayLang, "cardLessonTitle")}</h3>
          <p className="text-sm text-gray-500 mt-1">{t(displayLang, "cardLessonDesc")}</p>
          <div className="text-xs text-emerald-600 mt-3 font-medium">
            {branch?.lessonCount ?? 0} {t(displayLang, "lessons")}
          </div>
        </Link>

        <Link
          href={`/branches/${profile.branchSlug}`}
          className="block p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
        >
          <div className="text-3xl mb-2">📝</div>
          <h3 className="font-bold text-emerald-800">{t(displayLang, "cardQuizTitle")}</h3>
          <p className="text-sm text-gray-500 mt-1">{t(displayLang, "cardQuizDesc")}</p>
          <div className="text-xs text-emerald-600 mt-3 font-medium">
            {branch?.questionCount ?? 0} {t(displayLang, "lessonCount")}
          </div>
        </Link>

        <Link
          href={`/resources/${profile.branchSlug}`}
          className="block p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
        >
          <div className="text-3xl mb-2">📄</div>
          <h3 className="font-bold text-emerald-800">{t(displayLang, "cardExamTitle")}</h3>
          <p className="text-sm text-gray-500 mt-1">{t(displayLang, "cardExamDesc")}</p>
          <div className="text-xs text-emerald-600 mt-3 font-medium">
            {branch?.resourceCount ?? 0} {t(displayLang, "examCount")}
          </div>
        </Link>

        <Link
          href="/ai"
          className="block p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
        >
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-bold text-emerald-800">{t(displayLang, "cardAiTitle")}</h3>
          <p className="text-sm text-gray-500 mt-1">{t(displayLang, "cardAiDesc")}</p>
        </Link>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-10">
        <button
          onClick={() => {
            setChanging(true);
          }}
          className="text-sm text-gray-500 underline hover:text-emerald-600"
        >
          {t(displayLang, "changeProfile")}
        </button>
      </div>
    </div>
  );
}