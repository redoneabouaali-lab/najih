import { prisma } from "@/lib/prisma";

type KnowledgeChunk = {
  branchAr: string;
  branchFr: string;
  branchSlug: string;
  subjectAr: string;
  subjectFr: string;
  subjectSlug: string;
  subjectIcon: string;
  titleAr: string;
  titleFr: string;
  lessonAr: string;
  lessonFr: string;
  questions: string[];
};

const CACHE_MS = 10 * 60 * 1000;
let cache: { at: number; chunks: KnowledgeChunk[] } | null = null;

const EXCERPT = 1400;

function stripMarkdown(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`#>*_~|\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadKnowledge(): Promise<KnowledgeChunk[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.chunks;
  const rows = await prisma.chapter.findMany({
    include: {
      subject: { include: { branch: true } },
      lesson: true,
      questions: { include: { options: true }, orderBy: { createdAt: "asc" } },
    },
  });
  const chunks: KnowledgeChunk[] = rows.map((c) => ({
    branchAr: c.subject.branch.nameAr,
    branchFr: c.subject.branch.nameFr,
    branchSlug: c.subject.branch.slug,
    subjectAr: c.subject.nameAr,
    subjectFr: c.subject.nameFr,
    subjectSlug: c.subject.slug,
    subjectIcon: c.subject.icon ?? "📘",
    titleAr: c.titleAr,
    titleFr: c.titleFr,
    lessonAr: stripMarkdown(c.lesson?.contentAr ?? "").slice(0, EXCERPT),
    lessonFr: stripMarkdown(c.lesson?.contentFr ?? "").slice(0, EXCERPT),
    questions: c.questions.slice(0, 8).map((q) => {
      const opts = q.options
        .map((o) => `${o.textAr} / ${o.textFr}${o.isCorrect ? " ✓" : ""}`)
        .join(" | ");
      return [
        `س: ${q.promptAr} (${q.promptFr})`,
        opts ? `اختيارات: ${opts}` : "",
        q.explanationAr ? `شرح: ${q.explanationAr}` : "",
        q.explanationFr ? `شرح: ${q.explanationFr}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    }),
  }));
  cache = { at: Date.now(), chunks };
  return chunks;
}

const STOP = new Set([
  "ما", "هو", "هي", "هل", "كيف", "و", "في", "على", "من", "إلى", "عن", "مع", "لا", "لكن", "ثم",
  "لم", "لن", "قد", "أن", "إن", "أو", "ال", "ب", "لي", "نا", "تك", "une", "vous", "pour", "avec",
  "les", "des", "dans", "sur", "pas", "que", "qui", "quoi", "est", "comment", "faire", "pour", "de",
  "le", "la", "un", "a", "et", "du", "au", "ce", "il", "elle", "je", "tu",
]);

function tokens(s: string): string[] {
  const set = new Set<string>();
  for (const w of s.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
    if (w.length < 2 || STOP.has(w)) continue;
    set.add(w);
  }
  return [...set];
}

function scoreChunk(c: KnowledgeChunk, q: string, ctx: string, tk: string[]): number {
  const hay = `${c.titleAr} ${c.titleFr} ${c.subjectAr} ${c.subjectFr} ${c.branchAr} ${c.branchFr} ${c.subjectSlug} ${c.branchSlug}`.toLowerCase();
  const lesson = `${c.lessonAr} ${c.lessonFr}`.toLowerCase();
  let s = 0;
  for (const t of tk) {
    if (hay.includes(t)) s += 2;
    else if (lesson.includes(t)) s += 1;
  }
  const subjects = ["رياضيات", "فيزياء", "كيمياء", "علوم", "اقتصاد", "فلسفة", "عربية", "فرنسية", "انجليزية", "تاريخ", "جغرافيا", "math", "physique", "svt", "eco", "philo", "economie", "anglais", "francais", "arabe"];
  for (const sub of subjects) {
    if (sub.length > 2 && q.toLowerCase().includes(sub) && (c.subjectFr.toLowerCase().includes(sub) || c.subjectAr.includes(sub))) s += 4;
  }
  const order = /^(الأول|الثاني|الثالث|الرابع|الخامس|السادس)/.test(c.titleAr);
  if (order) s += 0;
  return s;
}

function chunkToText(c: KnowledgeChunk, lang: "ar" | "fr", withQuestions: boolean): string {
  const lines: string[] = [];
  const title = lang === "ar" ? c.titleAr : c.titleFr;
  const subject = lang === "ar" ? c.subjectAr : c.subjectFr;
  const branch = lang === "ar" ? c.branchAr : c.branchFr;
  lines.push(`### ${c.subjectIcon} ${subject} — ${branch}: «${title}»`);
  lines.push(lang === "ar" ? c.lessonAr.slice(0, 1200) : c.lessonFr.slice(0, 1200));
  if (withQuestions && c.questions.length > 0) {
    lines.push(lang === "ar" ? "أسئلة امتحانات محلولة مرتبطة:" : "Questions d'examen corrigées associées :");
    lines.push(...c.questions.map((q) => q.slice(0, 700)));
  }
  return lines.join("\n");
}

export async function retrieveKnowledge(
  query: string,
  context: string,
  lang: "ar" | "fr",
  limit = 4,
  maxChars = 11000,
): Promise<string> {
  try {
    const chunks = await loadKnowledge();
    const tk = tokens(`${query} ${context}`);
    const scored = chunks
      .map((c) => ({ c, s: scoreChunk(c, query, context, tk) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    const picked = scored.slice(0, limit).map((x) => x.c);

    if (picked.length === 0) {
      const q = query.toLowerCase();
      const bySubj = chunks.find(
        (c) =>
          q.includes(c.subjectSlug) ||
          q.includes(c.subjectFr.toLowerCase()) ||
          q.includes(c.branchFr.toLowerCase()) ||
          q.includes(c.branchSlug),
      );
      if (!bySubj) return "";
      picked.push(bySubj);
    }

    const parts: string[] = [];
    let used = 0;
    for (const c of picked) {
      const t = chunkToText(c, lang, true);
      if (used + t.length > maxChars) break;
      parts.push(t);
      used += t.length;
    }
    return parts.join("\n\n");
  } catch {
    return "";
  }
}