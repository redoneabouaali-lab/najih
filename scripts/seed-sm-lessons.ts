import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

type Hub = { subjectKey: string; labelAr: string; track: string; url: string };

const HUBS: Hub[] = [
  { subjectKey: "sm", labelAr: "الرياضيات", track: "cours-2bac-sma-maths", url: "https://moutamadris.ma/دروس-الرياضيات-الثانية-باك/" },
  { subjectKey: "pc", labelAr: "الفيزياء والكيمياء", track: "cours-2bac-pc-pc", url: "https://moutamadris.ma/دروس-الفيزياء-والكيمياء-الثان/" },
  { subjectKey: "svt", labelAr: "علوم الحياة والأرض", track: "cours-2bac-sma-svt", url: "https://moutamadris.ma/دروس-علوم-الحياة-والأرض-الثاني/" },
  { subjectKey: "philo", labelAr: "الفلسفة", track: "cours-2bac-svt-philo", url: "https://moutamadris.ma/دروس-الفلسفة-الثانية-باك/" },
  { subjectKey: "francais", labelAr: "اللغة الفرنسية", track: "cours-2bac-l-fr", url: "https://moutamadris.ma/دروس-اللغة-الفرنسية-الثانية-باك/" },
  { subjectKey: "anglais", labelAr: "اللغة الإنجليزية", track: "cours-2bac-svt-en", url: "https://moutamadris.ma/دروس-اللغة-الإنجليزية-الثانية/" },
  { subjectKey: "tarbia", labelAr: "التربية الإسلامية", track: "cours-2bac-svt-islam", url: "https://moutamadris.ma/دروس-التربية-الإسلامية-الثانية-باك/" },
];

function decodeEntities(s: string) {
  return s
    .replace(/&#8221;|&quot;/g, '"')
    .replace(/&#8217;|&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»");
}

async function fetchText(url: string) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (NajihBot/1.0; content-aggregator)" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

type Row = { title: string; url: string };

function extract(hub: Hub, raw: string): Row[] {
  const h = decodeEntities(raw);
  const re = /([^<>,\n]{2,160}),\s*<a href="([^"]+\.pdf)"[^>]*>تحميل<\/a>/g;
  const out: Row[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(h))) {
    const title = m[1].trim();
    const url = m[2];
    if (!url.includes(hub.track)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ title, url });
  }
  return out;
}

async function main() {
  const branch = await prisma.branch.findUnique({ where: { slug: "sm" } });
  if (!branch) throw new Error("SM branch not found");

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const hub of HUBS) {
    let rows: Row[] = [];
    try {
      rows = extract(hub, await fetchText(hub.url));
    } catch (e) {
      console.warn(`  ! ${hub.labelAr}: fetch failed — ${(e as Error).message}`);
      continue;
    }
    let created = 0;
    let skipped = 0;
    for (const r of rows) {
      const dup = await prisma.resource.findFirst({
        where: { url: r.url, branchId: branch.id, subjectKey: hub.subjectKey },
      });
      if (dup) {
        skipped++;
        continue;
      }
      await prisma.resource.create({
        data: {
          titleAr: r.title,
          titleFr: r.title,
          kind: "lesson",
          url: r.url,
          year: null,
          session: null,
          subjectKey: hub.subjectKey,
          branchId: branch.id,
        },
      });
      created++;
    }
    totalCreated += created;
    totalSkipped += skipped;
    console.log(`  ${hub.labelAr} (${hub.subjectKey}): ${rows.length} found → created=${created} skipped=${skipped}`);
  }

  const byKind = await prisma.resource.groupBy({
    by: ["subjectKey", "kind"],
    where: { branchId: branch.id },
    _count: true,
  });
  console.log("\nSM resources by key+kind:");
  for (const k of byKind.sort((a, b) => (a.subjectKey ?? "").localeCompare(b.subjectKey ?? ""))) {
    console.log(`  ${(k.subjectKey ?? "?").padEnd(10)} ${k.kind.padEnd(9)} ${k._count}`);
  }
  console.log(`\nlesson PDFs: created=${totalCreated} skipped=${totalSkipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());