import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { mkMeta } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { shuffle } from "@/lib/shuffle";
import Link from "next/link";
import { Quiz } from "@/components/Quiz";
import { PageContext } from "@/components/PageContext";
import { ContentUnderstand } from "@/components/ContentUnderstand";
import { Icon } from "@/components/Icon";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lang = await getLang();
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    select: { titleAr: true, titleFr: true, subject: { select: { nameAr: true, nameFr: true } } },
  });
  if (!chapter) return {};
  return mkMeta({
    lang,
    path: `/quiz/${id}`,
    title: `${lang === "ar" ? chapter.titleAr : chapter.titleFr} — ${lang === "ar" ? "اختبار تفاعلي" : "quiz interactif"}`,
    description:
      lang === "ar"
        ? `اختبر نفسك في "${lang === "ar" ? chapter.titleAr : chapter.titleFr}" بأسئلة من الامتحانات الوطنية مع التصحيح الفوري.`
        : `Teste-toi sur « ${chapter.titleFr} » avec des questions des examens nationaux et corrigé immédiat.`,
  });
}

export default async function QuizPage({ params }: Props) {
  const { id } = await params;
  const lang = await getLang();

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      subject: {
        select: {
          branch: { select: { slug: true, nameAr: true, nameFr: true } },
          nameAr: true,
          nameFr: true,
        },
      },
      questions: {
        include: {
          options: {
            select: { id: true, textAr: true, textFr: true, isCorrect: true, order: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!chapter) notFound();

  const questions = shuffle(
    chapter.questions.map((q) => ({
      id: q.id,
      promptAr: q.promptAr,
      promptFr: q.promptFr,
      year: q.year,
      session: q.session,
      source: q.source,
      explanationAr: q.explanationAr,
      explanationFr: q.explanationFr,
      options: shuffle(
        q.options.map((o) => ({
          id: o.id,
          textAr: o.textAr,
          textFr: o.textFr,
          isCorrect: o.isCorrect,
        })),
      ),
    })),
  );

  if (questions.length === 0)
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="mb-6">
          <span className="inline-grid place-items-center w-16 h-16 rounded-[var(--r-lg)] border border-[var(--line)] text-[var(--ink-3)]">
            <Icon name="inbox" size={28} />
          </span>
        </div>
        <h1 className="sec-title text-[var(--ink)] mb-4">
          {lang === "ar" ? chapter.titleAr : chapter.titleFr}
        </h1>
        <p className="text-[var(--ink-3)] mb-8">{t(lang, "noQuestionsYet")}</p>
        <Link href={`/lesson/${chapter.id}`} className="btn">
          <Icon name="chevronLeft" size={16} />
          {t(lang, "backToLessons")}
        </Link>
      </div>
    );

  const quizContent = chapter.questions
    .slice(0, 6)
    .map((q, i) => {
      const lines = [
        `س${i + 1}: ${lang === "ar" ? q.promptAr : q.promptFr}`,
        ...q.options.map((o) => `- ${lang === "ar" ? o.textAr : o.textFr}`),
      ];
      if (q.source) lines.push(`المصدر: ${q.source}`);
      return lines.join("\n");
    })
    .join("\n\n");

  return (
    <div>
      <PageContext
        context={`الطالب يمارس اختباراً تفاعلياً في درس «${lang === "ar" ? chapter.titleAr : chapter.titleFr}» (مادة ${lang === "ar" ? chapter.subject.nameAr : chapter.subject.nameFr}) بأسئلة من الامتحانات الوطنية المغربية، مع تصحيح فوري وشرح لكل إجابة. عدد الأسئلة: ${questions.length}.${
          questions[0]
            ? `\nمثال سؤال على الشاشة الآن: «${lang === "ar" ? questions[0].promptAr : questions[0].promptFr}»`
            : ""
        }`}
      />
      <ContentUnderstand
        storageKey={`quiz:${chapter.id}`}
        input={{
          content: quizContent,
          title: lang === "ar" ? chapter.titleAr : chapter.titleFr,
          kindHint: "exercise",
          lang: lang === "ar" ? "ar" : "fr",
          context: `اختبار تفاعلي في درس ${lang === "ar" ? chapter.titleAr : chapter.titleFr}`,
        }}
        auto
      />
      <div className="max-w-2xl mx-auto px-6">
        <nav className="crumb mb-6" aria-label={lang === "ar" ? "مسار التنقل" : "fil d'ariane"}>
          <Link href="/">{t(lang, "navHome")}</Link>
          <span className="mx-2 text-[var(--line)]">/</span>
          <Link href={`/branches/${chapter.subject.branch.slug}`}>
            {lang === "ar" ? chapter.subject.branch.nameAr : chapter.subject.branch.nameFr}
          </Link>
          <span className="mx-2 text-[var(--line)]">/</span>
          <Link href={`/lesson/${chapter.id}`}>
            {lang === "ar" ? chapter.titleAr : chapter.titleFr}
          </Link>
        </nav>

        <div className="mb-8" data-reveal>
          <div className="label mb-4" data-reveal="rule">
            {lang === "ar" ? chapter.subject.nameAr : chapter.subject.nameFr} ·{" "}
            {lang === "ar" ? "اختبار تفاعلي" : "Quiz interactif"}
          </div>
          <h1 className="sec-title text-[var(--ink)]">
            {lang === "ar" ? chapter.titleAr : chapter.titleFr} —{" "}
            <span className="text-[var(--ink-3)]">
              {lang === "ar" ? "اختبار تفاعلي" : "Quiz interactif"}
            </span>
          </h1>
          <p className="mono text-sm text-[var(--ink-3)] mt-4">
            {questions.length} {t(lang, "questions")}
          </p>
        </div>
      </div>

      <Quiz
        lang={lang}
        chapterId={chapter.id}
        chapterTitleAr={chapter.titleAr}
        chapterTitleFr={chapter.titleFr}
        questions={questions}
      />
    </div>
  );
}