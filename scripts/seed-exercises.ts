import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { readFileSync } from "node:fs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

type Raw = {
  titleFr: string;
  titleAr: string;
  kind: string;
  url: string;
  year?: number | null;
  session?: string | null;
  subjectKey?: string | null;
  branchSlug?: string | null;
};

const raw: Raw[] = JSON.parse(
  readFileSync("content/exercises.json", "utf8").replace(/^\uFEFF/, ""),
);

async function main() {
  let created = 0;
  let skipped = 0;

  for (const r of raw) {
    let branchId: string | undefined;
    if (r.branchSlug) {
      const branch = await prisma.branch.findUnique({ where: { slug: r.branchSlug } });
      if (branch) branchId = branch.id;
    }

    const existing = await prisma.resource.findFirst({ where: { url: r.url, kind: "exercise" } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.resource.create({
      data: {
        titleAr: r.titleAr,
        titleFr: r.titleFr,
        kind: r.kind,
        url: r.url,
        year: r.year ?? null,
        session: r.session ?? null,
        subjectKey: r.subjectKey ?? null,
        branchId: branchId ?? null,
      },
    });
    created++;
  }

  const total = await prisma.resource.count();
  const byKind = await prisma.resource.groupBy({ by: ["kind"], _count: true });
  console.log(`Resources: created=${created} skipped=${skipped} total=${total}`);
  console.log("By kind:", byKind.map((k) => `${k.kind}=${k._count}`).join(" "));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());