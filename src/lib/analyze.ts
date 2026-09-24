export type AnalyzeInput = {
  content?: string;
  resourceUrl?: string;
  title?: string;
  kindHint?: "lesson" | "exercise";
  lang?: "ar" | "fr";
  context?: string;
  sessionId?: string;
};

export type AnalyzeResult = {
  ok: boolean;
  kind?: "lesson" | "exercise" | "unknown";
  title?: string;
  summary?: string[];
  steps?: string[];
  answer?: string;
  notes?: string[];
  fallback?: "upload" | "retry" | "quota";
  raw?: string;
};

const KIND_TITLE: Record<NonNullable<AnalyzeResult["kind"]>, string> = {
  lesson: "درس 📖",
  exercise: "تمرين ✍️",
  unknown: "محتوى 📄",
};

export function kindLabel(kind: AnalyzeResult["kind"], lang: "ar" | "fr"): string {
  if (lang === "fr") {
    if (kind === "lesson") return "Leçon 📖";
    if (kind === "exercise") return "Exercice ✍️";
    return "Contenu 📄";
  }
  return KIND_TITLE[kind ?? "unknown"];
}

export function analyzeInstruction(kindHint: AnalyzeInput["kindHint"], lang: "ar" | "fr"): string {
  if (lang === "fr") {
    return `Analyse le contenu éducatif ci-dessous (leçon ou exercice). Réponds UNIQUEMENT avec un objet JSON valide, sans autre texte, au format :
{"kind":"lesson"|"exercise","title":"...","summary":["...","..."],"steps":["...","..."],"answer":"...","notes":["...","..."]}
Règles :
- Leçon (kind="lesson") : summary = points essentiels, complets et structurés (5 à 7 points) qui résument le cours ; steps = plan de révision (3-4) ; answer = "" (vide) ; notes = règles / formules / termes importants.
- Exercice (kind="exercise") : summary = court (type de question et ce qui est demandé) ; steps = explication pédagogique étape par étape (4 à 8 étapes) qui ENSEIGNE la méthode SANS révéler le résultat final ni la réponse ; answer = solution complète détaillée et finale (elle sera affichée plus tard) ; notes = erreurs fréquentes / conseils si utiles.
- Si tu ne peux pas déterminer : kind="unknown", summary avec une remarque.
- Réponds dans la langue du contenu (arabe/darija ou français), sois direct, sans introduction.`;
  }
  return `حلّل المحتوى التعليمي التالي (درس أو تمرين). أجب حصراً بكائن JSON صالح **بدون أي نص خارجه** بالشكل التالي:
{"kind":"lesson"|"exercise","title":"...","summary":["...","..."],"steps":["...","..."],"answer":"...","notes":["...","..."]}
القواعد:
- إذا كان درساً (kind="lesson"): summary = نقاط أساسية وافية ومرتّبة (5 إلى 7 نقاط) تُلخّص الدرس وتركز على المفاهيم لا النقل الحرفي، steps = خطة مراجعة (3-4 خطوات)، answer = "" (فارغة)، notes = أهم القواعد/الصيغ/المصطلحات.
- إذا كان تمريناً (kind="exercise"): summary = وصف مقتضب (نوع السؤال والمطلوب)، steps = شرح تعليمي خطوة بخطوة (4 إلى 8 خطوات) يعلّم طريقة الحل **دون كشف الناتج النهائي أو الحل** إطلاقاً، answer = الحل الكامل التفصيلي والإجابة النهائية (ستُعرض لاحقاً بعد محاولة الطالب)، notes = أخطاء شائعة/نصائح إن وُجدت.
- إن تعذّر تحديد النوع: kind="unknown" و summary فيها ملاحظة مناسبة.
- اكتب بلغة المحتوى نفسها (عربية/دارجة أو فرنسية) وكن مباشراً بلا مقدمات.`;
}

export function buildAnalyzeUser(extracted: string, title: string | undefined): string {
  return `${title ? `العنوان: «${title}»\n\n` : ""}المحتوى:
«${extracted.length > 16000 ? `${extracted.slice(0, 16000)}…` : extracted}»`;
}

const JSON_RE = /\{[\s\S]*\}/;

export function parseAnalyzeJson(
  text: string,
): Omit<AnalyzeResult, "ok"> | null {
  const cleaned = (text ?? "").trim();
  const candidates = [
    cleaned,
    JSON_RE.exec(cleaned)?.[0] ?? "",
    cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim(),
  ];
  for (const c of candidates) {
    if (!c) continue;
    try {
      const o = JSON.parse(c);
      if (o && typeof o === "object") {
        const arr = (v: unknown): string[] =>
          Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 12) : [];
        return {
          kind: o.kind === "lesson" || o.kind === "exercise" || o.kind === "unknown" ? o.kind : "unknown",
          title: typeof o.title === "string" ? o.title : undefined,
          summary: arr(o.summary),
          steps: arr(o.steps),
          answer: typeof o.answer === "string" ? o.answer : undefined,
          notes: arr(o.notes),
        };
      }
    } catch {
      /* next candidate */
    }
  }
  return null;
}

export function resultToMarkdown(r: AnalyzeResult, withAnswer: boolean): string {
  const lines: string[] = [];
  if (r.title) lines.push(`## ${r.title}\n`);
  if (r.summary?.length) {
    lines.push(`**${r.kind === "lesson" ? "الملخص" : "المطلوب"}**`);
    r.summary.forEach((s) => lines.push(`• ${s}`));
  }
  if (r.steps?.length) {
    lines.push(`\n**${r.kind === "exercise" ? "الشرح خطوة بخطوة" : "خطة المراجعة"}**`);
    r.steps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  }
  if (withAnswer && r.answer) {
    lines.push(`\n**الحل الكامل**\n${r.answer}`);
  }
  if (r.notes?.length) {
    lines.push(`\n**نصائح مهمة**`);
    r.notes.forEach((s) => lines.push(`• ${s}`));
  }
  return lines.join("\n");
}