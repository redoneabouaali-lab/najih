type Vote = 1 | -1;

type Entry = {
  q: string;
  lang: "ar" | "fr";
  t: number;
  vote?: Vote;
};

const MAX_ENTRIES = 400;
const store: Entry[] = [];
const topicCount = new Map<string, number>();
const topicVotes = new Map<string, { good: number; bad: number }>();
const qCounts = new Map<string, number>();

const STOP = new Set([
  "ما", "هو", "هي", "هل", "كيف", "و", "في", "على", "من", "إلى", "عن", "مع", "لا", "لكن", "ثم",
  "لم", "لن", "قد", "أن", "إن", "أو", "ال", "ب", "لي", "نا", "تك", "ني", "une", "vous", "pour",
  "avec", "les", "des", "dans", "sur", "pas", "que", "qui", "quoi", "est", "comment", "faire",
  "le", "la", "un", "a", "et", "du", "au", "ce", "il", "elle", "je", "tu", "me", "moi", "d",
  "l", "s", "de", "se", "ce", "c", "j", "n", "y", "en", "mon", "ma", "ton", "ta", "ses",
]);

function normalizeForCount(q: string): string {
  return q.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function topicsOf(q: string): string[] {
  const out: string[] = [];
  for (const w of normalizeForCount(q).split(" ")) {
    if (w.length < 2 || STOP.has(w)) continue;
    out.push(w);
  }
  return out.slice(0, 10);
}

function tooGeneric(q: string): boolean {
  const n = normalizeForCount(q);
  if (n.length < 3) return true;
  const markers = ["مرحبا", "سلام", "شكرا", "hello", "salut", "bonjour", "merci", "أهلا", "أين", "oumadrassati"];
  return markers.some((m) => n.includes(m));
}

export function logStudentQuestion(q: string, lang: "ar" | "fr") {
  const clean = (q ?? "").trim().slice(0, 500);
  if (!clean || tooGeneric(clean)) return;

  const key = normalizeForCount(clean);
  qCounts.set(key, (qCounts.get(key) ?? 0) + 1);

  const tks = topicsOf(clean);
  for (const t of tks) topicCount.set(t, (topicCount.get(t) ?? 0) + 1);

  store.unshift({ q: clean, lang, t: Date.now() });
  if (store.length > MAX_ENTRIES) store.pop();
}

export function logFeedback(question: string, good: boolean) {
  const clean = (question ?? "").trim().slice(0, 500);
  if (!clean) return;
  const entry = store.find((e) => e.q === clean || normalizeForCount(e.q) === normalizeForCount(clean));
  if (entry) entry.vote = good ? 1 : -1;
  for (const t of topicsOf(clean)) {
    const rec = topicVotes.get(t) ?? { good: 0, bad: 0 };
    if (good) rec.good += 1;
    else rec.bad += 1;
    topicVotes.set(t, rec);
  }
}

function topKeys(m: Map<string, number>, n: number): string[] {
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

const IGNORE_TOPIC = /^(على|دول|حين|حيث|عند|اني|انا|واش|اش|لي|الا|علي|هدا|هذا|شي|نهار|بكري|فاش|عمرو|قد|قلنا|هو|هي|يا|اي|بغيت)$/;

function pickTopics(min = 3): string[] {
  return topKeys(topicCount, 6).filter((t) => !IGNORE_TOPIC.test(t) && topicCount.get(t)! >= min);
}

export function learningBrief(lang: "ar" | "fr"): string {
  const popular = pickTopics();
  const hard: { topic: string; bad: number; good: number }[] = [];
  for (const [t, v] of topicVotes) {
    if (v.bad > 0 && v.bad >= v.good) hard.push({ topic: t, bad: v.bad, good: v.good });
  }
  hard.sort((a, b) => b.bad - a.bad);
  const repeated = [...qCounts.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const lines: string[] = [];
  if (popular.length) {
    lines.push(
      lang === "ar"
        ? `- المواضيع الأكثر طلباً من الطلاب مؤخراً: ${popular.slice(0, 6).join("، ")}. إذا سُئل عنها، كن دقيقاً وقدّم مثالاً محلولاً كاملاً.`
        : `- Les sujets les plus demandés par les élèves récemment : ${popular.slice(0, 6).join(", ")}. Sois précis et donne un exemple entièrement résolu.`,
    );
  }
  if (hard.length) {
    const hs = hard.slice(0, 3).map((h) => `${h.topic} (${h.bad})`);
    lines.push(
      lang === "ar"
        ? `- أسئلة يجدها الطلاب صعبة (تغذية سلبية): ${hs.join("، ")} — بسّط أكثر، استعمل تشبيهاً من الحياة اليومية، كرّر الفكرة بصيغتين.`
        : `- Sujets difficiles pour les élèves (retour négatif) : ${hs.join(", ")} — simplifie davantage, utilise une analogie du quotidien, reformule l'idée.`,
    );
  }
  if (repeated.length) {
    const rs = repeated.map(([q]) => `«${q.slice(0, 60)}»`).join(" ، ");
    lines.push(
      lang === "ar"
        ? `- أسئلة تكررت أكثر من مرة: ${rs} — عند ورود سؤال مطابق أجب فوراً وبإيجاز وافٍ.`
        : `- Questions répétées : ${rs} — si une question identique arrive, réponds vite et complètement.`,
    );
  }
  if (lines.length === 0) return "";

  return lines.join("\n");
}

export function learningStats() {
  return { logged: store.length, topics: topicCount.size, recent: store.length };
}