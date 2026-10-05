import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { mkMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { DemoVideo } from "@/components/DemoVideo";
import { SourceCredits } from "@/components/SourceCredits";
import { JsonLd } from "@/components/JsonLd";
import { LessonLinks } from "@/components/LessonLinks";
import { Icon, branchIcon, type IconName } from "@/components/Icon";

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

const FEATURES: { icon: IconName; kt: string; kd: string }[] = [
  { icon: "gift", kt: "homeFeat1t", kd: "homeFeat1d" },
  { icon: "wifiOff", kt: "homeFeat2t", kd: "homeFeat2d" },
  { icon: "landmark", kt: "homeFeat3t", kd: "homeFeat3d" },
  { icon: "sparkles", kt: "homeFeat4t", kd: "homeFeat4d" },
];

const STEPS: readonly { n: string; icon: IconName; t: string }[] = [
  { n: "01", icon: "landmark", t: "onboardTitleBranches" },
  { n: "02", icon: "book", t: "lessonsAndQuiz" },
  { n: "03", icon: "trend", t: "progressTitle" },
];

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

  const faqs: { q: string; a: string }[] = [
    { q: t(lang, "faq1q"), a: t(lang, "faq1a") },
    { q: t(lang, "faq2q"), a: t(lang, "faq2a") },
    { q: t(lang, "faq3q"), a: t(lang, "faq3a") },
    { q: t(lang, "faq4q"), a: t(lang, "faq4a") },
    { q: t(lang, "faq5q"), a: t(lang, "faq5a") },
  ];

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      {/* HERO */}
      <section className="relative border-b border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="label">
              <Icon name="pin" size={15} />
              {lang === "ar" ? "برنامج الباكالوريا الوطني" : "Programme national du Bac"}
            </span>
            <h1 className="display-1 text-[var(--ink)] mt-6">
              <span className="block" data-fx="split">
                {lang === "ar" ? "تعلّم، تمرّن،" : "Passe ton"}
              </span>
              <span className="block text-[var(--brand)]" data-fx="rise">
                {lang === "ar" ? "ننجح في الباك." : "#Bac, serein."}
              </span>
            </h1>
            <p className="sec-sub mt-6">{t(lang, "homeHeroSub")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/branches" className="btn">
                {t(lang, "homeStart")} <Icon name="arrowRight" size={17} />
              </Link>
              <Link href="/resources" className="btn btn-ghost">
                <Icon name="file" size={17} /> {t(lang, "navResources")}
              </Link>
            </div>
          </div>

          <Reveal delay={200}>
            <DemoVideo
              priority
              playText={t(lang, "videoPlay")}
              badgeText={t(lang, "videoBadge")}
              altText={lang === "ar" ? "فيديو عرض لكيفية عمل ناجح" : "Vidéo de démo de Najih"}
            />
            <div className="mt-4 text-center sm:text-start">
              <span className="label mx-auto sm:mx-0 inline-flex">{t(lang, "videoLabel")}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee my-8" aria-hidden>
        <div className="marquee-track">
          {[...marqueeWords, ...marqueeWords].map((w, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              {w}
              <i className="inline-block w-1 h-1 rounded-full bg-[var(--line-strong)]" />
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.kt} delay={i * 60}>
              <div className="panel panel-hover p-6 h-full">
                <div className="w-11 h-11 grid place-items-center rounded-[var(--r-md)] border border-[var(--line)] text-[var(--brand)] mb-4">
                  <Icon name={f.icon} size={22} />
                </div>
                <h3 className="font-semibold text-[19px] text-[var(--ink)]">{t(lang, f.kt)}</h3>
                <p className="text-[15px] text-[var(--m)] mt-2 leading-relaxed">{t(lang, f.kd)}</p>
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
            <h2 className="sec-title text-[var(--ink)] mt-2">
              {lang === "ar" ? "طريقك نحو التفوق" : "Ton chemin vers la réussite"}
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
<div className="pt-5 border-t border-[var(--line)] flex items-start gap-4">
                  <span className="grid place-items-center w-10 h-10 rounded-[var(--r-sm)] border border-[var(--line)] text-[var(--ink-3)] flex-none">
                    <Icon name={s.icon} size={20} />
                  </span>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--ink-3)] tabular-nums">{s.n}</div>
                    <h3 className="font-semibold text-[17px] text-[var(--ink)] mt-1">{t(lang, s.t)}</h3>
                  </div>
                </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BRANCHES */}
      <section className="border-y border-[var(--line)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
          <Reveal>
            <div className="mb-10">
              <span className="label mb-3">{lang === "ar" ? "انطلق بحسب شعبتك" : "Lance-toi par filière"}</span>
              <h2 className="sec-title text-[var(--ink)] mt-2">{t(lang, "branchesTitle")}</h2>
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
                      <div className="w-12 h-12 grid place-items-center rounded-[var(--r-md)] border border-[var(--line)] text-[var(--brand)] mb-4">
                        <Icon name={branchIcon(b.slug)} size={24} />
                      </div>
                      <h3>{lang === "ar" ? b.nameAr : b.nameFr}</h3>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="tag">{lessonCount} {t(lang, "lessons")}</span>
                      <span className="tag">{questions} {t(lang, "questions")}</span>
                      <span className="tag">
                        <Icon name="file" size={13} /> {b._count.resources}
                      </span>
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

      {/* POPULAR LESSONS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <Reveal>
          <div className="mb-8">
            <span className="label mb-3">{lang === "ar" ? "دروس مباشرة" : "Leçons directes"}</span>
            <h2 className="sec-title text-[var(--ink)] mt-2">
              {lang === "ar" ? "ابدأ مباشرة من أي درس" : "Commencez par n'importe quelle leçon"}
            </h2>
            <p className="sec-sub mt-3">
              {lang === "ar"
                ? "روابط مباشرة لأهم الدروس — للوصول السريع لصفحتك المفضلة."
                : "Liens directs vers les leçons principales pour accéder vite à votre page préférée."}
            </p>
          </div>
        </Reveal>
        <LessonLinks
          lang={lang}
          limit={48}
          heading={lang === "ar" ? "جميع الدروس" : "Toutes les leçons"}
        />
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
        <Reveal>
          <div className="mb-8 text-center">
            <span className="label mb-3">{t(lang, "navAi")}</span>
            <h2 className="sec-title text-[var(--ink)] mt-2">{t(lang, "faqTitle")}</h2>
          </div>
        </Reveal>
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {faqs.map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <details className="panel panel-hover p-5 group" open={i === 0}>
                <summary className="flex items-center justify-between gap-4 font-semibold text-[17px] text-[var(--ink)] cursor-pointer list-none">
                  {f.q}
                  <span className="text-[var(--brand)] flex-none transition-transform group-open:rotate-45" aria-hidden>
                    <Icon name="plus" size={18} />
                  </span>
                </summary>
                <p className="text-[15px] text-[var(--m)] mt-3 leading-relaxed">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* THANKS / SOURCE CREDITS */}
      <SourceCredits lang={lang} />
    </main>
  );
}