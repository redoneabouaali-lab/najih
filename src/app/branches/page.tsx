import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { mkMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { Icon, branchIcon, subjectIcon, type IconName } from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return mkMeta({
    lang,
    path: "/branches",
    title: lang === "ar" ? "الشعب والمسالك" : "Filières",
    description:
      lang === "ar"
        ? "اختر شعبتك: العلوم الرياضية، الفيزياء، علوم الحياة والأرض، الآداب، الاقتصاد... دروس وامتحانات لكل شعبة."
        : "Choisis ta filière : sciences maths, physique, SVT, lettres, économie… Cours et examens pour chaque filière.",
  });
}

const ICONS: Record<string, IconName> = {
  sm: "math",
  svt: "dna",
  sp: "flask",
  lettres: "book",
  eco: "briefcase",
  arts: "palette",
};

export default async function BranchesPage() {
  const lang = await getLang();
  const branches = await prisma.branch.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { subjects: true, resources: true } },
      subjects: {
        select: { slug: true, nameAr: true, nameFr: true },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="crumb mb-8">
        <Link href="/">{t(lang, "navHome")}</Link>
        <span className="mx-2 text-[var(--line)]">/</span>
        <span className="text-[var(--ink)]">{t(lang, "navBranches")}</span>
      </div>

      <div className="mb-12">
        <div className="label mb-4">01 — {t(lang, "branchesTitle")}</div>
        <h1 className="sec-title text-[var(--ink)]">{t(lang, "branchesTitle")}</h1>
        <p className="sec-sub mt-3">{t(lang, "branchesSub")}</p>
      </div>

      <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((b, i) => (
          <Link key={b.id} href={`/branches/${b.slug}`} className="svc-card">
            <span className="svc-card__idx">0{i + 1} — {lang === "ar" ? b.nameAr : b.nameFr}</span>
            <div className="svc-card__body mt-4">
              <div className="mb-3 text-[var(--brand)]">
                <Icon name={ICONS[b.slug] ?? branchIcon(b.slug)} size={28} />
              </div>
              <h3>{lang === "ar" ? b.nameAr : b.nameFr}</h3>
              <p className="mt-2">{lang === "ar" ? b.nameFr : b.nameAr}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {b.subjects.map((s) => (
                <span key={s.nameAr} className="tag !py-1 !px-2.5 !text-[12px]">
                  <Icon name={subjectIcon(s.slug)} size={13} />{" "}
                  {lang === "ar" ? s.nameAr : s.nameFr}
                </span>
              ))}
              <span className="tag !py-1 !px-2.5 !text-[12px]">
                <Icon name="file" size={13} /> {b._count.resources}
              </span>
            </div>
            <span className="svc-card__arrow">{t(lang, "homeStart")} <i /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}