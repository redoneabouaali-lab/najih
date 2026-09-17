import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

const ICONS: Record<string, string> = {
  sm: "📐",
  svt: "🧬",
  sp: "⚗️",
  lettres: "📖",
  eco: "💼",
  arts: "🎨",
};

export default async function Home() {
  const lang = await getLang();

  const branches = await prisma.branch.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { resources: true } },
      subjects: {
        select: {
          chapters: {
            select: {
              lesson: { select: { id: true } },
              _count: { select: { questions: true } },
            },
          },
        },
      },
    },
  });

  const totalQuestions = branches.reduce(
    (s, b) => s + b.subjects.reduce((s2, sub) => s2 + sub.chapters.reduce((s3, c) => s3 + c._count.questions, 0), 0),
    0,
  );
  const totalLessons = branches.reduce(
    (s, b) => s + b.subjects.reduce((s2, sub) => s2 + sub.chapters.filter((c) => c.lesson).length, 0),
    0,
  );
  const totalResources = branches.reduce((s, b) => s + b._count.resources, 0);

  const marqueeWords = ["دروس", "تمارين", "امتحانات", "اختبارات", "مرشد ذكي", "باكالوريا"];

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-10 px-4 sm:px-8 bg-[var(--w)]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="label label-inline mb-8 !justify-start !flex">
              <span className="mono">📌</span> {lang === "ar" ? "برنامج الباكالوريا الوطني" : "Programme national du Bac"}
              <span className="mono glow-dot ml-1 inline-block w-2 h-2 bg-[var(--b)]" />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display-1 text-[var(--b)]">
              {lang === "ar" ? (
                <>تعلّم. #{t(lang, "appName")}</>
              ) : (
                <>Passe ton <span className="text-[var(--l)]">#Bac</span></>
              )}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="sec-sub mt-6">{t(lang, "homeHeroSub")}</p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/branches" className="btn btn-emerald">
                {t(lang, "homeStart")} <span aria-hidden>←</span>
              </Link>
              <Link href="/resources" className="btn btn-ghost">
                📄 {t(lang, "navResources")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee my-10" aria-hidden>
        <div className="marquee-track">
          {[...marqueeWords, ...marqueeWords].map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-12">
        <div className="stats">
          <div className="stat"><div className="stat-num">{branches.length}</div><div className="stat-label">{t(lang, "navBranches")}</div></div>
          <div className="stat"><div className="stat-num">{totalLessons}</div><div className="stat-label">{t(lang, "lessons")}</div></div>
          <div className="stat"><div className="stat-num">{totalQuestions}</div><div className="stat-label">{t(lang, "questions")}</div></div>
          <div className="stat"><div className="stat-num">{totalResources}</div><div className="stat-label">{t(lang, "navResources")}</div></div>
        </div>
      </section>

      {/* BRANCHES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
        <Reveal>
          <div className="mb-10">
            <div className="label mb-3">{lang === "ar" ? "02 — اختر شعبتك" : "02 — Choisis ta filière"}</div>
            <h2 className="sec-title text-[var(--b)]">{t(lang, "branchesTitle")}</h2>
            <p className="sec-sub mt-3">{t(lang, "branchesSub")}</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((b, i) => {
            const questions = b.subjects.reduce(
              (s, sub) => s + sub.chapters.reduce((c, ch) => c + ch._count.questions, 0),
              0,
            );
            const lessonCount = b.subjects.reduce(
              (s, sub) => s + sub.chapters.filter((ch) => ch.lesson).length,
              0,
            );
            return (
              <Reveal key={b.id} delay={i * 60}>
                <Link href={`/branches/${b.slug}`} className="svc-card">
                  <span className="svc-card__idx">0{i + 1} — {lang === "ar" ? b.nameAr : b.nameFr}</span>
                  <div className="svc-card__body mt-4">
                    <div className="text-4xl mb-3">{ICONS[b.slug] ?? "🎓"}</div>
                    <h3>{lang === "ar" ? b.nameAr : b.nameFr}</h3>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="tag">{lessonCount} {t(lang, "lessons")}</span>
                    <span className="tag">{questions} {t(lang, "questions")}</span>
                    <span className="tag">{b._count.resources} 📄</span>
                  </div>
                  <span className="svc-card__arrow">
                    {t(lang, "homeStart")} <i />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </main>
  );
}