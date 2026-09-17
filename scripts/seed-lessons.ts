import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { readFileSync } from "node:fs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

type LessonSeed = {
  branchSlug: string;
  subjectSlug: string;
  chapterSlug: string;
  contentAr: string;
  contentFr: string;
};

const LESSONS = JSON.parse(
  readFileSync("content/lessons.json", "utf8").replace(/^\uFEFF/, ""),
) as LessonSeed[];

async function main() {
  let count = 0;
  for (const lesson of LESSONS) {
    const subject = await prisma.subject.findFirst({
      where: { slug: lesson.subjectSlug, branch: { slug: lesson.branchSlug.toLowerCase() } },
    });
    if (!subject) { console.log(`skip subject: ${lesson.subjectSlug} in ${lesson.branchSlug}`); continue; }
    const chapter = await prisma.chapter.findFirst({
      where: { slug: lesson.chapterSlug, subjectId: subject.id },
    });
    if (!chapter) { console.log(`skip chapter: ${lesson.chapterSlug}`); continue; }
    await prisma.chapter.update({
      where: { id: chapter.id },
      data: { lesson: { upsert: { create: { contentAr: lesson.contentAr, contentFr: lesson.contentFr }, update: { contentAr: lesson.contentAr, contentFr: lesson.contentFr } } } },
    });
    count++;
    console.log(`lesson: ${lesson.chapterSlug}`);
  }
  const total = await prisma.lesson.count();
  console.log(`\nInserted ${count} lessons. Total lessons: ${total}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());