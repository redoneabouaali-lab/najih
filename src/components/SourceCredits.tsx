import { t, type Lang } from "@/lib/lang";
import { Icon } from "@/components/Icon";

type Source = {
  domain: string;
  url: string;
  brand: string;
  count: number;
  ar: string;
  fr: string;
};

const SOURCES: Source[] = [
  {
    domain: "madarisy.com",
    url: "https://madarisy.com",
    brand: "Madarisy",
    count: 6133,
    ar: "دروس وتمارين وامتحانات وطنية بصيغة PDF لجميع الشعب.",
    fr: "Cours, exercices et examens nationaux en PDF, toutes filières.",
  },
  {
    domain: "moutamadriss.ma",
    url: "https://moutamadriss.ma",
    brand: "Moutamadriss",
    count: 1776,
    ar: "ملخصات الدروس، الفروض والامتحانات الوطنية.",
    fr: "Résumés de cours, devoirs et examens nationaux.",
  },
  {
    domain: "dyrassa.ma",
    url: "https://www.dyrassa.ma",
    brand: "Dyrassa",
    count: 1154,
    ar: "دروس وفروض وامتحانات مصنّفة حسب المادة والمستوى.",
    fr: "Cours, devoirs et examens classés par matière et niveau.",
  },
  {
    domain: "moutamadris.ma",
    url: "https://moutamadris.ma",
    brand: "Moutamadris",
    count: 610,
    ar: "مكتبة الدروس والفروض والامتحانات الوطنية.",
    fr: "Bibliothèque de cours, devoirs et examens nationaux.",
  },
  {
    domain: "doross.ma",
    url: "https://doross.ma",
    brand: "Doross",
    count: 554,
    ar: "دروس وتمارين وامتحانات لجميع المواد.",
    fr: "Cours, exercices et examens pour toutes les matières.",
  },
];

export function SourceCredits({ lang }: { lang: Lang }) {
  return (
    <section id="sources" className="bg-[var(--surface)] border-y border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <div className="max-w-2xl" data-reveal>
          <span className="label" data-reveal="rule">
            <Icon name="check" size={15} />
            {t(lang, "thanksLabel")}
          </span>
          <h2 className="sec-title text-[var(--ink)] mt-4">{t(lang, "thanksTitle")}</h2>
          <p className="sec-sub mt-3 text-[17px]">{t(lang, "thanksSub")}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2" data-reveal-group data-reveal-step="35" data-reveal-cap="10">
          {SOURCES.map((s) => (
            <span
              key={s.domain}
              dir="ltr"
              className="rounded-[var(--r-pill)] border border-[var(--line)] bg-[var(--surface-sunk)] px-3 py-1 text-[13px] font-medium text-[var(--ink-2)]"
            >
              {s.domain}
            </span>
          ))}
        </div>

        <div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          data-reveal-group
          data-reveal-step="70"
          data-reveal-cap="6"
        >
          {SOURCES.map((s) => (
              <a
                key={s.domain}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                data-reveal="scale"
                className="panel panel-hover group flex h-full flex-col p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-[var(--r-md)] border border-[var(--line)] text-[18px] font-semibold text-[var(--brand)]">
                    {s.brand.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold leading-tight text-[var(--ink)]">{s.brand}</div>
                    <div className="truncate text-[13px] text-[var(--ink-3)]" dir="ltr">
                      {s.domain}
                    </div>
                  </div>
                </div>

                <p className="mt-4 flex-1 text-[14px] leading-relaxed text-[var(--ink-2)]">
                  {lang === "ar" ? s.ar : s.fr}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-[var(--r-pill)] bg-[var(--surface-sunk)] px-3 py-1 text-[13px] font-medium text-[var(--ink-2)] tabular-nums">
                    <span data-count-to={s.count}>{s.count.toLocaleString("fr-FR")}</span>+ {t(lang, "thanksFiles")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--brand)]">
                    {t(lang, "thanksVisit")} <Icon name="arrowRight" size={14} />
                  </span>
                </div>
              </a>
          ))}
        </div>

        <div data-reveal="scale">
          <div className="mt-12 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface-sunk)] p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-2xl text-[16px] font-medium leading-relaxed text-[var(--ink)]">
                {t(lang, "thanksCta")}
              </p>
              <div className="flex flex-wrap gap-2" data-reveal-group data-reveal-step="45" data-reveal-cap="8">
                {SOURCES.map((s) => (
                  <a
                    key={s.domain}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[var(--r-md)] border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-[13px] font-medium text-[var(--ink-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  >
                    {s.brand} ↗
                  </a>
                ))}
              </div>
            </div>
            <p className="mt-5 border-t border-[var(--line)] pt-4 text-[13px] leading-relaxed text-[var(--ink-3)]">
              {t(lang, "thanksNote")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}