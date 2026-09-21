import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";

const STOP = new Set([
  "ما", "هو", "هي", "هل", "ماهو", "ماهي", "ماهي", "كيف", "و", "ف", "في", "على", "من", "إلى", "عن",
  "مع", "لا", "لكن", "ثم", "لم", "لن", "قد", "أن", "إن", "ان", "أو", "ب", "ال", "التي", "الذي",
  "شرح", "اشرح", "أشرح", "لك", "لي", "نا", "تك", "unes", "une", "vous", "pour", "avec", "cest",
  "est", "les", "des", "dun", "dans", "sur", "pas", "que", "qui", "quoi", "comment", "faire", "donne",
]);

const EXAM_RE = /امتحانات|امتحان|تصحيح|مصحح|مصححة|استدراك|الدور(ة|ات)|الوطنية|national|examen|exam|sujet|corrig|correction|épreuve|rattrapage|bac\b/i;
const CORR_RE = /تصحيح|مصحح|corrig|correction|solution/i;
const LESSON_RE = /درس|شرح|اشرح|أشرح|ملخص|ملخصات|تعريف|قانون|قاعدة|طريقة|كيف|ما هو|ما هي|cours|leçon|explique|résumé|comment|solution|حل|مفهوم|خاصية|نظرية/i;

function tokens(...inputs: string[]): string[] {
  const set = new Set<string>();
  for (const s of inputs) {
    for (const w of s.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
      if (w.length < 3 || STOP.has(w)) continue;
      if (/^\d{4}$/.test(w)) {
        set.add(w);
        continue;
      }
      if (/[a-z\u0600-\u06FF]/.test(w)) set.add(w);
    }
  }
  return [...set].slice(0, 6);
}

type Row = { kind: string; subjectKey: string | null; titleAr: string | null; titleFr: string | null; url: string };

const SUBJ_KEYS: [string, string][] = [
  ["رياضيات", "mathematiques"], ["رياضية", "mathematiques"], ["رياضي", "mathematiques"], ["math", "mathematiques"],
  ["mathématiques", "mathematiques"], ["mathematiques", "mathematiques"], ["علوم رياضية", "mathematiques"],
  ["sm", "mathematiques"], ["sciences math", "mathematiques"], ["sciences-math", "mathematiques"],
  ["فيزياء", "physique-chimie"], ["كيمياء", "physique-chimie"], ["كمياء", "physique-chimie"], ["physique", "physique-chimie"],
  ["physique-chimie", "physique-chimie"], ["شعبة العلوم الفيزيائية", "physique-chimie"], ["sp", "physique-chimie"],
  ["علوم الحياة", "svt"], ["svt", "svt"], ["biologie", "svt"], ["biology", "svt"],
  ["اقتصاد", "economie"], ["eco", "economie"], ["économie", "economie"], ["economie", "economie"],
  ["محاسبة", "comptabilite"], ["comptabilité", "comptabilite"], ["comptabilite", "comptabilite"],
  ["فلسفة", "philosophie"], ["philo", "philosophie"],
  ["عربية", "arabe"], ["فرنسية", "francais"], ["français", "francais"], ["francais", "francais"],
  ["انجليزية", "anglais"], ["إنجليزية", "anglais"],
  ["التاريخ", "histoire-geo"], ["جغرافيا", "histoire-geo"], ["histoire", "histoire-geo"],
  ["تربية", "tarbia-islamia"], ["فنون", "histoire-arts"], ["arts", "histoire-arts"],
];

function matchedSubjects(q: string): string[] {
  const set = new Set<string>();
  const lower = q.toLowerCase();
  for (const [word, key] of SUBJ_KEYS) {
    if (lower.includes(word)) set.add(key);
  }
  return [...set];
}

function normalizeSubjectKey(k: string | null): string {
  return k === "pc" ? "physique-chimie" : (k ?? "");
}

function scoreRow(r: Row, q: string, tks: string[], subjects: string[], corrIntent: boolean): number {
  const title = `${r.titleAr ?? ""} ${r.titleFr ?? ""}`.toLowerCase();
  const clean = title.replace(/[\s\u00a0]+/g, " ").trim();
  let s = 0;

  for (const tk of tks) if (title.includes(tk)) s += 1;

  const subjKey = normalizeSubjectKey(r.subjectKey);
  if (subjects.includes(subjKey)) s += 3;

  const years = tks.filter((t) => /^\d{4}$/.test(t));
  for (const y of years) if (title.includes(y)) s += 4;

  if (corrIntent && CORR_RE.test(title)) s += 2;

  const ym = /(19|20)\d{2}/.exec(title);
  if (ym) s += 1 + Math.max(0, Math.min(Number(ym[1]) - 2020, 6));

  if (
    clean.length < 6 ||
    /^(تحميل|download|télécharger)([\s\u00a0]|$)/.test(clean) ||
    /^\d{1,2}[\s\u00a0-]*$/.test(clean)
  ) {
    s -= 12;
  }
  if (/تذكير|إرسالية|إشعار|خبر|جديد/.test(clean)) s -= 4;

  return s;
}

function titleKeyOf(r: Row): string {
  return `${r.titleAr ?? ""} ${r.titleFr ?? ""}`.replace(/\s+/g, " ").trim().toLowerCase();
}

async function lookup(question: string): Promise<Row[]> {
  const tks = tokens(question);
  if (tks.length === 0) return [];

  const subjects = matchedSubjects(question);
  if (subjects.includes("physique-chimie")) subjects.push("pc");
  const examIntent = EXAM_RE.test(question);
  const corrIntent = CORR_RE.test(question);
  const lessonIntent = LESSON_RE.test(question);

  const termWhere = {
    OR: [
      ...tks.map((t) => ({ OR: [{ titleAr: { contains: t } }, { titleFr: { contains: t } }] })),
      ...subjects.map((k) => ({ subjectKey: k })),
    ],
  };

  const rows: Row[] = [];
  const seenUrls = new Set<string>();
  const scoreOf = new Map<string, number>();
  const seenTitles = new Set<string>();
  const add = (rs: Row[]) => {
    for (const r of rs) {
      if (seenUrls.has(r.url)) continue;
      seenUrls.add(r.url);
      const tk = titleKeyOf(r);
      if (tk && seenTitles.has(tk)) continue;
      if (tk) seenTitles.add(tk);
      scoreOf.set(r.url, scoreRow(r, question, tks, subjects, corrIntent));
      rows.push(r);
    }
  };

  if (examIntent) {
    const exams = await prisma.resource.findMany({
      where: { AND: [termWhere, { kind: "exam" }] },
      take: 120,
      orderBy: { createdAt: "desc" },
    });
    add(exams);
  }
  if (lessonIntent || !examIntent) {
    const lessons = await prisma.resource.findMany({
      where: { AND: [termWhere, { OR: [{ kind: "lesson" }, { kind: "exercise" }] }] },
      take: 80,
      orderBy: { createdAt: "desc" },
    });
    add(lessons);
  }

  // Fallback: a subject/stream is clearly requested but nothing specific
  // matched terms (e.g. "i need some SM exams") — pull that subject's files.
  if (rows.length === 0 && subjects.length > 0) {
    const bySubject = { OR: subjects.map((k) => ({ subjectKey: k })) };
    if (examIntent || !lessonIntent) {
      const exams = await prisma.resource.findMany({
        where: { AND: [bySubject, { kind: "exam" }] },
        take: 120,
        orderBy: { createdAt: "desc" },
      });
      add(exams);
    }
    if (lessonIntent || !examIntent) {
      const lessons = await prisma.resource.findMany({
        where: { AND: [bySubject, { OR: [{ kind: "lesson" }, { kind: "exercise" }] }] },
        take: 60,
        orderBy: { createdAt: "desc" },
      });
      add(lessons);
    }
  }

  rows.sort((a, b) => (scoreOf.get(b.url) ?? 0) - (scoreOf.get(a.url) ?? 0));
  return rows.slice(0, 8);
}

function buildLibrary(rows: Row[]): string {
  if (rows.length === 0) return "";

  const seenTitles = new Set<string>();
  const lines: string[] = [];
  for (const r of rows) {
    const title = (r.titleAr || r.titleFr || "").trim();
    const key = title.replace(/\s+/g, " ").toLowerCase();
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    const isCorr = CORR_RE.test(title);
    const kindLabel = isCorr ? "تصحيح" : r.kind === "exam" ? "امتحان" : r.kind === "exercise" ? "تمرين" : "درس";
    lines.push(`• [${kindLabel}] ${title} — ${r.url}`);
  }
  if (lines.length === 0) return "";
  return lines.join("\n");
}

function systemPrompt(lang: string, library: string, context: string): string {
  const libraryBlock =
    library ||
    "(لم يستجب ملفات لهذا السؤال — اشرحه باختصار ثم وجّه الطالب لصفحات الموقع الحقيقية: /branches للشعب و /resources للامتحانات)";
  const contextBlock = context
    ? `\nسياق الطالب الحالي (اعتمد عليه لفهم ما يدرسه الآن):\n«${context}»\n`
    : "";
  return `أنت "${lang === "ar" ? "المرشد الذكي" : "Tuteur IA"}" في موقع ناجح (Najih) — منصة مجانية لتحضير الباكالوريا المغربية. أنت أستاذ خصوصي صبور وودود يرافق الطالب التلميذ خطوة بخطوة.
${contextBlock}
🎯 مهمتك التربوية (الأهم):
1. عندما يقول الطالب "ما فهمت" أو "مافهمتش" أو "صعيب" أو "Je n'ai pas compris" أو يبدو حائراً: لا تعطه الجواب مباشرة. أولاً طمئنه ("عادي، نعاودوها ببساطة 👌")، ثم اشرح الفكرة الأساسية بلغة سهلة وبالدارجة إن كتب هو بالدارجة، واستعمل تشبيهاً من الحياة اليومية، ثم اسأله سؤالاً بسيطاً واحداً للتأكد أنه فهم. قسّم الشرح إلى خطوات صغيرة مرقّمة.
2. عندما يجيب الطالب خطأً أو يسأل عن سؤال اختبار: لا تعطِ الحل النهائي فوراً. اشرح **لماذا** الإجابة خاطئة، واذكر القاعدة، وأعطه تلميحاً (indice) أولاً ليفكر، ثم بعد محاولته اعرض الحل كاملاً مع الخطوات.
3. شجّع دائماً: كلمات تحفيزية قصيرة، احتفل بتقدمه، ولا تجعله يحس بالغباء. استعمل الإيموجي باعتدال (👍✅🎯).
4. درّبه على المنهجية: كيف يقرأ السؤال، كيف ينظم الوقت في الامتحان، كيف يتجنب الأخطاء الشائعة.

القواعد العامة:
5. أجب بنفس لغة الطالب حرفياً: الدارجة المغربية، العربية الفصحى، أو الفرنسية — مهما كتب هو.
6. كن موجزاً ومفيداً. اشرح خطوة بخطوة بأمثلة سهلة.
7. الموقع (ناجح) يحتوي: كل الشعب (SM، SP، SVT، Eco، Lettres، Arts)، موادها، دروس PDF صافية، تمارين، اختبارات تفاعلية، والامتحانات الوطنية 2022–2026 مع تصحيحاتها الرسمية.
8. أساسي جداً: الروابط الفعلية أمامك دائماً في "مكتبة ناجح" أدناه. متى طلب الطالب درساً أو امتحاناً أو تصحيحاً أو امتحانات مادة/شعبة، **أعطه الروابط مباشرة** من المكتبة حرفياً كما هي — لا تحوله أبداً إلى صفحات أو فهارس، ولا تقل أن الروابط "غير مدرجة". استعمل في ردك **كل الروابط** الواردة في المكتبة التي تناسب الطلب (لا تكتفِ برابط أو رابطين) إلا إذا كان الطلب يخص مرجعاً محددا وواحداً.
9. إذا طلب امتحانات شعبة أو مادة بدون سنة محددة (مثل "امتحانات sm" أو "عندي امتحانات رياضيات"): اعرض القائمة **كاملة وبكل الروابط** مرتبة من الأحدث إلى الأقدم (2026 ثم 2025 ثم 2024...) حتى تشمل كل سنوات المكتبة، واذكر لكل سنة رابط الامتحان ثم رابط تصحيحه إن وُجد، واضعاً [امتحان] أو [تصحيح] بجانب كل رابط.
10. إذا طلب درساً: اشرحه باختصار ثم أرفق روابط "مكتبة ناجح" الموجودة في السياق تحتها.
11. استعمل صيغة markdown (عناوين صغيرة، نقاط، روابط [نص](رابط)) لتقريب الإجابة.
12. لا تخترع ولا تلصق أي رابط غير وارد في مكتبة ناجح أو في معرفتك بموقع ناجح. إذا لم تجد التصحيح المطلوب، قل ذلك واقترح المتاح من الامتحانات الفعلية.
13. ممنوع تشجيع الغش: نَصح بالتصحيح الذاتي والمراجعة بعد المحاولة.

مكتبة ناجح المتاحة لهذا السؤال:
${libraryBlock}`;
}

export async function POST(req: Request) {
  let body: { messages?: { role: string; content: string }[]; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "AI provider key not configured" }, { status: 500 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const lang = messages[0]?.content?.includes("المرشد الذكي") ? "ar" : "fr";

  const rows = await lookup(lastUser);
  const library = buildLibrary(rows);
  const system = systemPrompt(lang, library, body.context ?? "");

  const payload = {
    model: MODEL,
    messages: [
      { role: "system", content: system },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 1400,
    temperature: 0.4,
  };

  try {
    let res: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok || (res.status !== 429 && res.status < 500)) break;
      const retryAfter = Number(res.headers.get("retry-after")) || 1.5 * (attempt + 1);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
    }
    if (!res) {
      return NextResponse.json({ error: "AI provider unreachable" }, { status: 502 });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message || err?.detail || "AI provider error" },
        { status: res.status },
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content === "string" && rows.length > 0) {
      const mentioned = new Set([...content.matchAll(/https?:\/\/[^\s)\]]+/g)].map((m) => m[0]));
      const extra = buildLibrary(rows)
        .split("\n")
        .filter((line) => {
          const u = line.match(/https?:\/\/[^\s)\]]+/)?.[0];
          return u && !mentioned.has(u);
        });
      if (extra.length > 0) {
        const heading =
          lang === "ar"
            ? "\n\n**📚 ملفات من مكتبة ناجح (روابط مباشرة):**"
            : "\n\n**📚 Fichiers disponibles sur Najih (liens directs) :**";
        data.choices[0].message.content = `${content}${heading}\n${extra.join("\n")}`;
      }
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "AI provider unreachable" },
      { status: 502 },
    );
  }
}