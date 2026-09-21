import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { mkMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Hero3D } from "@/components/Hero3D";
import { SourceCredits } from "@/components/SourceCredits";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return mkMeta({
    lang,
    path: "/",
    title: lang === "ar" ? "الرئيسية — دروس وامتحانات الباكالوريا المغربية" : "Accueil — Cours & examens du Bac Maroc",
    description:
      lang === "ar"
        ? "ناجح: دروس، تمارين، امتحانات وطنية تفاعلية ومرشد ذكي لتحضير الباكالوريا المغربية. مجاني 100%."
        : "Najih : cours, exercices, examens nationaux interactifs et tuteur IA pour préparer le Bac marocain. 100% gratuit.",
  });
}

const ICONS: Record<string, string> = {
  sm: "📐",
  svt: "🧬",
  sp: "⚗️",
  lettres: "📖",
  eco: "💼",
  arts: "🎨",
};

const FEATURES = [
  { icon: "🎁", kt: "homeFeat1t", kd: "homeFeat1d" },
  { icon: "📴", kt: "homeFeat2t", kd: "homeFeat2d" },
  { icon: "🏛️", kt: "homeFeat3t", kd: "homeFeat3d" },
  { icon: "🤖", kt: "homeFeat4t", kd: "homeFeat4d" },
];

const STEPS =
  [
    { n: "01", icon: "🎯", t: "onboardTitleBranches" },
    { n: "02", icon: "📚", t: "lessonsAndQuiz" },
    { n: "03", icon: "📈", t: "progressTitle" },
  ] as const;

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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-sky-100" aria-hidden />
        <div className="aurora aurora-light" aria-hidden data-fx="parallax" data-fx-speed="0.18">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="blob absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-200/60 blur-3xl" aria-hidden />
        <div className="blob absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-indigo-200/70 blur-3xl" style={{ animationDuration: "18s" }} aria-hidden />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Reveal>
              <span className="label">
                📌 {lang === "ar" ? "برنامج الباكالوريا الوطني" : "Programme national du Bac"}
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="display-1 text-[var(--b)] mt-6 sm:text-6xl text-[42px] leading-[1.05]">
                <span className="block" data-fx="split">
                  {lang === "ar" ? "تعلّم، تمرّن،" : "Passe ton"}
                </span>
                <span
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500 txt-shimmer"
                  data-fx="rise"
                >
                  {lang === "ar" ? "ننجح في الباك." : "#Bac, serein."}
                </span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="sec-sub mt-6">{t(lang, "homeHeroSub")}</p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/branches" className="btn">
                  {t(lang, "homeStart")} <span aria-hidden>→</span>
                </Link>
                <Link href="/resources" className="btn btn-ghost">
                  📄 {t(lang, "navResources")}
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="relative">
            <div className="float">
              <Hero3D alt={lang === "ar" ? "طلاب ناجح يدرسون" : "Élèves Najih qui révisent"} />
            </div>
            <div className="float-sm absolute -bottom-5 left-6 sm:left-10 rounded-2xl bg-white border border-[var(--p)] shadow-[var(--shadow-md)] px-5 py-3 flex items-center gap-3" style={{ animationDelay: "0.6s" }}>
              <span className="glow-dot w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-sky-400" />
              <span className="text-[13px] font-bold text-[var(--b)]">
                +{branches.length} {t(lang, "navBranches")}
                <span className="block text-[11px] font-medium text-[var(--l)]">100% gratuit</span>
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee my-8" aria-hidden>
        <div className="marquee-track">
          {[...marqueeWords, ...marqueeWords].map((w, i) => (
            <span key={i}>{w} ✦</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.kt} delay={i * 60}>
              <div className="panel panel-hover p-6 h-full">
                <div className="w-12 h-12 grid place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-2xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-[var(--b)]">{t(lang, f.kt)}</h3>
                <p className="text-sm text-[var(--l)] mt-1.5">{t(lang, f.kd)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-12">
        <div className="stats">
          <Reveal>
            <div className="stat"><div className="stat-num" data-fx="counter" data-to={branches.length}>{branches.length}</div><div className="stat-label">{t(lang, "navBranches")}</div></div>
          </Reveal>
          <Reveal delay={60}>
            <div className="stat"><div className="stat-num" data-fx="counter" data-to={totalLessons}>{totalLessons}</div><div className="stat-label">{t(lang, "lessons")}</div></div>
          </Reveal>
          <Reveal delay={120}>
            <div className="stat"><div className="stat-num" data-fx="counter" data-to={totalQuestions}>{totalQuestions}</div><div className="stat-label">{t(lang, "questions")}</div></div>
          </Reveal>
          <Reveal delay={180}>
            <div className="stat"><div className="stat-num" data-fx="counter" data-to={totalResources}>{totalResources}</div><div className="stat-label">{t(lang, "navResources")}</div></div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <Reveal>
          <div className="mb-8">
            <span className="label mb-3">{lang === "ar" ? "ثلاث خطوات" : "Trois étapes"}</span>
            <h2 className="sec-title text-[var(--b)] mt-2">
              {lang === "ar" ? "طريقك نحو التفوق" : "Ton chemin vers la réussite"}
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div className="panel p-6 h-full flex items-start gap-4">
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <div className="text-[12px] font-bold text-[var(--acc)] tracking-wide">{s.n}</div>
                  <h3 className="font-bold text-[var(--b)] mt-1">{t(lang, s.t)}</h3>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BRANCHES */}
      <section className="bg-gradient-to-b from-indigo-50/70 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
          <Reveal>
            <div className="mb-10">
              <span className="label mb-3">{lang === "ar" ? "انطلق بحسب شعبتك" : "Lance-toi par filière"}</span>
              <h2 className="sec-title text-[var(--b)] mt-2">{t(lang, "branchesTitle")}</h2>
              <p className="sec-sub mt-3">{t(lang, "branchesSub")}</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                      <div className="w-14 h-14 grid place-items-center rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-100 text-3xl mb-3">
                        {ICONS[b.slug] ?? "🎓"}
                      </div>
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
        </div>
      </section>

      {/* THANKS / SOURCE CREDITS */}
      <SourceCredits lang={lang} />
    </main>
  );
}