import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrieveKnowledge } from "@/lib/knowledge";
import { logStudentQuestion, learningBrief } from "@/lib/learning";
import { nextApiKey, hasApiKeys, NVIDIA_URL } from "@/lib/keys";
import { quotaRemaining, chargeTokens, quotaLimit } from "@/lib/quota";

export const runtime = "nodejs";

const MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";
const VISION_MODEL = "meta/llama-3.2-90b-vision-instruct";

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

function systemPrompt(lang: string, library: string, context: string, knowledge: string, learning: string): string {
  const libraryBlock =
    library ||
    "(لم يستجب ملفات لهذا السؤال — اشرحه باختصار ثم وجّه الطالب لصفحات الموقع الحقيقية: /branches للشعب و /resources للامتحانات)";
  const contextBlock = context
    ? `\nسياق الطالب الحالي (اعتمد عليه لفهم ما يدرسه الآن):\n«${context}»\n`
    : "";
  const teachBlock = context
    ? `
📌 أنت الآن معلم المحتوى الذي يتابعه الطالب فعلياً على الشاشة (انظر «سياق الطالب الحالي» أعلاه): decide نفسك حسب نوع السياق —
- إن كان السياق درساً: اشرح **هذا الدرس بالتحديد** خطوة بخطوة بلغة بسيطة ومصطلحاته، ثم أعطِ **مثالاً محلولاً كاملاً** وبعده **مثالاً إضافياً مختلفاً** للتدريب، واختم بسؤال خفيف تتأكد به من الفهم.
- إن كان سياقاً لامتحان وطني أو ملف PDF لا يمكنك رؤيته: لا تتظاهر برؤية الملف، بل اشرح **مادة الامتحان ومميزاته ومنهجية الإجابة عليه**، واعرض **مثالاً محلولاً كاملاً بأسلوب سؤال وطني** ثم مثالاً إضافياً مختلفاً، واظهر له خطة تدريب للنجاح.
- إن كان اختباراً تفاعلياً بأسئلة: ساعد على فهم **السؤال المعروض** (انه في السياق) بتلميحات متدرجة دون إعطاء الجواب مباشرة، ثم أَعطِ مثالاً موازياً بعد محاولته.
- دائماً: سلّط الضوء على المادة الحالية لا غير (رياضيات/فيزياء/SVT/اقتصاد...)، وكن دقيقاً في المصطلحات.
`
    : "";
  const knowledgeBlock = knowledge
    ? `\n\n📚 **مكتبة دروس ناجح (محتوى حقيقي مسترجع من الموقع الآن)** — هذه دروس ومحتوى فعلي من المنصة يخص سؤال الطالب. اعتمد عليه للإجابة بسرعة ودقة:
- إن كان السؤال عن درس: اشرح من هذا المحتوى مباشرة وحُلّ إليه بالأمثلة.
- إن ورد هنا سؤال امتحان محلول (مع اختياراته وشرحه): اجبه مباشرة واشرح لماذا هذا الاختيار صحيح، دون التظاهر بأنك ترى شيئاً آخر.
- لا تلقّن هذا المحتوى للطالب كما هو: أعد صياغته بأسلوبك التعليمي، وإذا كان ناقصاً وُضّح ذلك.

المحتوى المسترجع:
${knowledge}
`
    : "";
  const learningBlock = learning
    ? `\n🧠 **سلوكك المُتعلَّم من أسئلة الطلاب** (تحسين تلقائي، استعمله بسلاسة دون ذكره حرفياً):
${learning}\n`
    : "";
  return `أنت "${lang === "ar" ? "المرشد الذكي" : "Tuteur IA"}" في موقع ناجح (Najih) — منصة مجانية لتحضير الباكالوريا المغربية. أنت أستاذ خصوصي صبور وودود يرافق الطالب التلميذ خطوة بخطوة.
${contextBlock}${teachBlock}${knowledgeBlock}${learningBlock}
🎯 مهمتك التربوية (الأهم):
1. عندما يقول الطالب "ما فهمت" أو "مافهمتش" أو "صعيب" أو "Je n'ai pas compris" أو يبدو حائراً: لا تعطه الجواب مباشرة. أولاً طمئنه ("عادي، نعاودوها ببساطة 👌")، ثم اشرح الفكرة الأساسية بلغة سهلة وبالدارجة إن كتب هو بالدارجة، واستعمل تشبيهاً من الحياة اليومية، ثم اسأله سؤالاً بسيطاً واحداً للتأكد أنه فهم. قسّم الشرح إلى خطوات صغيرة مرقّمة.
2. عندما يجيب الطالب خطأً أو يسأل عن سؤال اختبار: لا تعطِ الحل النهائي فوراً. اشرح **لماذا** الإجابة خاطئة، واذكر القاعدة، وأعطه تلميحاً (indice) أولاً ليفكر، ثم بعد محاولته اعرض الحل كاملاً مع الخطوات.
3. شجّع دائماً: كلمات تحفيزية قصيرة، احتفل بتقدمه، ولا تجعله يحس بالغباء. استعمل الإيموجي باعتدال (👍✅🎯).
4. درّبه على المنهجية: كيف يقرأ السؤال، كيف ينظم الوقت في الامتحان، كيف يتجنب الأخطاء الشائعة.

القواعد العامة:
5. أجب بنفس لغة الطالب حرفياً: الدارجة المغربية، العربية الفصحى، أو الفرنسية — مهما كتب هو.
6. أجب بنبرة بشرية ودودة تُعلّم ولا «تُفرغ» معلومات. شكّل إجابتك دائماً بهذا الهيكل: (أ) سطر قصير ودّي يطهّن الطالب (مثل "واضحة؟ جيت نعلّمك خطوة بخطوة 👌" أو "Allons-y pas à pas 👍")، (ب) الشرح خطوة بخطوة بأقسام مرقّمة قصيرة، (ج) مثال محلول كامل، (د) سؤال ختامي صغير يتأكد به من الفهم أو جملة تحفيز. لا ترد أبداً بفقرة جافة واحدة أو بشرح «أكاديمي بارد» — اجعل الإجابة كأنها من أستاذ حقيقي صبور وودود.
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
  let body: {
    messages?: { role: string; content: string }[];
    context?: string;
    sessionId?: string;
    attachments?: { type?: string; dataUrl?: string; text?: string; name?: string }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  if (!hasApiKeys()) {
    return NextResponse.json({ error: "AI provider key not configured" }, { status: 500 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const lang: "ar" | "fr" = messages[0]?.content?.includes("المرشد الذكي") ? "ar" : "fr";

  const sessionId = (body.sessionId ?? "").toString().trim();
  if (sessionId && quotaRemaining(sessionId) <= 0) {
    const msg =
      lang === "ar"
        ? `رصيد هذه الجلسة انتهى اليوم 📚 (حد ${quotaLimit().toLocaleString("fr-FR")} توكن/24 ساعة). عد غداً، أو استعمل زر «فهم هذا الملف» الأزرق في صفحات الدروس والتمارين، أو أرسل سؤالاً أقصر وأكثر تحديداً. المرشد يبقى متاحاً لإجابات قصيرة.`
        : `Le crédit de cette session est épuisé aujourd'hui 📚 (plafond ${quotaLimit().toLocaleString("fr-FR")} jetons/24 h). Reviens demain, utilise le bouton « Comprendre ce fichier » sur les pages de cours/exercices, ou pose une question plus courte et précise. Le tuteur reste disponible pour les réponses courtes.`;
    return NextResponse.json({
      choices: [{ message: { role: "assistant", content: msg }, finish_reason: "stop" }],
      usage: { total_tokens: 0 },
    });
  }

  const rows = await lookup(lastUser);
  const library = buildLibrary(rows);
  const knowledge = await retrieveKnowledge(lastUser, body.context ?? "", lang);
  const learning = learningBrief(lang);
  logStudentQuestion(lastUser, lang);
  const system = systemPrompt(lang, library, body.context ?? "", knowledge, learning);

  const attachments = body.attachments ?? [];
  const img = attachments.find((a) => a.type === "image");
  const pdfs = attachments.filter((a) => a.type === "pdf" && a.text);
  const model = img ? VISION_MODEL : MODEL;

  const mapped: { role: string; content: unknown }[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const last = mapped[mapped.length - 1];
  if (last) {
    if (img?.dataUrl) {
      last.content = [
        {
          type: "text",
          text:
            typeof last.content === "string"
              ? `${last.content || "اقرأ هذه الصورة وشرح محتواها التعليمي بخطوات، واعرض الحل إن كان سؤالاً."}${
                  img.name ? `\n(اسم الملف: ${img.name})` : ""
                }`
              : "",
        },
        { type: "image_url", image_url: { url: img.dataUrl } },
      ];
    } else if (pdfs.length > 0) {
      const base = typeof last.content === "string" ? last.content : "";
      const appendix = pdfs
        .map(
          (p) =>
            `[📎 مرفق PDF ${p.name ? `«${p.name}»` : ""} — النص المستخرج (قد يكون مبتوراً):]\n«${p.text?.slice(0, 6000) ?? ""}»`,
        )
        .join("\n\n");
      last.content = `${base}\n\n${appendix}`.trim();
    }
  }

  const payload = {
    model,
    messages: [
      { role: "system", content: system },
      ...mapped,
    ],
    max_tokens: 1400,
    temperature: 0.4,
  };

  try {
    let res: Response | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const key = nextApiKey();
      if (!key) break;
      res = await fetch(NVIDIA_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok || (res.status !== 429 && res.status < 500)) break;
      const retryAfter = Number(res.headers.get("retry-after")) || 2 * (attempt + 1);
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
    if (sessionId) chargeTokens(sessionId, data?.usage?.total_tokens);
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