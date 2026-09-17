import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const subs = await prisma.subject.findMany({
    select: {
      id: true,
      slug: true,
      nameAr: true,
      nameFr: true,
      branch: { select: { slug: true } },
      chapters: { select: { slug: true, titleAr: true, lesson: { select: { id: true } } } },
    },
    orderBy: { branchId: "asc" },
  });
  for (const s of subs) {
    console.log(
      `[${s.branch.slug}] ${s.slug} | ${s.nameAr} | chapters=${s.chapters.length} lessoned=${s.chapters.filter((c) => c.lesson).length}`
    );
  }
  const tk = await prisma.resource.groupBy({ by: ["subjectKey", "kind", "branchId"], _count: true });
  const branchIds = await prisma.branch.findMany({ select: { id: true, slug: true } });
  for (const r of tk) {
    const b = branchIds.find((x) => x.id === r.branchId);
    console.log(`resource ${r.kind} branch=${b?.slug ?? "?"} subjectKey=${r.subjectKey} count=${r._count}`);
  }
  await prisma.$disconnect();
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });