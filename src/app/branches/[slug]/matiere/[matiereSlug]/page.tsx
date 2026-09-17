import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import Link from "next/link";

type Props = { params: Promise<{ slug: string; matiereSlug: string }> };

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

const SESSION_KEY: Record<string, string> = {
  normal: "sessionNormal",
  rattrapage: "sessionRattrapage",
};

export default async function MatierePage({ params }: Props) {
  const { slug, matiereSlug } = await params;
  const lang = await getLang();

  const branch = await prisma.branch.findUnique({ where: { slug } });
  if (!branch) return <div className="p-8 text-center text-gray-500">Branch not found</div>;

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

  if (!subject) return <div className="p-8 text-center text-gray-500">Matière not found</div>;

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
  const exams = resources.filter((r) => r.kind === "exam");

  const byYear = new Map<number | null, { session: string | null; rows: typeof exams }[]>();
  for (const e of exams) {
    if (!byYear.has(e.year)) byYear.set(e.year, []);
    const arr = byYear.get(e.year)!;
    let sg = arr.find((s) => s.session === e.session);
    if (!sg) {
      sg = { session: e.session, rows: [] };
      arr.push(sg);
    }
    sg.rows.push(e);
  }
  const years = [...byYear.keys()].sort((a, b) => (b ?? 0) - (a ?? 0));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="crumb mb-8">
        <Link href="/">{t(lang, "navHome")}</Link>
        <span className="mx-2 text-[var(--p)]">/</span>
        <Link href={`/branches/${slug}`}>{lang === "ar" ? branch.nameAr : branch.nameFr}</Link>
        <span className="mx-2 text-[var(--p)]">/</span>
        <span className="text-[var(--b)]">{lang === "ar" ? subject.nameAr : subject.nameFr}</span>
      </div>

      <div className="mb-12">
        <div className="label mb-4">01 — {t(lang, "matiere")}</div>
        <h1 className="sec-title text-[var(--b)]">
          {subject.icon} {lang === "ar" ? subject.nameAr : subject.nameFr}
        </h1>
        <p className="sec-sub mt-3">{lang === "ar" ? branch.nameAr : branch.nameFr}</p>
      </div>

      <section className="mb-16">
        <div className="label mb-5">02 — {t(lang, "lessonsAndQuiz")}</div>
        {subject.chapters.length === 0 && (
          <p className="text-[var(--l)]">{t(lang, "noLessonsMatiere")}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subject.chapters.map((ch, i) => (
            <Link
              key={ch.id}
              href={`/lesson/${ch.id}`}
              className="panel panel-hover p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="mono text-xs text-[var(--l)] mb-2">0{i + 1} · {lang === "ar" ? branch.nameAr : branch.nameFr}</div>
                <div className="font-bold text-[var(--b)]">{lang === "ar" ? ch.titleAr : ch.titleFr}</div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <span className="btn btn-emerald btn-sm !px-4">📖 {t(lang, "lessonView")}</span>
                {ch._count.questions > 0 && (
                  <span className="tag">🎯 {ch._count.questions}</span>
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
                <span className="entry__meta"><b>⬇ PDF</b></span>
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

      {exams.length > 0 && (
        <section>
          <div className="label mb-5">05 — {t(lang, "examSection")}</div>
          {years.map((year) => {
            const sessions = byYear.get(year)!.sort((a, b) => {
              const rank = (s: string | null) => (s === "normal" ? 0 : s === "rattrapage" ? 1 : 2);
              return rank(a.session) - rank(b.session);
            });
            return (
              <div key={String(year)} className="mb-8">
                <div className="label mb-3">{year}</div>
                <div className="journal">
                  {sessions.flatMap((sg) =>
                    sg.rows.map((r, i) => (
                      <a
                        key={r.id}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="entry"
                      >
                        <span className="entry__idx">0{i + 1}<i /></span>
                        <span>
                          <span className="entry__title block">
                            {sg.session ? t(lang, SESSION_KEY[sg.session]) : year}
                          </span>
                          <span className="entry__role block mt-2">
                            {r.titleFr.toLowerCase().includes("correction") ? `✅ ${t(lang, "kCorrection")}` : `📋 ${t(lang, "kSujet")}`}
                          </span>
                        </span>
                        <span className="entry__meta"><b>↗</b></span>
                      </a>
                    )),
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}