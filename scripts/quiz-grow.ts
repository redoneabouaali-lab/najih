import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  // Real runtime env wins: the container ships no .env, and a stale local
  // DATABASE_URL must not point the generator at a different file.
  if (m && process.env[m[1]] === undefined) {
    process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1").trim();
  }
}

const KEY = process.env.NVIDIA_API_KEY ?? "";
if (!KEY && !process.env.OPENROUTER_API_KEY) {
  console.error("Neither OPENROUTER_API_KEY nor NVIDIA_API_KEY is set");
  process.exit(1);
}

// DATABASE_PATH is what the entrypoint actually serves, so it wins over the
// repo-relative DATABASE_URL. Writing to the wrong file is silent data loss.
const DB_PATH = process.env.DATABASE_PATH
  ? resolve(process.env.DATABASE_PATH)
  : null;

const adapter = new PrismaBetterSqlite3({
  url: DB_PATH
    ? `file:${DB_PATH}`
    : process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Only this Nemotron model survives on both providers: most public NVIDIA
// models are end-of-life (HTTP 410), and the OpenRouter key has no credits,
// so only ":free" models respond there.
const NEMOTRON = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";

type Provider = { name: string; url: string; key: string; model: string };

function providers(): Provider[] {
  const list: Provider[] = [];
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    list.push({ name: "openrouter", url: OPENROUTER_URL, key: orKey, model: `${NEMOTRON}:free` });
  }
  if (KEY) {
    list.push({ name: "nvidia", url: NVIDIA_URL, key: KEY, model: NEMOTRON });
  }
  return list;
}

const CALL_TIMEOUT_MS = Number(process.env.QUIZ_GEN_TIMEOUT_MS ?? 240000);

// Retry bookkeeping must survive container replacement, so keep it next to the
// database when one is configured and fall back to the repo for local runs.
const STATE_PATH =
  process.env.QUIZ_GEN_STATE_PATH ??
  (DB_PATH ? `${DB_PATH}.quiz-growth.json` : "content/quiz-growth-state.json");
const STATE_FILE = resolve(STATE_PATH);

type State = {
  chapters: Record<
    string,
    { attempts: number; lastAt: string; added: number; status: "ok" | "fail" }
  >;
};

function loadState(): State {
  if (!existsSync(STATE_FILE)) return { chapters: {} };
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8")) as State;
  } catch {
    return { chapters: {} };
  }
}

function saveState(s: State) {
  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2) + "\n");
}

const arg = (name: string, dflt: number) => {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return dflt;
  const v = Number(process.argv[i + 1]);
  return Number.isFinite(v) ? v : dflt;
};
const has = (name: string) => process.argv.includes(`--${name}`);

const LIMIT = arg("limit", 20);
const TARGET = arg("target", 9);
const PER_CHAPTER = arg("count", 3);
const MAX_ATTEMPTS = arg("max-attempts", 3);
const DRY = has("dry-run");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Many seeded "lessons" are only a scraped image link. Measure real prose,
// not URL length, or the generator confidently invents off-topic questions.
function proseOf(content: string | null | undefined): string {
  return (content ?? "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[*_`#>|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Options often come back as bare LaTeX ("2^{n+1}-1") with no delimiter, which
// KaTeX would not pick up. Wrap obvious math so it renders.
function wrapMath(s: string): string {
  const t = (s ?? "").trim();
  if (!t) return s;
  if (/\$\$|\$|\\\(|\\\[/.test(t)) return t;
  if (/[\u0600-\u06FF]/.test(t)) return t;
  if (/[\^_{}]|\\[a-zA-Z]/.test(t)) return `$$${t}$$`;
  if (t.length < 40 && /[/=<>≤≥]/.test(t)) return `$$${t}$$`;
  return t;
}

const RESOURCE_RE =
  /امتحان|امتحانات|وطني|im-?national|national|rattrap|能让|iso-|session\s*1|corrig|تصحيح|دورة\s|الاستدراك|ت تحميل|تحميل|télécharg|download|pdf| Ressource|ressources|\bressource\b/i;

async function callAI(system: string, user: string, maxTokens: number) {
  let lastErr = "";
  for (const p of providers()) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), CALL_TIMEOUT_MS);
      try {
        const res = await fetch(p.url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${p.key}`,
            "Content-Type": "application/json",
            ...(p.name === "openrouter"
              ? {
                  "HTTP-Referer": "https://najih.abouaaliahmed.com",
                  "X-Title": "Najih quiz growth",
                }
              : {}),
          },
          signal: ctl.signal,
          body: JSON.stringify({
            model: p.model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            max_tokens: maxTokens,
            temperature: 0.5,
          }),
        });
        if (res.status === 429 || res.status >= 500) {
          const wait = Number(res.headers.get("retry-after")) || 5 * (attempt + 1);
          await sleep(Math.min(wait, 25) * 1000);
          continue;
        }
        if (!res.ok) {
          lastErr = `${p.name} HTTP ${res.status}`;
          break;
        }
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content ?? "";
        const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
        const json = cleaned.startsWith("{")
          ? cleaned
          : cleaned.match(/\{[\s\S]*\}/)?.[0] ?? cleaned;
        return { parsed: JSON.parse(json), model: `${p.name}/${p.model}` };
      } catch (e) {
        const msg = (e as Error).message;
        lastErr = `${p.name} ${msg.slice(0, 80)}`;
        if (/abort/i.test(msg)) break;
        await sleep(2000);
      } finally {
        clearTimeout(timer);
      }
    }
  }
  throw new Error(lastErr || "all providers failed");
}

const SYSTEM =
  "You are an expert exam writer for the Moroccan national baccalaureate. You answer ONLY with strict JSON, no markdown fences, no commentary.";

function buildPrompt(
  chapterTitleFr: string,
  chapterTitleAr: string,
  subjectFr: string,
  branchFr: string,
  lessonExcerpt: string,
  existing: string[],
  count: number,
) {
  const avoid =
    existing.length > 0
      ? `\n\nThese questions ALREADY EXIST — do not repeat or paraphrase them:\n${existing
          .slice(-12)
          .map((q) => `- ${q}`)
          .join("\n")}`
      : "";

  const grounding = lessonExcerpt
    ? `\n\nThe lesson content below is the ONLY topic you may ask about. Base every question on it:\n"""\n${lessonExcerpt}\n"""\n`
    : `\n\nBase the questions ONLY on the lesson title. Do not invent a different topic.\n`;

  return `Filière ${branchFr}, matière ${subjectFr}, leçon "${chapterTitleFr}" (${chapterTitleAr}).
${grounding}
Write exactly ${count} distinct multiple-choice questions (QCM) at the level of the Moroccan national exam, testing THIS lesson's core concepts and its typical exam applications.${avoid}

Return EXACTLY this JSON shape:
{
  "questions": [
    {
      "promptAr": "سؤال بالعربية يبدأ بحرف كبير وينتهي بعلامة ؟",
      "promptFr": "la même question en français, terminée par ?",
      "options": [
        { "textAr": "خيار", "textFr": "option", "isCorrect": false },
        { "textAr": "الخيار الصحيح", "textFr": "bonne réponse", "isCorrect": true },
        { "textAr": "خيار", "textFr": "option", "isCorrect": false },
        { "textAr": "خيار", "textFr": "option", "isCorrect": false }
      ],
      "explanationAr": "شرح موجز يوضح لماذا هذا الجواب صحيح",
      "explanationFr": "explication courte"
    }
  ]
}

STRICT RULES:
- EXACTLY 4 options per question, EXACTLY one with isCorrect=true, and vary which index is correct.
- Every mathematical expression MUST be wrapped in double dollar signs: $$u_{n+1} > u_n$$, $$f(x) = ax^2 + bx + c$$, $$2^{n+1}-1$$.
- This applies to the question text AND to every option. An option that is a formula must read $$...$$.
- Put the formula on its own line inside the question text, not glued to Arabic or French words.
- Keep explanations to one or two short sentences.
- No trailing commas. Double quotes only. JSON only.`;
}

function validate(q: any): boolean {
  if (!q || typeof q !== "object") return false;
  if (typeof q.promptAr !== "string" || q.promptAr.trim().length < 8) return false;
  if (typeof q.promptFr !== "string" || q.promptFr.trim().length < 8) return false;
  if (!Array.isArray(q.options) || q.options.length !== 4) return false;
  for (const o of q.options) {
    if (typeof o?.textAr !== "string" || o.textAr.trim() === "") return false;
    if (typeof o?.textFr !== "string" || o.textFr.trim() === "") return false;
  }
  if (q.options.filter((o: any) => o.isCorrect).length !== 1) return false;
  return true;
}

function main() {
  return run();
}

async function run() {
  const chapters = await prisma.chapter.findMany({
    include: {
      subject: { include: { branch: true } },
      lesson: { select: { contentAr: true, contentFr: true } },
      questions: { select: { promptFr: true, promptAr: true } },
    },
  });

  const state = loadState();

  const eligible = chapters
    .filter((ch) => {
      const hay = `${ch.titleFr} ${ch.titleAr} ${ch.slug}`;
      if (RESOURCE_RE.test(hay)) return false;
      const prose = proseOf((ch.lesson?.contentFr ?? "") + " " + (ch.lesson?.contentAr ?? ""));
      if (prose.length < 250) return false;
      const st = state.chapters[ch.id];
      if (st && st.attempts >= MAX_ATTEMPTS) return false;
      return ch.questions.length < TARGET;
    })
    .sort((a, b) => {
      const ba = a.subject.branch.order - b.subject.branch.order;
      if (ba !== 0) return ba;
      const sa = a.subject.order - b.subject.order;
      if (sa !== 0) return sa;
      const qa = a.questions.length - b.questions.length;
      if (qa !== 0) return qa;
      return a.order - b.order;
    });

  // The same lesson is seeded under several chapter rows (one per branch/subject).
  // Pay for one generation per unique lesson, then clone it to its siblings.
  const groups = new Map<string, typeof eligible>();
  for (const ch of eligible) {
    const key = `${ch.subject.branch.slug}/${ch.subject.slug}/${norm(ch.titleFr) || norm(ch.titleAr)}`;
    const list = groups.get(key);
    if (list) list.push(ch);
    else groups.set(key, [ch]);
  }

  const primaries: (typeof eligible)[number][] = [];
  const siblingsOf = new Map<string, string[]>();
  for (const [key, list] of groups) {
    primaries.push(list[0]);
    if (list.length > 1) siblingsOf.set(list[0].id, list.slice(1).map((c) => c.id));
  }

  console.log(
    `chapters=${chapters.length} eligible=${eligible.length} unique=${groups.size} target=${TARGET} limit=${LIMIT}`,
  );
  if (DRY) {
    for (const ch of primaries.slice(0, LIMIT)) {
      const sib = siblingsOf.get(ch.id)?.length ?? 0;
      console.log(
        `  would generate ${PER_CHAPTER} for [${ch.subject.branch.nameFr} / ${ch.subject.nameFr}] "${ch.titleFr}" (has ${ch.questions.length}${sib ? `, clones to ${sib} duplicate chapters` : ""})`,
      );
    }
    return;
  }

  let added = 0;
  let attempted = 0;

  for (const ch of primaries) {
    if (attempted >= LIMIT) break;
    attempted++;
    const st = state.chapters[ch.id];
    state.chapters[ch.id] = {
      attempts: (st?.attempts ?? 0) + 1,
      lastAt: new Date().toISOString(),
      added: st?.added ?? 0,
      status: "fail",
    };

    const label = `[${ch.subject.branch.nameFr}/${ch.subject.nameFr}] ${ch.titleFr}`;
    try {
      const need = Math.min(PER_CHAPTER, Math.max(2, TARGET - ch.questions.length));
      const prose = proseOf(ch.lesson?.contentFr || ch.lesson?.contentAr).slice(0, 1400);
      const { parsed, model } = await callAI(
        SYSTEM,
        buildPrompt(
          ch.titleFr,
          ch.titleAr,
          ch.subject.nameFr,
          ch.subject.branch.nameFr,
          prose,
          ch.questions.map((q) => q.promptFr),
          need,
        ),
        3000,
      );

      const list = Array.isArray(parsed?.questions) ? parsed.questions : [];
      const seen = new Set(ch.questions.map((q) => norm(q.promptFr)));
      const fresh: any[] = [];
      for (const q of list) {
        if (!validate(q)) continue;
        const key = norm(q.promptFr);
        if (seen.has(key)) continue;
        seen.add(key);
        fresh.push(q);
      }
      if (fresh.length === 0) throw new Error("no valid unique questions");

      const payload = fresh.map((q) => ({
        promptAr: q.promptAr.trim(),
        promptFr: q.promptFr.trim(),
        source: "ai-generated",
        explanationAr: (q.explanationAr ?? "").trim(),
        explanationFr: (q.explanationFr ?? "").trim(),
        options: {
          create: q.options.map((o: any, oi: number) => ({
            textAr: wrapMath(o.textAr),
            textFr: wrapMath(o.textFr),
            order: oi,
            isCorrect: !!o.isCorrect,
          })),
        },
      }));

      const targetIds = [ch.id, ...(siblingsOf.get(ch.id) ?? [])];
      for (const targetId of targetIds) {
        await prisma.chapter.update({
          where: { id: targetId },
          data: { questions: { create: payload } },
        });
      }

      state.chapters[ch.id].status = "ok";
      state.chapters[ch.id].added = (st?.added ?? 0) + fresh.length;
      added += fresh.length * targetIds.length;
      const cloneNote =
        targetIds.length > 1 ? ` x${targetIds.length} chapters` : "";
      console.log(
        `  OK   ${label}: +${fresh.length}${cloneNote} (${model})`,
      );
    } catch (e) {
      console.log(`  FAIL ${label}: ${(e as Error).message.slice(0, 140)}`);
    }

    saveState(state);
    await sleep(2500);
  }

  const total = await prisma.question.count();
  const aiTotal = await prisma.question.count({ where: { source: "ai-generated" } });
  console.log(
    `\nattempted=${attempted} added=${added} | bank=${total} (ai-generated=${aiTotal})`,
  );
}

function norm(s: string) {
  return (s ?? "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 90);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());