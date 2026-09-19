import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { mkMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return mkMeta({
    lang,
    path: "/resources",
    title: lang === "ar" ? "الموارد والامتحانات" : "Ressources & examens",
    description:
      lang === "ar"
        ? "جميع الموارد: امتحانات وطنية، تمارين ودروس PDF لكل الشعب — تحميل مباشر ومجاني."
        : "Toutes les ressources : examens nationaux, exercices et cours PDF pour toutes les filières — téléchargement direct et gratuit.",
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

export default async function ResourcesPage() {
  const lang = await getLang();
  const branches = await prisma.branch.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      nameAr: true,
      nameFr: true,
      _count: { select: { resources: true } },
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="crumb mb-8">
        <Link href="/">{t(lang, "navHome")}</Link>
        <span className="mx-2 text-[var(--p)]">/</span>
        <span className="text-[var(--b)]">{t(lang, "navResources")}</span>
      </div>

      <div className="mb-12">
        <div className="label mb-4">📄 {t(lang, "resourcesTitle")}</div>
        <h1 className="sec-title text-[var(--b)]">{t(lang, "resourcesTitle")}</h1>
        <p className="sec-sub mt-3">{t(lang, "resourcesSub")}</p>
      </div>

      <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((b, i) => (
          <Link key={b.id} href={`/resources/${b.slug}`} className="svc-card">
            <span className="svc-card__idx">0{i + 1} — {lang === "ar" ? b.nameAr : b.nameFr}</span>
            <div className="svc-card__body mt-4">
              <div className="text-4xl mb-3">{ICONS[b.slug] ?? "📄"}</div>
              <h3>{lang === "ar" ? b.nameAr : b.nameFr}</h3>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="tag">{b._count.resources} 📄</span>
            </div>
            <span className="svc-card__arrow">{t(lang, "homeStart")} <i /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}