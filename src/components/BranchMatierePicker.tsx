"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t, type Lang, setClientLang } from "@/lib/lang";
import { getProfile, saveProfile } from "@/lib/profile";
import { HomeLangStep } from "./HomeLangStep";
import { Icon, subjectIcon } from "./Icon";

export type MatiereOption = {
  id: string;
  slug: string;
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
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--acc)] border-t-transparent" />
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
        <span className="mx-2 text-[var(--line)]">/</span>
        <Link href="/branches">{t(viewLang, "navBranches")}</Link>
        <span className="mx-2 text-[var(--line)]">/</span>
        <span className="text-[var(--ink)]">{branchName}</span>
      </div>

      <div className="mb-12" data-reveal>
        <div className="label mb-4" data-reveal="rule">01 - {t(viewLang, "matiere")}</div>
        <p className="sec-sub mt-3">{t(viewLang, "pickMatiereSub")}</p>
        <div className="mt-6 flex flex-wrap gap-3" data-reveal-group data-reveal-step="60" data-reveal-cap="2">
          <span className="tag">
            <Icon name="layers" size={13} /> <span data-count-to={matieres.length}>{matieres.length}</span>
          </span>
          <span className="tag">
            <Icon name="target" size={13} /> <span data-count-to={totalQ}>{totalQ}</span>
          </span>
        </div>
      </div>

      <section>
        <div className="label mb-5" data-reveal="rule">02 - {t(viewLang, "pickMatiere")}</div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-reveal-group
          data-reveal-step="70"
          data-reveal-cap="6"
        >
          {matieres.map((m, i) => {
            const empty = m.lessonCount === 0 && m.questionCount === 0 && m.chapterCount === 0;
            return (
              <Link key={m.id} href={`/branches/${branchSlug}/matiere/${m.slug}`} className="svc-card" data-reveal="scale">
                <span className="svc-card__idx">0{i + 1} — {viewLang === "ar" ? m.nameAr : m.nameFr}</span>
                <div className="svc-card__body mt-4">
                  <div className="mb-3 text-[var(--brand)]">
                  <Icon name={subjectIcon(m.slug)} size={28} />
                </div>
                  <h3>{viewLang === "ar" ? m.nameAr : m.nameFr}</h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.lessonCount > 0 && (
                    <span className="tag">
                      <Icon name="book" size={13} /> {m.lessonCount}
                    </span>
                  )}
                  {m.questionCount > 0 && (
                    <span className="tag">
                      <Icon name="target" size={13} /> {m.questionCount}
                    </span>
                  )}
                  {m.chapterCount > 0 && (
                    <span className="tag">
                      <Icon name="file" size={13} /> {m.chapterCount}
                    </span>
                  )}
                  {empty && <span className="tag">{t(viewLang, "soon")}</span>}
                </div>
                <span className="svc-card__arrow">{t(viewLang, "homeStart")} <i /></span>
              </Link>
            );
          })}
          {matieres.length === 0 && <p className="text-[var(--ink-3)] py-8">{t(viewLang, "noMatieres")}</p>}
        </div>
      </section>

      <div className="mt-16">
        <Link href={`/resources/${branchSlug}`} className="btn btn-ghost">
          <Icon name="file" size={17} />
          {t(viewLang, "navResources")}
        </Link>
      </div>
    </div>
  );
}