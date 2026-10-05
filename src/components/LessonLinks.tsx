import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { t, type Lang } from "@/lib/lang";
import { Icon } from "@/components/Icon";

type Props = {
  lang: Lang;
  branchSlug?: string;
  limit?: number;
  heading?: string;
};

export async function LessonLinks({ lang, branchSlug, limit, heading }: Props) {
  const lessons = await prisma.chapter.findMany({
    where: {
      lesson: { isNot: null },
      ...(branchSlug ? { subject: { branch: { slug: branchSlug } } } : {}),
    },
    orderBy: { order: "asc" },
    take: limit ?? 400,
    select: {
      id: true,
      titleAr: true,
      titleFr: true,
      subject: {
        select: {
          slug: true,
          nameAr: true,
          nameFr: true,
          branch: { select: { slug: true, nameAr: true, nameFr: true } },
        },
      },
      _count: { select: { questions: true } },
    },
  });

  if (lessons.length === 0) return null;

  return (
    <section className="mt-12">
      {heading ? <div className="label mb-5">{heading}</div> : null}
      <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {lessons.map((ch) => (
          <Link
            key={ch.id}
            href={`/lesson/${ch.id}`}
            className="panel panel-hover p-4 flex flex-col justify-between gap-3"
          >
            <div>
              <div className="mono text-[11px] text-[var(--ink-3)] mb-1">
                {lang === "ar" ? ch.subject.branch.nameAr : ch.subject.branch.nameFr} ·{" "}
                {lang === "ar" ? ch.subject.nameAr : ch.subject.nameFr}
              </div>
              <div className="font-bold text-[var(--ink)] text-sm leading-snug">
                {lang === "ar" ? ch.titleAr : ch.titleFr}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag">
                <Icon name="book" size={13} /> {t(lang, "lessonView")}
              </span>
              {ch._count.questions > 0 ? (
                <Link
                  href={`/quiz/${ch.id}`}
                  className="tag hover:border-[var(--brand)]"
                  aria-label={t(lang, "startQuiz")}
                >
                  <Icon name="target" size={13} /> {ch._count.questions}
                </Link>
              ) : null}
              <Link
                href={`/branches/${ch.subject.branch.slug}/matiere/${ch.subject.slug}`}
                className="tag underline underline-offset-2"
              >
                {lang === "ar" ? ch.subject.nameAr : ch.subject.nameFr}
              </Link>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}