import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

type SubjectSeed = {
  slug: string;
  nameAr: string;
  nameFr: string;
  icon: string;
};

// Real 2ème année bac subject sets per branch (Moroccan curriculum).
// Existing subjects are upserted too (with their index) to keep a consistent order.
const DATA: { branchSlug: string; subjects: SubjectSeed[] }[] = [
  {
    branchSlug: "sm",
    subjects: [
      { slug: "mathematiques", nameAr: "الرياضيات", nameFr: "Mathématiques", icon: "📐" },
      { slug: "physique-chimie", nameAr: "الفيزياء والكيمياء", nameFr: "Physique-Chimie", icon: "⚗️" },
      { slug: "svt", nameAr: "علوم الحياة والأرض", nameFr: "SVT", icon: "🧬" },
      { slug: "philosophie", nameAr: "الفلسفة", nameFr: "Philosophie", icon: "🤔" },
      { slug: "francais", nameAr: "الفرنسية", nameFr: "Français", icon: "📖" },
      { slug: "anglais", nameAr: "الإنجليزية", nameFr: "Anglais", icon: "🇬🇧" },
      { slug: "arabe", nameAr: "اللغة العربية", nameFr: "Arabe", icon: "📚" },
      { slug: "tarbia-islamia", nameAr: "التربية الإسلامية", nameFr: "Éducation islamique", icon: "🕌" },
    ],
  },
  {
    branchSlug: "svt",
    subjects: [
      { slug: "mathematiques", nameAr: "الرياضيات", nameFr: "Mathématiques", icon: "📐" },
      { slug: "physique-chimie", nameAr: "الفيزياء والكيمياء", nameFr: "Physique-Chimie", icon: "⚗️" },
      { slug: "svt", nameAr: "علوم الحياة والأرض", nameFr: "SVT", icon: "🧬" },
      { slug: "philosophie", nameAr: "الفلسفة", nameFr: "Philosophie", icon: "🤔" },
      { slug: "francais", nameAr: "الفرنسية", nameFr: "Français", icon: "📖" },
      { slug: "anglais", nameAr: "الإنجليزية", nameFr: "Anglais", icon: "🇬🇧" },
      { slug: "arabe", nameAr: "اللغة العربية", nameFr: "Arabe", icon: "📚" },
      { slug: "tarbia-islamia", nameAr: "التربية الإسلامية", nameFr: "Éducation islamique", icon: "🕌" },
    ],
  },
  {
    branchSlug: "sp",
    subjects: [
      { slug: "mathematiques", nameAr: "الرياضيات", nameFr: "Mathématiques", icon: "📐" },
      { slug: "physique-chimie", nameAr: "الفيزياء والكيمياء", nameFr: "Physique-Chimie", icon: "⚗️" },
      { slug: "philosophie", nameAr: "الفلسفة", nameFr: "Philosophie", icon: "🤔" },
      { slug: "francais", nameAr: "الفرنسية", nameFr: "Français", icon: "📖" },
      { slug: "anglais", nameAr: "الإنجليزية", nameFr: "Anglais", icon: "🇬🇧" },
      { slug: "arabe", nameAr: "اللغة العربية", nameFr: "Arabe", icon: "📚" },
      { slug: "tarbia-islamia", nameAr: "التربية الإسلامية", nameFr: "Éducation islamique", icon: "🕌" },
    ],
  },
  {
    branchSlug: "eco",
    subjects: [
      { slug: "mathematiques", nameAr: "الرياضيات", nameFr: "Mathématiques", icon: "📐" },
      { slug: "economie", nameAr: "الاقتصاد والتدبير", nameFr: "Économie & Gestion", icon: "💼" },
      { slug: "comptabilite", nameAr: "المحاسبة", nameFr: "Comptabilité", icon: "🧾" },
      { slug: "philosophie", nameAr: "الفلسفة", nameFr: "Philosophie", icon: "🤔" },
      { slug: "francais", nameAr: "الفرنسية", nameFr: "Français", icon: "📖" },
      { slug: "anglais", nameAr: "الإنجليزية", nameFr: "Anglais", icon: "🇬🇧" },
      { slug: "arabe", nameAr: "اللغة العربية", nameFr: "Arabe", icon: "📚" },
      { slug: "tarbia-islamia", nameAr: "التربية الإسلامية", nameFr: "Éducation islamique", icon: "🕌" },
    ],
  },
  {
    branchSlug: "lettres",
    subjects: [
      { slug: "philosophie", nameAr: "الفلسفة", nameFr: "Philosophie", icon: "🤔" },
      { slug: "francais", nameAr: "الفرنسية", nameFr: "Français", icon: "📖" },
      { slug: "arabe", nameAr: "اللغة العربية", nameFr: "Arabe", icon: "📚" },
      { slug: "anglais", nameAr: "الإنجليزية", nameFr: "Anglais", icon: "🇬🇧" },
      { slug: "espagnol", nameAr: "الإسبانية", nameFr: "Espagnol", icon: "🇪🇸" },
      { slug: "histoire-geo", nameAr: "التاريخ والجغرافيا", nameFr: "Histoire-Géographie", icon: "🗺️" },
      { slug: "tarbia-islamia", nameAr: "التربية الإسلامية", nameFr: "Éducation islamique", icon: "🕌" },
    ],
  },
  {
    branchSlug: "arts",
    subjects: [
      { slug: "histoire-arts", nameAr: "تاريخ الفنون", nameFr: "Histoire des arts", icon: "🎨" },
      { slug: "philosophie", nameAr: "الفلسفة", nameFr: "Philosophie", icon: "🤔" },
      { slug: "francais", nameAr: "الفرنسية", nameFr: "Français", icon: "📖" },
      { slug: "arabe", nameAr: "اللغة العربية", nameFr: "Arabe", icon: "📚" },
      { slug: "anglais", nameAr: "الإنجليزية", nameFr: "Anglais", icon: "🇬🇧" },
    ],
  },
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const { branchSlug, subjects } of DATA) {
    const branch = await prisma.branch.findUnique({ where: { slug: branchSlug } });
    if (!branch) {
      console.warn(`Branch "${branchSlug}" not found — skipping`);
      continue;
    }

    for (let i = 0; i < subjects.length; i++) {
      const s = subjects[i];
      const existing = await prisma.subject.findUnique({
        where: { branchId_slug: { branchId: branch.id, slug: s.slug } },
      });
      await prisma.subject.upsert({
        where: { branchId_slug: { branchId: branch.id, slug: s.slug } },
        update: { nameAr: s.nameAr, nameFr: s.nameFr, icon: s.icon, order: i },
        create: { slug: s.slug, nameAr: s.nameAr, nameFr: s.nameFr, icon: s.icon, order: i, branchId: branch.id },
      });
      if (existing) updated++;
      else created++;
    }
  }

  const perBranch = await prisma.branch.findMany({
    orderBy: { order: "asc" },
    select: { slug: true, _count: { select: { subjects: true } } },
  });
  console.log("Subjects:", { created, updated });
  console.log(JSON.stringify(perBranch, null, 1));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());