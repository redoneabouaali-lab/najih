import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { shuffle } from "@/lib/shuffle";
import Link from "next/link";
import { Quiz } from "@/components/Quiz";

type Props = { params: Promise<{ id: string }> };

export default async function QuizPage({ params }: Props) {
  const { id } = await params;
  const lang = await getLang();

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      subject: { select: { branch: { select: { slug: true } } } },
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

  if (!chapter)
    return (
      <div className="p-8 text-center text-gray-500">
        {t(lang, "backToLessons")}
      </div>
    );

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

  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 pt-6 text-sm">
        <Link
          href={`/branches/${chapter.subject.branch.slug}`}
          className="text-[var(--b)] hover:opacity-60"
        >
          ← {t(lang, "backToLessons")}
        </Link>
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