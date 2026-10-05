import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { mkMeta, SITE_URL, branchAr, branchShortAr, branchShortFr } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PageContext } from "@/components/PageContext";
import { Icon } from "@/components/Icon";

type Props = { params: Promise<{ slug: string; matiereSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, matiereSlug } = await params;
  const lang = await getLang();
  const branch = await prisma.branch.findUnique({ where: { slug } });
  const subject = branch
    ? await prisma.subject.findUnique({
        where: { branchId_slug: { branchId: branch.id, slug: matiereSlug } },
      })
    : null;
  if (!branch || !subject) return {};
  const name = lang === "ar" ? subject.nameAr : subject.nameFr;
  const branchLabel = lang === "ar" ? branchAr(branch.nameAr) : branch.nameFr;
  const shortLabel =
    lang === "ar" ? branchShortAr(slug, branch.nameAr) : branchShortFr(slug, branch.nameFr);
  return mkMeta({
    lang,
    path: `/branches/${slug}/matiere/${matiereSlug}`,
    title:
      lang === "ar"
        ? `دروس ${name} — ${shortLabel}`
        : `Cours ${name} — ${shortLabel}`,
    brandInTitle: false,
    description:
      lang === "ar"
        ? `دروس وتمارين مادة ${name} لشعبة ${branchLabel}: منهاج كامل مع اختبارات تفاعلية وامتحانات.`
        : `Cours et exercices de ${subject.nameFr} (${branch.nameFr}) : programme complet, quiz interactifs et examens.`,
    keywords: [name, branchLabel],
  });
}

const SUBJECT_KEYMAP: Record<string, string[]> = {
  mathematiques: ["sm", "maths", "math"],
  "physique-chimie": ["sp", "pc"],
  svt: ["svt"],
  francais: ["francais", "fr"],
  anglais: ["anglais", "en", "english"],
  arabe: ["arabe", "ar"],
  espagnol: ["espagnol", "es"],
  economie: ["eco"],
  comptabilite: ["compta", "comptabilite"],
  philosophie: ["philo"],
  "histoire-arts": ["arts"],
  "histoire-geo": ["geo", "histoire"],
  "tarbia-islamia": ["islam", "islamic", "tarbia"],
};

export default async function MatierePage({ params }: Props) {
  const { slug, matiereSlug } = await params;
  const lang = await getLang();

  const branch = await prisma.branch.findUnique({ where: { slug } });
  if (!branch) notFound();

  const subject = await prisma.subject.findUnique({
    where: { branchId_slug: { branchId: branch.id, slug: matiereSlug } },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lesson: { select: { id: true } },
          _count: { select: { questions: true } },
        },
      },
    },
  });

  if (!subject) notFound();

  const keys = SUBJECT_KEYMAP[subject.slug] ?? [];
  const resources = await prisma.resource.findMany({
    where: {
      branchId: branch.id,
      OR: [{ subjectKey: { in: keys } }, { subjectKey: null }],
    },
    orderBy: [{ year: "desc" }, { session: "asc" }],
  });

  const exercises = resources.filter((r) => r.kind === "exercise");
  const lessons = resources.filter((r) => r.kind === "lesson");
  const examCount = resources.filter((r) => r.kind === "exam").length;

  const lessonCount = subject.chapters.reduce(
    (n, c) => n + (c.lesson ? 1 : 0),
    0,
  );

  const assistContext = `الطالب يتابع دروس مادة ${lang === "ar" ? subject.nameAr : subject.nameFr} لشعبة ${lang === "ar" ? branchAr(branch.nameAr) : branch.nameFr}. تحتوي الصفحة على ${subject.chapters.length} دروس، ${lessonCount} ملف درس PDF، ${exercises.length} تمارين و${examCount} امتحاناً. كن معلمه: عندما يسأل عن مفهوم من هذه المادة، اشرحه ببساطة بالعربية المغربية مع مثال تطبيقي محلول ثم مثال إضافي مختلف.`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <PageContext context={assistContext} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: t(lang, "navHome"), item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: lang === "ar" ? branch.nameAr : branch.nameFr,
              item: `${SITE_URL}/branches/${slug}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: lang === "ar" ? subject.nameAr : subject.nameFr,
              item: `${SITE_URL}/branches/${slug}/matiere/${matiereSlug}`,
            },
          ],
        }}
      />
      <div className="crumb mb-8">
        <Link href="/">{t(lang, "navHome")}</Link>
        <span className="mx-2 text-[var(--line)]">/</span>
        <Link href={`/branches/${slug}`}>{lang === "ar" ? branch.nameAr : branch.nameFr}</Link>
        <span className="mx-2 text-[var(--line)]">/</span>
        <span className="text-[var(--ink)]">{lang === "ar" ? subject.nameAr : subject.nameFr}</span>
      </div>

      <div className="mb-12">
        <div className="label mb-4">01 — {t(lang, "matiere")}</div>
        <h1 className="sec-title text-[var(--ink)]">{lang === "ar" ? subject.nameAr : subject.nameFr}</h1>
        <p className="sec-sub mt-3">{lang === "ar" ? branch.nameAr : branch.nameFr}</p>
      </div>

      <section className="mb-16">
        <div className="label mb-5">02 — {t(lang, "lessonsAndQuiz")}</div>
        {subject.chapters.length === 0 && (
          <p className="text-[var(--ink-3)]">{t(lang, "noLessonsMatiere")}</p>
        )}
        <div className="stagger grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subject.chapters.map((ch, i) => (
            <Link
              key={ch.id}
              href={`/lesson/${ch.id}`}
              className="panel panel-hover p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="mono text-xs text-[var(--ink-3)] mb-2">0{i + 1} · {lang === "ar" ? branch.nameAr : branch.nameFr}</div>
                <div className="font-bold text-[var(--ink)]">{lang === "ar" ? ch.titleAr : ch.titleFr}</div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <span className="btn btn-sm !px-4">
                  <Icon name="book" size={15} />
                  {t(lang, "lessonView")}
                </span>
                {ch._count.questions > 0 && (
                  <Link
                    href={`/quiz/${ch.id}`}
                    className="tag hover:border-[var(--brand)]"
                    aria-label={t(lang, "startQuiz")}
                  >
                    <Icon name="target" size={13} /> {ch._count.questions}
                  </Link>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {lessons.length > 0 && (
        <section className="mb-16">
          <div className="label mb-5">03 — {t(lang, "lessonPdfSection")}</div>
          <div className="journal">
            {lessons.map((e, i) => (
              <a key={e.id} href={e.url} target="_blank" rel="noopener noreferrer" className="entry">
                <span className="entry__idx">0{i + 1}<i /></span>
                <span>
                  <span className="entry__title block">{lang === "ar" ? e.titleAr : e.titleFr}</span>
                </span>
                <span className="entry__meta">
                  <b>
                    <Icon name="download" size={13} /> PDF
                  </b>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {exercises.length > 0 && (
        <section className="mb-16">
          <div className="label mb-5">04 — {t(lang, "exerciseSection")}</div>
          <div className="journal">
            {exercises.map((e, i) => (
              <a key={e.id} href={e.url} target="_blank" rel="noopener noreferrer" className="entry">
                <span className="entry__idx">0{i + 1}<i /></span>
                <span>
                  <span className="entry__title block">{lang === "ar" ? e.titleAr : e.titleFr}</span>
                </span>
                <span className="entry__meta"><b>↗</b></span>
              </a>
            ))}
          </div>
        </section>
      )}

      {examCount > 0 && (
        <section>
          <div className="label mb-5">05 — {t(lang, "examSection")}</div>
          <Link
            href={`/branches/${slug}/matiere/${matiereSlug}/examens`}
            className="panel panel-hover p-5 flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mono text-xs text-[var(--ink-3)] mb-2">
                <Icon name="calendar" size={14} />
                {t(lang, "examSection")}
              </div>
              <div className="font-bold text-[var(--ink)]">{t(lang, "examsMatiereTitle")}</div>
              <div className="mt-1 text-sm text-[var(--ink-3)]">{examCount} {t(lang, "countExams")}</div>
            </div>
            <span className="btn btn-emerald btn-sm !px-4">↗</span>
          </Link>
        </section>
      )}
    </div>
  );
}