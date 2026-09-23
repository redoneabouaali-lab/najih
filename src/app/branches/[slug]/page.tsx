import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import { mkMeta } from "@/lib/seo";
import type { Metadata } from "next";
import { t } from "@/lib/lang";
import { BranchMatierePicker } from "@/components/BranchMatierePicker";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/seo";
import { PageContext } from "@/components/PageContext";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLang();
  const branch = await prisma.branch.findUnique({
    where: { slug },
    select: { nameAr: true, nameFr: true },
  });
  if (!branch) return {};
  return mkMeta({
    lang,
    path: `/branches/${slug}`,
    title:
      lang === "ar"
        ? `شعبة ${branch.nameAr} — دروس وامتحانات`
        : `${branch.nameFr} — cours et examens`,
    description:
      lang === "ar"
        ? `كل ما تحتاجه لشعبة ${branch.nameAr}: دروس، تمارين، امتحانات وطنية واختبارات تفاعلية عشية الباكالوريا.`
        : `Tout pour la filière ${branch.nameFr} : cours, exercices, examens nationaux et quiz interactifs pour préparer le Bac.`,
  });
}

export default async function BranchPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getLang();

  const branch = await prisma.branch.findUnique({
    where: { slug },
    include: {
      subjects: {
        orderBy: { order: "asc" },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              titleAr: true,
              titleFr: true,
              lesson: { select: { id: true } },
              _count: { select: { questions: true } },
            },
          },
        },
      },
    },
  });

  if (!branch)
    return <div className="p-8 text-center text-gray-500">Branch not found</div>;

  const matieres = branch.subjects.map((sub) => ({
    id: sub.id,
    slug: sub.slug,
    icon: sub.icon,
    nameAr: sub.nameAr,
    nameFr: sub.nameFr,
    chapterCount: sub.chapters.length,
    lessonCount: sub.chapters.filter((c) => c.lesson).length,
    questionCount: sub.chapters.reduce((s, c) => s + c._count.questions, 0),
  }));

  const branchName = lang === "ar" ? branch.nameAr : branch.nameFr;

  return (
    <>
      <PageContext
        context={`الطالب يختار المواد لشعبة ${branchName}: ${matieres.map((m) => `${m.nameAr} (${m.chapterCount} دروس)`).join("، ")}. كن معلمه: ساعد الطالب في فهم منهج المادة، واشرح ببساطة أي مفهوم مع مثال محلول وإضافة مثال ثاني مختلف.`}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: t(lang, "navHome"),
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: branchName,
              item: `${SITE_URL}/branches/${slug}`,
            },
          ],
        }}
      />
      <BranchMatierePicker
        lang={lang}
        branchSlug={slug}
        branchNameAr={branch.nameAr}
        branchNameFr={branch.nameFr}
        matieres={matieres}
      />
    </>
  );
}