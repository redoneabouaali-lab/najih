import { t, type Lang } from "@/lib/lang";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/TiltCard";

type Source = {
  domain: string;
  url: string;
  brand: string;
  icon: string;
  tone: string;
  count: number;
  ar: string;
  fr: string;
};

const SOURCES: Source[] = [
  {
    domain: "madarisy.com",
    url: "https://madarisy.com",
    brand: "Madarisy",
    icon: "🎓",
    tone: "from-indigo-500 to-sky-400",
    count: 6133,
    ar: "دروس وتمارين وامتحانات وطنية بصيغة PDF لجميع الشعب.",
    fr: "Cours, exercices et examens nationaux en PDF, toutes filières.",
  },
  {
    domain: "moutamadriss.ma",
    url: "https://moutamadriss.ma",
    brand: "Moutamadriss",
    icon: "📚",
    tone: "from-sky-500 to-cyan-400",
    count: 1776,
    ar: "ملخصات الدروس، الفروض والامتحانات الوطنية.",
    fr: "Résumés de cours, devoirs et examens nationaux.",
  },
  {
    domain: "dyrassa.ma",
    url: "https://www.dyrassa.ma",
    brand: "Dyrassa",
    icon: "📝",
    tone: "from-violet-500 to-indigo-400",
    count: 1154,
    ar: "دروس وفروض وامتحانات مصنّفة حسب المادة والمستوى.",
    fr: "Cours, devoirs et examens classés par matière et niveau.",
  },
  {
    domain: "moutamadris.ma",
    url: "https://moutamadris.ma",
    brand: "Moutamadris",
    icon: "🧭",
    tone: "from-emerald-500 to-teal-400",
    count: 610,
    ar: "مكتبة الدروس والفروض والامتحانات الوطنية.",
    fr: "Bibliothèque de cours, devoirs et examens nationaux.",
  },
  {
    domain: "doross.ma",
    url: "https://doross.ma",
    brand: "Doross",
    icon: "🗂️",
    tone: "from-amber-500 to-orange-400",
    count: 554,
    ar: "دروس وتمارين وامتحانات لجميع المواد.",
    fr: "Cours, exercices et examens pour toutes les matières.",
  },
];

const CONFETTI = [
  { l: "6%", d: "0s", c: "#818cf8" },
  { l: "23%", d: "0.9s", c: "#38bdf8" },
  { l: "44%", d: "1.7s", c: "#f472b6" },
  { l: "61%", d: "0.4s", c: "#fbbf24" },
  { l: "79%", d: "1.3s", c: "#34d399" },
  { l: "93%", d: "2.1s", c: "#c084fc" },
];

export function SourceCredits({ lang }: { lang: Lang }) {
  return (
    <section id="sources" className="relative overflow-hidden bg-[#0a0f2e] text-white">
      <div className="aurora" aria-hidden data-fx="parallax" data-fx-speed="0.15">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div
        className="absolute inset-0 opacity-[0.08]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />
      {CONFETTI.map((p, i) => (
        <span
          key={i}
          className="confetti"
          aria-hidden
          style={{ left: p.l, top: "9%", background: p.c, animationDelay: p.d }}
        />
      ))}

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[12px] font-bold text-white/90">
              <span className="float-e" aria-hidden>
                ❤️
              </span>
              {t(lang, "thanksLabel")}
            </span>
            <h2 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-pink-300">
                {t(lang, "thanksTitle")}
              </span>
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70">{t(lang, "thanksSub")}</p>
          </div>
        </Reveal>

        <div className="ticker mt-10 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="ticker-track">
            {[...SOURCES, ...SOURCES].map((s, i) => (
              <span
                key={i}
                dir="ltr"
                className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-[12px] font-bold text-white/70"
              >
                {s.domain}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SOURCES.map((s, i) => (
            <Reveal key={s.domain} delay={i * 70} className="h-full">
              <TiltCard className="relative h-full rounded-2xl">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sweep-card group relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur transition duration-300 hover:border-white/25 hover:bg-white/[0.1] hover:shadow-[0_20px_50px_-20px_rgba(56,189,248,0.55)]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${s.tone} text-2xl shadow-lg`}
                    >
                      {s.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold leading-tight">{s.brand}</div>
                      <div className="truncate text-[12px] text-white/55" dir="ltr">
                        {s.domain}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 flex-1 text-[13px] leading-relaxed text-white/75">
                    {lang === "ar" ? s.ar : s.fr}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/80">
                      {s.count.toLocaleString("fr-FR")}+ {t(lang, "thanksFiles")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-sky-300 transition-all group-hover:gap-2">
                      {t(lang, "thanksVisit")} <span aria-hidden>↗</span>
                    </span>
                  </div>
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={140}>
          <div className="grad-border mt-12 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-2xl text-[15px] font-bold leading-relaxed text-[var(--b)]">
                {t(lang, "thanksCta")}
              </p>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((s) => (
                  <a
                    key={s.domain}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-[12px] font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {s.brand} ↗
                  </a>
                ))}
              </div>
            </div>
            <p className="mt-5 border-t border-[var(--p)] pt-4 text-[12px] leading-relaxed text-[var(--l)]">
              {t(lang, "thanksNote")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
