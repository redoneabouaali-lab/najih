import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/getLang";
import Link from "next/link";
import { BranchMatierePicker } from "@/components/BranchMatierePicker";

type Props = { params: Promise<{ slug: string }> };

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

  return (
    <BranchMatierePicker
      lang={lang}
      branchSlug={slug}
      branchNameAr={branch.nameAr}
      branchNameFr={branch.nameFr}
      matieres={matieres}
    />
  );
}