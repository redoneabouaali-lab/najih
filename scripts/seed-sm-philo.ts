import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const PAGE = "https://moutamadris.ma/%d8%a7%d9%85%d8%aa%d8%ad%d8%a7%d9%86%d8%a7%d8%aa-%d9%88%d8%b7%d9%86%d9%8a%d8%a9-%d9%85%d8%a7%d8%af%d8%a9-%d8%a7%d9%84%d9%81%d9%84%d8%b3%d9%81%d8%a9-%d8%a7%d9%84%d8%ab%d8%a7%d9%86%d9%8a%d8%a9-%d8%a8";

async function fetchText(url: string) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (NajihBot/1.0; content-aggregator)" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

async function main() {
  const branch = await prisma.branch.findUnique({ where: { slug: "sm" } });
  if (!branch) throw new Error("SM branch not found");
  const h = await fetchText(PAGE);
  const re = /(20(?:0[5-9]|1\d|2\d))|<a[^>]+href="([^"]+)"[^>]*>\s*([^<]*تحميل[^<]*)\s*<\/a>/g;
  let m: RegExpExecArray | null;
  type Group = { year: string; links: string[] };
  let cur: Group | null = null;
  const groups: Group[] = [];
  while ((m = re.exec(h))) {
    if (m[1]) { cur = { year: m[1], links: [] }; groups.push(cur); }
    else if (m[2] && cur) cur.links.push(m[2]);
  }
  const isSciences = (u: string) => /SVT-PC-SM|مسلك-العلوم|مسالك-علمية/i.test(decodeURIComponent(u));
  let created = 0, skipped = 0;
  for (const g of groups) {
    const slinks = g.links.filter(isSciences);
    if (!slinks.length) continue;
    const year = Number(g.year);
    for (const u of slinks) {
      const name = decodeURIComponent(u).split("/").pop() ?? "";
      const session = /rattrapage|الاستدراكية/i.test(name) ? "rattrapage" : "normal";
      const dup = await prisma.resource.findFirst({ where: { url: u, branchId: branch.id, subjectKey: "philo" } });
      if (dup) { skipped++; continue; }
      const sessAr = session === "rattrapage" ? "الدورة الاستدراكية" : "الدورة العادية";
      const sessFr = session === "rattrapage" ? "Rattrapage" : "Session normale";
      await prisma.resource.create({
        data: {
          titleAr: `الامتحان الوطني في الفلسفة — ${sessAr} — ${year}`,
          titleFr: `Examen National de Philosophie — ${sessFr} — ${year}`,
          kind: "exam",
          url: u,
          year,
          session,
          subjectKey: "philo",
          branchId: branch.id,
        },
      });
      created++;
    }
  }
  console.log("philo resources:", { created, skipped });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());