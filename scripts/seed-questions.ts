import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { readFileSync } from "node:fs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

type Q = {
  promptAr: string;
  promptFr: string;
  options: { textAr: string; textFr: string; isCorrect: boolean }[];
  explanationAr?: string;
  explanationFr?: string;
};

type Group = {
  branchSlug: string;
  subjectSlug: string;
  chapterSlug: string;
  questions: Q[];
};

const DATA = JSON.parse(
  readFileSync("content/questions.json", "utf8").replace(/^\uFEFF/, ""),
) as Group[];

async function main() {
  let added = 0;
  let skipped = 0;

  for (const g of DATA) {
    const subject = await prisma.subject.findFirst({
      where: { slug: g.subjectSlug, branch: { slug: g.branchSlug.toLowerCase() } },
    });
    if (!subject) { console.log(`skip subject ${g.subjectSlug}`); continue; }
    const chapter = await prisma.chapter.findFirst({
      where: { slug: g.chapterSlug, subjectId: subject.id },
    });
    if (!chapter) { console.log(`skip chapter ${g.chapterSlug}`); continue; }

    for (const q of g.questions) {
      await prisma.question.create({
        data: {
          promptAr: q.promptAr,
          promptFr: q.promptFr,
          explanationAr: q.explanationAr ?? "",
          explanationFr: q.explanationFr ?? "",
          chapterId: chapter.id,
          options: {
            create: q.options.map((o, i) => ({
              textAr: o.textAr,
              textFr: o.textFr,
              order: i,
              isCorrect: o.isCorrect,
            })),
          },
        },
      });
      added++;
    }
    console.log(`chapter ${g.chapterSlug}: +${g.questions.length}`);
  }

  const total = await prisma.question.count();
  const perChapter = await prisma.chapter.count();
  console.log(`\nAdded ${added} questions. Total questions now: ${total} across ${perChapter} chapters`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());