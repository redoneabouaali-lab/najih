import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { mkMeta, branchAr, branchShortAr, branchShortFr } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContext } from "@/components/PageContext";
import { ContentUnderstand } from "@/components/ContentUnderstand";
import { Icon, type IconName } from "@/components/Icon";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLang();
  const branch = await prisma.branch.findUnique({
    where: { slug },
    select: { nameAr: true, nameFr: true },
  });
  if (!branch) return {};
  const branchLabel = branchAr(branch.nameAr);
  const shortLabel =
    lang === "ar" ? branchShortAr(slug, branch.nameAr) : branchShortFr(slug, branch.nameFr);
  return mkMeta({
    lang,
    path: `/resources/${slug}`,
    title:
      lang === "ar"
        ? `موارد وامتحانات شعبة ${shortLabel}`
        : `Ressources & examens — ${shortLabel}`,
    description:
      lang === "ar"
        ? `موارد شعبة ${branchLabel}: امتحانات وطنية، تمارين ودروس PDF — تحميل مباشر ومجاني عشية الباكالوريا.`
        : `Ressources ${branch.nameFr} : examens nationaux, exercices et cours PDF — téléchargement direct et gratuit.`,
    keywords: [branchLabel],
  });
}

export async function generateStaticParams() {
  const branches = await prisma.branch.findMany({ select: { slug: true } });
  return branches.map((b) => ({ slug: b.slug }));
}

const SUBJECTS: Record<
  string,
  { ar: string; fr: string; icon: IconName }
> = {
  svt: { ar: "علوم الحياة والأرض", fr: "SVT", icon: "dna" },
  sp: { ar: "العلوم الفيزيائية", fr: "Physique-Chimie", icon: "flask" },
  sm: { ar: "العلوم الرياضية", fr: "Mathématiques", icon: "math" },
  anglais: { ar: "الإنجليزية", fr: "Anglais", icon: "message" },
  maths: { ar: "الرياضيات", fr: "Mathématiques", icon: "math" },
};

const SESSION_KEY: Record<string, string> = {
  normal: "sessionNormal",
  rattrapage: "sessionRattrapage",
};

type Res = Awaited<
  ReturnType<typeof prisma.resource.findMany>
>[number];
type SessionGroup = {
  session: string | null;
  subjects: Record<
    string,
    { sujet?: Res; correction?: Res; other?: Res[] }
  >;
};

export default async function BranchResourcesPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getLang();

  const branch = await prisma.branch.findUnique({
    where: { slug },
    include: {
      resources: {
        orderBy: [{ year: "desc" }, { session: "asc" }, { subjectKey: "asc" }],
      },
    },
  });

  if (!branch)
    return <div className="p-8 text-center text-[var(--ink-3)]">Branch not found</div>;

  const lessons = branch.resources.filter((r) => r.kind === "lesson");
  const exercises = branch.resources.filter((r) => r.kind === "exercise");
  const exams = branch.resources.filter((r) => r.kind === "exam");

  // group: { year } -> sessions
  const byYear = new Map<number | null, SessionGroup[]>();
  for (const r of exams) {
    const year = r.year;
    if (!byYear.has(year)) byYear.set(year, []);
    const sessions = byYear.get(year)!;
    const session = r.session;
    const sg = sessions.find((s) => s.session === session);
    const group: SessionGroup = sg ?? { session, subjects: {} };
    if (!sg) sessions.push(group);
    const subjKey = r.subjectKey ?? "autre";
    const subj = (group.subjects[subjKey] ??= {});
    const isCorrection =
      r.titleFr.toLowerCase().includes("correction") ||
      r.titleAr.includes("تصحيح");
    if (isCorrection) {
      subj.correction = r;
    } else {
      if (subj.sujet) (subj.other ??= []).push(r);
      else subj.sujet = r;
    }
  }

  const years = [...byYear.keys()].sort((a, b) => (b ?? 0) - (a ?? 0));
  const orderedYears = years.length === 1 && years[0] === null ? years : years;

  const sessionOrder = (a: string | null, b: string | null) => {
    const rank = (s: string | null) =>
      s === "normal" ? 0 : s === "rattrapage" ? 1 : 2;
    return rank(a) - rank(b);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <PageContext
        context={`الطالب يبحث في صفحة موارد شعبة ${lang === "ar" ? branchAr(branch.nameAr) : branch.nameFr}: دروس PDF (${lessons.length})، تمارين (${exercises.length}) وامتحانات وطنية (${exams.length}) مع تصحيحاتها. الروابط في هذه الصفحة تفتح ملفات PDF. عندما يطلب الطالب مساعدة، اشرح له موضوع المادة وقدم مثالاً محلولاً وبسّط له المفاهيم كمعلم، واذكر له أن الملفات موجودة في السولار أعلاه.`}
      />
      <div className="crumb mb-8 flex items-center gap-1">
        <Link href="/">{t(lang, "navHome")}</Link>
        <span className="mx-2 text-[var(--line)]">/</span>
        <Link href="/resources">{t(lang, "navResources")}</Link>
        <span className="mx-2 text-[var(--line)]">/</span>
        <span className="text-[var(--ink)]">{lang === "ar" ? branch.nameAr : branch.nameFr}</span>
      </div>

      <div className="mb-12">
        <div className="label mb-4">
          <Icon name="file" size={15} />
          {t(lang, "navResources")}
        </div>
        <h1 className="sec-title text-[var(--ink)]">{lang === "ar" ? branch.nameAr : branch.nameFr}</h1>
        <p className="sec-sub mt-3">{t(lang, "resourcesSub")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="tag">
            <Icon name="book" size={13} /> {lessons.length}
          </span>
          <span className="tag">
            <Icon name="pen" size={13} /> {exercises.length}
          </span>
          <span className="tag">
            <Icon name="calendar" size={13} /> {exams.length}
          </span>
        </div>
        <Link
          href={`/branches/${slug}`}
          className="inline-flex items-center gap-2 mt-6 btn btn-ghost"
        >
          <Icon name="book" size={16} />
          {t(lang, "lessonsAndQuiz")}
          <Icon name="arrowRight" size={15} />
        </Link>
      </div>

      {branch.resources.length === 0 && (
        <p className="text-[var(--ink-3)]">{t(lang, "noResources")}</p>
      )}

      {lessons.length > 0 && (
        <section className="mb-16">
          <div className="label mb-5">01 — {t(lang, "lessonPdfSection")}</div>
          <div className="journal">
            {lessons.map((e, i) => (
              <div key={e.id} className="flex gap-2 items-stretch">
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="entry flex-1"
                >
                  <span className="entry__idx">0{i + 1}<i /></span>
                  <span className="entry__title block">{lang === "ar" ? e.titleAr : e.titleFr}</span>
                  <span className="entry__meta">
                    <b>
                      <Icon name="download" size={13} /> PDF
                    </b>
                  </span>
                </a>
                <ContentUnderstand
                  storageKey={`resource:${e.id}`}
                  input={{
                    resourceUrl: e.url,
                    title: lang === "ar" ? e.titleAr ?? undefined : e.titleFr ?? undefined,
                    kindHint: "lesson",
                    lang: lang === "ar" ? "ar" : "fr",
                  }}
                  label={lang === "ar" ? "فهم" : "Comprendre"}
                  buttonClassName="btn btn-sm !px-3 shrink-0 self-center"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {exercises.length > 0 && (
        <section className="mb-16">
          <div className="label mb-5">02 — {t(lang, "exerciseSection")}</div>
          <div className="journal">
            {exercises.map((e, i) => (
              <div key={e.id} className="flex gap-2 items-stretch">
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="entry flex-1"
                >
                  <span className="entry__idx">0{i + 1}<i /></span>
                  <span className="entry__title block">{lang === "ar" ? e.titleAr : e.titleFr}</span>
                  <span className="entry__meta"><b>↗</b></span>
                </a>
                <ContentUnderstand
                  storageKey={`resource:${e.id}`}
                  input={{
                    resourceUrl: e.url,
                    title: lang === "ar" ? e.titleAr ?? undefined : e.titleFr ?? undefined,
                    kindHint: "exercise",
                    lang: lang === "ar" ? "ar" : "fr",
                  }}
                  label={lang === "ar" ? "فهم" : "Comprendre"}
                  buttonClassName="btn btn-sm !px-3 shrink-0 self-center"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {orderedYears.map((year, yi) => {
        const sessions = byYear.get(year)!.sort((a, b) => sessionOrder(a.session, b.session));
        return (
          <section key={String(year)} className="mb-16">
            <div className="label mb-5">{String(yi + (lessons.length ? 1 : 0) + (exercises.length ? 1 : 0) + 1).padStart(2, "0")} — {year ?? t(lang, "countExams")}</div>

            {sessions.map((sg) => (
              <div key={String(sg.session)} className="mb-8">
                {sg.session && (
                  <div className="mono text-[11px] font-semibold tracking-[.14em] uppercase text-[var(--ink-3)] mb-3">
                    {t(lang, SESSION_KEY[sg.session])}
                  </div>
                )}
                <div className="journal">
                  {Object.entries(sg.subjects).map(([subjKey, subj]) => {
                    const meta =
                      SUBJECTS[subjKey] ??
                      ({ ar: subjKey, fr: subjKey, icon: "file" } as const);
                    return (
                      <div key={subjKey} className="entry">
                        <span className="entry__idx">
                          <Icon name={meta.icon} size={16} />
                          <i />
                        </span>
                        <div>
                          <div className="entry__title">{lang === "ar" ? meta.ar : meta.fr}</div>
                          {subj.sujet && (
                            <div className="entry__role mt-2">
                              {t(lang, "kSujet")} + {t(lang, "kCorrection")}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {subj.sujet && (
                              <a href={subj.sujet.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                                {t(lang, "kSujet")}
                                <Icon name="arrowRight" size={14} />
                              </a>
                            )}
                            {subj.sujet && (
                              <ContentUnderstand
                                storageKey={`resource:${subj.sujet.id}`}
                                input={{
                                  resourceUrl: subj.sujet.url,
                                  title: lang === "ar" ? subj.sujet.titleAr ?? undefined : subj.sujet.titleFr ?? undefined,
                                  kindHint: "exercise",
                                  lang: lang === "ar" ? "ar" : "fr",
                                }}
                                label={lang === "ar" ? "فهم" : "Comprendre"}
                                buttonClassName="btn btn-sm !px-3"
                              />
                            )}
                            {subj.correction && (
                              <a href={subj.correction.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                                {t(lang, "kCorrection")}
                                <Icon name="arrowRight" size={14} />
                              </a>
                            )}
                            {subj.other?.map((o) => (
                              <a key={o.id} href={o.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                                {lang === "ar" ? o.titleAr : o.titleFr}
                                <Icon name="arrowRight" size={14} />
                              </a>
                            ))}
                          </div>
                        </div>
                        <span className="entry__meta">
                          <b>
                            {subj.sujet ? <Icon name="check" size={14} /> : null}
                          </b>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}