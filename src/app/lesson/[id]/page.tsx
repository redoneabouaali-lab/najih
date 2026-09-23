import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { mkMeta, SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { JsonLd } from "@/components/JsonLd";
import { AskTutorButton } from "@/components/AskTutorButton";
import { PageContext } from "@/components/PageContext";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lang = await getLang();
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { subject: { include: { branch: true } } },
  });
  if (!chapter) return {};
  const title = lang === "ar" ? chapter.titleAr : chapter.titleFr;
  const subject = lang === "ar" ? chapter.subject.nameAr : chapter.subject.nameFr;
  const branch = lang === "ar" ? chapter.subject.branch.nameAr : chapter.subject.branch.nameFr;
  return mkMeta({
    lang,
    path: `/lesson/${chapter.id}`,
    title: `${title} — ${subject}`,
    description:
      lang === "ar"
        ? `درس "${title}" في مادة ${subject} (${branch}): شرح كامل، أمثلة وتمارين مع اختبار تفاعلي للباكالوريا.`
        : `Leçon « ${title} » de ${subject} (${branch}) : explication complète, exemples, exercices et quiz interactif pour le Bac.`,
    keywords: [subject, branch, title],
  });
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const lang = await getLang();

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      lesson: true,
      subject: { include: { branch: true } },
      _count: { select: { questions: true } },
    },
  });

  if (!chapter) notFound();
  if (!chapter.lesson)
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-gray-500">
        {t(lang, "lessonNotFound")}
      </div>
    );

  const branchSlug = chapter.subject.branch.slug;
  const lessonContent = lang === "ar" ? chapter.lesson.contentAr : chapter.lesson.contentFr;

  const exercises = await prisma.resource.findMany({
    where: {
      branchId: chapter.subject.branchId,
      kind: "exercise",
      OR: [{ subjectKey: chapter.subject.slug }, { subjectKey: null }],
    },
    orderBy: [{ titleFr: "asc" }],
    take: 8,
  });

  const title = lang === "ar" ? chapter.titleAr : chapter.titleFr;
  const subjectName = lang === "ar" ? chapter.subject.nameAr : chapter.subject.nameFr;
  const branchName = lang === "ar" ? chapter.subject.branch.nameAr : chapter.subject.branch.nameFr;
  const lessonUrl = `${SITE_URL}/lesson/${chapter.id}`;

  const excerpt = (s: string) => {
    const plain = s.replace(/[`#>*_\[\]!]/g, " ").replace(/\s+/g, " ").trim();
    return plain.length > 900 ? `${plain.slice(0, 900)}…` : plain;
  };
  const assistContext = `الطالب يقرأ الآن درس «${title}» في مادة ${subjectName} (شعبة ${branchName}). محتوى الدرس:
${excerpt(lessonContent)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
      <PageContext context={assistContext} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: t(lang, "navHome"), item: SITE_URL },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: branchName,
                  item: `${SITE_URL}/branches/${branchSlug}`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: subjectName,
                  item: `${SITE_URL}/branches/${branchSlug}/matiere/${chapter.subject.slug}`,
                },
                { "@type": "ListItem", position: 4, name: title, item: lessonUrl },
              ],
            },
            {
              "@type": "LearningResource",
              headline: title,
              name: title,
              inLanguage: lang === "ar" ? "ar" : "fr",
              about: subjectName,
              isAccessibleForFree: true,
              mainEntityOfPage: lessonUrl,
              url: lessonUrl,
              educationalLevel: "baccalauréat (Maroc)",
              author: { "@type": "Organization", name: "Najih", url: SITE_URL },
              publisher: { "@type": "Organization", name: "Najih", url: SITE_URL },
            },
          ],
        }}
      />
      <div className="crumb mb-8">
        <Link href="/">{t(lang, "navHome")}</Link>
        <span className="mx-2 text-[var(--p)]">/</span>
        <Link href={`/branches/${branchSlug}`}>
          {lang === "ar" ? chapter.subject.branch.nameAr : chapter.subject.branch.nameFr}
        </Link>
        <span className="mx-2 text-[var(--p)]">/</span>
        <span className="text-[var(--b)]">{lang === "ar" ? chapter.titleAr : chapter.titleFr}</span>
      </div>

      <div className="mb-10">
        <div className="label mb-4">
          {chapter.subject.icon} {lang === "ar" ? chapter.subject.nameAr : chapter.subject.nameFr} · {t(lang, "lessonView")}
        </div>
        <h1 className="sec-title text-[var(--b)]">{lang === "ar" ? chapter.titleAr : chapter.titleFr}</h1>
        <p className="mono text-sm text-[var(--l)] mt-4">{chapter._count.questions} {t(lang, "questions")}</p>
      </div>

      <div className="panel panel-hover p-6 sm:p-10 mb-10">
        <Markdown content={lessonContent} />
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        {chapter._count.questions > 0 ? (
          <Link
            href={`/quiz/${chapter.id}`}
            className="btn btn-emerald"
          >
            🎯 {t(lang, "startQuiz")} ({chapter._count.questions})
          </Link>
        ) : (
          <span className="btn btn-ghost !cursor-default opacity-60">
            🎯 {t(lang, "questions")} 0
          </span>
        )}
        <Link
          href={`/branches/${branchSlug}/matiere/${chapter.subject.slug}/examens`}
          className="btn btn-ghost"
        >
          🗓️ {t(lang, "examSection")}
        </Link>
        <Link
          href={`/resources/${branchSlug}`}
          className="btn btn-ghost"
        >
          📄 {t(lang, "navResources")}
        </Link>
        <AskTutorButton
          lang={lang}
          promptAr={`أنا أدرس الآن درس "${lang === "ar" ? chapter.titleAr : chapter.titleFr}". لخص لي هذا الدرس بطريقة مبسطة، نقاط أساسية.`}
          promptFr={`J'étudie la leçon « ${lang === "ar" ? chapter.titleAr : chapter.titleFr} ». Résume-moi ce cours simplement, points clés.`}
          contextAr={`الطالب يقرأ درس "${lang === "ar" ? chapter.titleAr : chapter.titleFr}"`}
          contextFr={`L'étudiant lit la leçon « ${lang === "ar" ? chapter.titleAr : chapter.titleFr} »`}
          labelAr="لخص لي الدرس"
          labelFr="Résume-moi ce cours"
        />
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: lang === "ar" ? chapter.titleAr : chapter.titleFr,
          inLanguage: lang,
          about: lang === "ar" ? chapter.subject.nameAr : chapter.subject.nameFr,
          isPartOf: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Najih", item: SITE_URL },
              {
                "@type": "ListItem",
                position: 2,
                name: lang === "ar" ? chapter.subject.branch.nameAr : chapter.subject.branch.nameFr,
                item: `${SITE_URL}/branches/${branchSlug}`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: `${lang === "ar" ? chapter.subject.nameAr : chapter.subject.nameFr} — ${lang === "ar" ? chapter.titleAr : chapter.titleFr}`,
                item: `${SITE_URL}/lesson/${chapter.id}`,
              },
            ],
          },
        }}
      />

      {exercises.length > 0 && (
        <section>
          <div className="label mb-5">{t(lang, "exerciseSection")}</div>
          <div className="journal">
            {exercises.map((e, i) => (
              <a key={e.id} href={e.url} target="_blank" rel="noopener noreferrer" className="entry">
                <span className="entry__idx">0{i + 1}<i /></span>
                <span className="entry__title block">{lang === "ar" ? e.titleAr : e.titleFr}</span>
                <span className="entry__meta"><b>↗</b></span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}