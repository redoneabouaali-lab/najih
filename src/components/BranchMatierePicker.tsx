"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t, type Lang, setClientLang } from "@/lib/lang";
import { getProfile, saveProfile } from "@/lib/profile";
import { HomeLangStep } from "./HomeLangStep";

export type MatiereOption = {
  id: string;
  slug: string;
  icon: string;
  nameAr: string;
  nameFr: string;
  chapterCount: number;
  lessonCount: number;
  questionCount: number;
};

type Props = {
  lang: Lang;
  branchSlug: string;
  branchNameAr: string;
  branchNameFr: string;
  matieres: MatiereOption[];
};

export function BranchMatierePicker({
  lang,
  branchSlug,
  branchNameAr,
  branchNameFr,
  matieres,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ branchSlug: string; studyLang: Lang } | null>(null);
  const [displayLang, setDisplayLang] = useState<Lang>(lang);

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p);
      setDisplayLang(p?.studyLang ?? lang);
      setLoading(false);
    });
  }, [lang]);

  const viewLang: Lang = profile?.studyLang ?? displayLang;

  async function pickLang(choice: Lang) {
    setProfile({ branchSlug, studyLang: choice });
    setDisplayLang(choice);
    setClientLang(choice);
    const current = await getProfile();
    await saveProfile(current?.branchSlug ?? branchSlug, choice);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--b)] border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <HomeLangStep
        lang={lang}
        branchNameAr={branchNameAr}
        branchNameFr={branchNameFr}
        onPick={pickLang}
      />
    );
  }

  const branchName = viewLang === "ar" ? branchNameAr : branchNameFr;
  const totalQ = matieres.reduce((s, m) => s + m.questionCount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="crumb mb-8">
        <Link href="/">{t(viewLang, "navHome")}</Link>
        <span className="mx-2 text-[var(--p)]">/</span>
        <Link href="/branches">{t(viewLang, "navBranches")}</Link>
        <span className="mx-2 text-[var(--p)]">/</span>
        <span className="text-[var(--b)]">{branchName}</span>
      </div>

      <div className="mb-12">
        <div className="label mb-4">01 — {t(viewLang, "matiere")}</div>
        <h1 className="sec-title text-[var(--b)]">{branchName}</h1>
        <p className="sec-sub mt-3">{t(viewLang, "pickMatiereSub")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="tag">{matieres.length} 🧩</span>
          <span className="tag">{totalQ} 🎯</span>
        </div>
      </div>

      <section>
        <div className="label mb-5">02 — {t(viewLang, "pickMatiere")}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matieres.map((m, i) => {
            const empty = m.lessonCount === 0 && m.questionCount === 0 && m.chapterCount === 0;
            return (
              <Link key={m.id} href={`/branches/${branchSlug}/matiere/${m.slug}`} className="svc-card">
                <span className="svc-card__idx">0{i + 1} — {viewLang === "ar" ? m.nameAr : m.nameFr}</span>
                <div className="svc-card__body mt-4">
                  <div className="text-4xl mb-3">{m.icon}</div>
                  <h3>{viewLang === "ar" ? m.nameAr : m.nameFr}</h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.lessonCount > 0 && <span className="tag">{m.lessonCount} 📚</span>}
                  {m.questionCount > 0 && <span className="tag">{m.questionCount} 🎯</span>}
                  {m.chapterCount > 0 && <span className="tag">{m.chapterCount} 📖</span>}
                  {empty && <span className="tag">{t(viewLang, "soon")}</span>}
                </div>
                <span className="svc-card__arrow">{t(viewLang, "homeStart")} <i /></span>
              </Link>
            );
          })}
          {matieres.length === 0 && <p className="text-[var(--l)] py-8">{t(viewLang, "noMatieres")}</p>}
        </div>
      </section>

      <div className="mt-16">
        <Link href={`/resources/${branchSlug}`} className="btn btn-ghost">
          📄 {t(viewLang, "navResources")}
        </Link>
      </div>
    </div>
  );
}