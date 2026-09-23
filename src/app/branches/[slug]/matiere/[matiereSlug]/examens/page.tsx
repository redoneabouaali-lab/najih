import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { mkMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContext } from "@/components/PageContext";

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
  return mkMeta({
    lang,
    path: `/branches/${slug}/matiere/${matiereSlug}/examens`,
    title: `${subject.icon} ${name} — ${lang === "ar" ? "الامتحانات الوطنية" : "examens nationaux"}`,
    description:
      lang === "ar"
        ? `جميع الامتحانات الوطنية لمادة ${name} (شعبة ${branch.nameAr}) مع التصحيح، الدورة العادية والاستدراكية.`
        : `Tous les examens nationaux de ${subject.nameFr} (${branch.nameFr}) avec corrections, session normale et rattrapage.`,
    keywords: [name],
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

const SESSION_KEY: Record<string, string> = {
  normal: "sessionNormal",
  rattrapage: "sessionRattrapage",
};

export default async function MatiereExamensPage({ params }: Props) {
  const { slug, matiereSlug } = await params;
  const lang = await getLang();

  const branch = await prisma.branch.findUnique({ where: { slug } });
  if (!branch) return <div className="p-8 text-center text-gray-500">Branch not found</div>;

  const subject = await prisma.subject.findUnique({
    where: { branchId_slug: { branchId: branch.id, slug: matiereSlug } },
  });
  if (!subject) return <div className="p-8 text-center text-gray-500">Matière not found</div>;

  const keys = SUBJECT_KEYMAP[subject.slug] ?? [];
  const exams = await prisma.resource.findMany({
    where: {
      branchId: branch.id,
      kind: "exam",
      OR: [{ subjectKey: { in: keys } }, { subjectKey: null }],
    },
    orderBy: [{ year: "desc" }, { session: "asc" }],
  });

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

  const assistContext = `الطالب يتصفح صفحة الامتحانات الوطنية لمادة ${lang === "ar" ? subject.nameAr : subject.nameFr} (شعبة ${lang === "ar" ? branch.nameAr : branch.nameFr}) لفتح ملفات PDF لأسئلة الامتحانات وتصحيحاتها (${years.length} سنوات، ${exams.length} ملف). لا يمكنك رؤية محتوى ملف الـ PDF المفتوح، لذلك اشرح للطالب الطريقة المنهجية لحل موضوع في هذا الامتحان، واعرض مثالاً محلولاً كاملاً بأسلوب "الدورة العادية"، ثم مثالاً إضافياً مختلفاً، ونصيحة للتدرب على التصحيح.`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <PageContext context={assistContext} />
      <div className="crumb mb-8">
        <Link href="/">{t(lang, "navHome")}</Link>
        <span className="mx-2 text-[var(--p)]">/</span>
        <Link href={`/branches/${slug}`}>{lang === "ar" ? branch.nameAr : branch.nameFr}</Link>
        <span className="mx-2 text-[var(--p)]">/</span>
        <Link href={`/branches/${slug}/matiere/${matiereSlug}`}>
          {lang === "ar" ? subject.nameAr : subject.nameFr}
        </Link>
        <span className="mx-2 text-[var(--p)]">/</span>
        <span className="text-[var(--b)]">{t(lang, "examsMatiereTitle")}</span>
      </div>

      <div className="mb-12">
        <div className="label mb-4">05 — {t(lang, "examSection")}</div>
        <h1 className="sec-title text-[var(--b)]">
          {subject.icon} {t(lang, "examsMatiereTitle")}
        </h1>
        <p className="sec-sub mt-3">{lang === "ar" ? branch.nameAr : branch.nameFr}</p>
        <span className="tag mt-4">{exams.length} 🗓️</span>
      </div>

      {years.length === 0 && <p className="text-[var(--l)]">{t(lang, "noResources")}</p>}

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
                        {r.titleFr.toLowerCase().includes("correction")
                          ? `✅ ${t(lang, "kCorrection")}`
                          : `📋 ${t(lang, "kSujet")}`}
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
    </div>
  );
}