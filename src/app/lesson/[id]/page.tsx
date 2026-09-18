import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";

type Props = { params: Promise<{ id: string }> };

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
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
        <Link
          href={`/quiz/${chapter.id}`}
          className="btn btn-emerald"
        >
          🎯 {t(lang, "startQuiz")} ({chapter._count.questions})
        </Link>
        <Link
          href={`/resources/${branchSlug}`}
          className="btn btn-ghost"
        >
          📄 {t(lang, "navResources")}
        </Link>
      </div>

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