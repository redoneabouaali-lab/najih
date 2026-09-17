import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { readFileSync, writeFileSync } from "node:fs";

// minimal .env loader (no dotenv dependency)
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1").trim();
}

const KEY = process.env.NVIDIA_API_KEY;
if (!KEY) {
  console.error("NVIDIA_API_KEY missing");
  process.exit(1);
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const ONLY = process.argv[2] ?? "all"; // all | lessons | questions
const QUESTIONS_PER_CHAPTER = Number(process.argv[3] ?? 8);

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function callAI(system: string, user: string, maxTokens = 4000) {
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.4,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`AI ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  const cleaned = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned.startsWith("{") ? cleaned : cleaned.match(/\{[\s\S]*\}/)?.[0] ?? cleaned);
}

async function upsertLesson(chapterId: string, titleAr: string, titleFr: string, subjectName: string, branchName: string) {
  const system = "You are an expert teacher for the Moroccan baccalaureate. You answer ONLY with strict JSON, no markdown fences.";
  const user = `Write a clear, concise course summary (ملخص/ résumé) for the lesson "${titleFr}" (${titleAr}) in ${subjectName} — filière ${branchName}, aligned with the official Moroccan 2ème Bac program.

Return EXACTLY this JSON shape:
{
  "contentAr": "ملخص كامل منظم بالعربية (عناوين markdown ## و ### وقوائم - وتغطي التعريفات والمفاهيم والقوانين/النتائج الهامة مع مثال محلول قصير، 250-350 كلمة)",
  "contentFr": "résumé de cours complet en français structuré (titres markdown, définitions, propriétés/lois, un exemple résolu court, 250-350 mots)"
}`;
  return callAI(system, user, 4096);
}

async function generateQuestions(
  chapterId: string,
  titleAr: string,
  titleFr: string,
  subjectName: string,
  branchName: string,
  count: number,
) {
  const system = "You are an expert exam writer for the Moroccan national baccalaureate. You answer ONLY with strict JSON, no markdown fences, exactly as requested.";
  const user = `Filière ${branchName}, matière ${subjectName}, leçon "${titleFr}" (${titleAr}).

Generate exactly ${count} distinct multiple-choice questions (QCM) testing the chapter's core concepts, at the level of the national exam (application/analysis).

Return EXACTLY this JSON shape:
{
  "questions": [
    {
      "promptAr": "سؤال بالعربية، يبدأ بحرف كبير عربي وينتهي بعلامة ؟",
      "promptFr": "la même question en français, termine par ?",
      "options": [
        { "textAr": "خيار", "textFr": "option", "isCorrect": false },
        { "textAr": "الخيار الصحيح", "textFr": "bonne réponse", "isCorrect": true },
        { "textAr": "خيار", "textFr": "option", "isCorrect": false },
        { "textAr": "خيار", "textFr": "option", "isCorrect": false }
      ],
      "explanationAr": "شرح موجز",
      "explanationFr": "explication courte"
    }
  ]
}

Rules:
- EXACTLY 4 options per question, EXACTLY one isCorrect=true (put it at a different index each time).
- Options must be plausible; formulas in plain text (Unicode math ok).
- No trailing commas. Use double quotes. NO commentary outside the JSON.`;
  return callAI(system, user, 8192);
}

async function main() {
  const chapters = await prisma.chapter.findMany({
    include: { subject: { include: { branch: true } }, lesson: true, _count: { select: { questions: true } } },
  });
  console.log(`Chapters found: ${chapters.length}`);

  let lessonsDone = 0;
  let questionsAdded = 0;

  for (const ch of chapters) {
    const ctx = {
      titleAr: ch.titleAr,
      titleFr: ch.titleFr,
      subjectName: ch.subject.nameFr,
      branchName: ch.subject.branch.nameFr,
    };

    if (ONLY === "all" || ONLY === "lessons") {
      if (!ch.lesson) {
        try {
          const out = await upsertLesson(ch.id, ctx.titleAr, ctx.titleFr, ctx.subjectName, ctx.branchName);
          if (!out.contentAr || !out.contentFr) throw new Error("missing lesson fields");
          await prisma.chapter.update({
            where: { id: ch.id },
            data: { lesson: { create: { contentAr: out.contentAr, contentFr: out.contentFr } } },
          });
          lessonsDone++;
          console.log(`  lesson OK: ${ch.titleFr}`);
        } catch (e) {
          console.log(`  lesson FAIL: ${ch.titleFr} — ${(e as Error).message.slice(0, 120)}`);
        }
        await sleep(1500);
      } else {
        console.log(`  lesson exists (skip): ${ch.titleFr}`);
      }
    }

    if (ONLY === "all" || ONLY === "questions") {
      try {
        const out = await generateQuestions(ch.id, ctx.titleAr, ctx.titleFr, ctx.subjectName, ctx.branchName, QUESTIONS_PER_CHAPTER);
        const qs = out.questions ?? out.questions;
        if (!Array.isArray(qs) || qs.length === 0) throw new Error("no questions in response");
        let validated = 0;
        for (const q of qs) {
          if (!q?.promptAr || !q?.promptFr || !Array.isArray(q.options) || q.options.length !== 4) continue;
          if (q.options.filter((o: any) => o.isCorrect).length !== 1) continue;
          validated++;
        }
        console.log(`  questions OK: ${ch.titleFr} (${validated}/${qs.length} valid)`);
        if (validated === 0) continue;
        await prisma.chapter.update({
          where: { id: ch.id },
          data: {
            questions: {
              create: qs
                .filter((q: any) => q?.promptAr && q?.promptFr && Array.isArray(q.options) && q.options.length === 4 && q.options.filter((o: any) => o.isCorrect).length === 1)
                .map((q: any) => ({
                  promptAr: q.promptAr,
                  promptFr: q.promptFr,
                  source: null,
                  explanationAr: q.explanationAr ?? "",
                  explanationFr: q.explanationFr ?? "",
                  options: {
                    create: q.options.map((o: any, oi: number) => ({
                      textAr: o.textAr,
                      textFr: o.textFr,
                      order: oi,
                      isCorrect: !!o.isCorrect,
                    })),
                  },
                })),
            },
          },
        });
        questionsAdded += validated;
      } catch (e) {
        console.log(`  questions FAIL: ${ch.titleFr} — ${(e as Error).message.slice(0, 120)}`);
      }
      await sleep(1500);
    }
  }

  console.log(`\nDone. lessons=${lessonsDone} questionsAdded=${questionsAdded}`);
  const totalQ = await prisma.question.count();
  const totalL = await prisma.lesson.count();
  console.log(`Totals: lessons=${totalL} questions=${totalQ}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());