"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalyzeInput, AnalyzeResult } from "@/lib/analyze";
import { kindLabel, resultToMarkdown } from "@/lib/analyze";
import { seedChat } from "@/lib/assist";

type Phase = "reading" | "done" | "failed";

const STATUS: Record<"ar" | "fr", string[]> = {
  ar: ["أقرأ المحتوى…", "أفهم السياق…", "أستخرج المفاهيم…", "أحلّل التمرين…", "أجهّز الشرح…"],
  fr: ["Je lis le contenu…", "Je comprends le contexte…", "J'extrais les idées…", "J'analyse l'exercice…", "Je prépare l'explication…"],
};

type Props = {
  storageKey: string;
  input: AnalyzeInput;
  auto?: boolean;
  autoDelay?: number;
  label?: string;
  buttonClassName?: string;
  onAnalysed?: (r: AnalyzeResult) => void;
};

const lsGet = (k: string): boolean => {
  try {
    return localStorage.getItem(k) === "1";
  } catch {
    return false;
  }
};
const lsSet = (k: string) => {
  try {
    localStorage.setItem(k, "1");
  } catch {}
};
const lsClear = (k: string) => {
  try {
    localStorage.removeItem(k);
  } catch {}
};

export function ContentUnderstand({
  storageKey,
  input,
  auto = false,
  autoDelay = 900,
  label = "فهم هذا الملف",
  buttonClassName = "",
  onAnalysed,
}: Props) {
  const lang = input.lang === "fr" ? "fr" : "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fullKey = `najih:u:${storageKey}`;

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("reading");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [supIdx, setSupIdx] = useState(0);
  const [errText, setErrText] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const runRef = useRef(0);

  const runAnalyze = useCallback(async () => {
    const id = ++runRef.current;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setPhase("reading");
    setSupIdx(0);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: ctrl.signal,
      });
      let data: AnalyzeResult;
      try {
        data = await res.json();
      } catch {
        data = { ok: false, fallback: "retry" };
      }
      if (runRef.current !== id) return;
      setResult(data);
      if (data.ok) {
        setPhase("done");
      } else {
        setErrText(
          data.fallback === "upload"
            ? lang === "ar"
              ? "لم أتمكن من قراءة هذا الملف."
              : "Je n'ai pas pu lire ce fichier."
            : lang === "ar"
              ? "حدث خطأ أثناء التحليل، حاول مجدداً."
              : "Une erreur est survenue, réessaie.",
        );
        setPhase("failed");
      }
      onAnalysed?.(data);
    } catch {
      if (runRef.current !== id) return;
      setErrText(lang === "ar" ? "تعذّر الاتصال، حاول مجدداً." : "Problème de connexion, réessaie.");
      setPhase("failed");
    }
  }, [input, lang, onAnalysed]);

  // auto-once trigger
  useEffect(() => {
    if (!auto) return;
    let tm: ReturnType<typeof setTimeout> | undefined;
    if (!lsGet(fullKey)) {
      tm = setTimeout(() => {
        if (!lsGet(fullKey)) {
          setOpen(true);
          lsSet(fullKey);
        }
      }, autoDelay);
    }
    return () => {
      if (tm) clearTimeout(tm);
    };
  }, [auto, autoDelay, fullKey]);

  // status rotation
  useEffect(() => {
    if (phase !== "reading") return;
    const int = setInterval(
      () => setSupIdx((i) => (i + 1) % STATUS[lang].length),
      2400,
    );
    return () => clearInterval(int);
  }, [phase, lang]);

  const close = useCallback(() => {
    setOpen(false);
    runRef.current++;
    abortRef.current?.abort();
  }, []);

  const retry = useCallback(() => {
    lsClear(fullKey);
    setRevealed(false);
    void runAnalyze();
  }, [fullKey, runAnalyze]);

  const continueToChat = useCallback(() => {
    if (result?.ok) {
      seedChat([
        {
          role: "assistant",
          content: resultToMarkdown(result, revealed),
        },
      ]);
    }
    close();
  }, [result, revealed, close]);

  if (!open) {
    if (auto) return null;
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          lsSet(fullKey);
        }}
        className={buttonClassName || "btn btn-ghost btn-sm"}
        title={label}
      >
        ✦ {label}
      </button>
    );
  }

  const statusLines = STATUS[lang];
  const isLesson = result?.kind === "lesson";

  return (
    <div className="u-wrap" dir={dir}>
      <div className="u-backdrop" onClick={phase !== "reading" ? close : undefined} aria-hidden />
      <div className="u-blob u-blob--a" aria-hidden />
      <div className="u-blob u-blob--b" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="u-title"
        className="u-card u-pop"
      >
        <div className="u-card__bar" aria-hidden />

        {phase === "reading" && (
          <div className="u-reading">
            <div className="u-orb" aria-hidden>
              <span className="u-orb__ring" />
              <span className="u-orb__core">🦉</span>
            </div>
            <h3 id="u-title" className="u-reading__title">
              {lang === "ar" ? "جارٍ فهم المحتوى…" : "Je comprends le contenu…"}
            </h3>
            <div className="u-reading__status" aria-live="polite">
              <span key={supIdx} className="u-fade">
                {statusLines[supIdx]}
              </span>
            </div>
            <div className="u-progress" aria-hidden />
            <p className="u-reading__cap mono">
              {lang === "ar" ? "المرشد الذكي • ناجح" : "Tuteur IA • Najih"}
            </p>
          </div>
        )}

        {phase === "done" && result && (
          <div className="u-done">
            <header className="u-head">
              <span className="u-chip u-chip--kind">{kindLabel(result.kind, lang)}</span>
              {result.title && (
                <h3 id="u-title" className="u-title">
                  {result.title}
                </h3>
              )}
              <div className="flex items-center gap-2 ms-auto">
                {!isLesson && (
                  <button
                    type="button"
                    onClick={() => setRevealed((v) => !v)}
                    className={`btn btn-ghost btn-sm ${revealed ? "!text-amber-600 !border-amber-400" : ""}`}
                  >
                    {revealed
                      ? lang === "ar" ? "إخفاء الحل" : "Masquer la solution"
                      : lang === "ar" ? "أظهر غير محلول" : "Sans solution"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  aria-label={lang === "ar" ? "إغلاق" : "Fermer"}
                  className="u-close"
                >
                  ✕
                </button>
              </div>
            </header>

            <div className="u-scroll" data-lenis-prevent>
              {result.summary && result.summary.length > 0 && (
                <section className="mb-5">
                  <div className="u-sec-label">
                    {isLesson
                      ? lang === "ar" ? "📖 الملخص" : "📖 Résumé"
                      : lang === "ar" ? "الهدف من التمرين" : "Objectif de l'exercice"}
                  </div>
                  <ul className="u-list">
                    {result.summary.map((s, i) => (
                      <li key={i} className="u-item u-rise" style={{ animationDelay: `${i * 70}ms` }}>
                        <span className="u-dot" aria-hidden />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.steps && result.steps.length > 0 && (
                <section className="mb-5">
                  <div className="u-sec-label">
                    {isLesson
                      ? lang === "ar" ? "🗺️ خطة المراجعة" : "🗺️ Plan de révision"
                      : lang === "ar" ? "👣 الشرح خطوة بخطوة" : "👣 Explication pas à pas"}
                  </div>
                  <div className="u-steps">
                    {result.steps.map((s, i) => (
                      <div
                        key={i}
                        className="u-step u-rise"
                        style={{ animationDelay: `${i * 80 + 200}ms` }}
                      >
                        <span className="u-step__num">{i + 1}</span>
                        <span className="u-step__txt">{s}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!isLesson && (
                <section className="mt-6">
                  {!revealed ? (
                    <div className="u-reveal u-fade">
                      <p className="u-reveal__hint">
                        {lang === "ar"
                          ? "جرّب حل التمرين بنفسك أولاً، ثم كشف الحل للتأكد 👇"
                          : "Essaie de résoudre l'exercice d'abord, puis révèle la solution pour vérifier 👇"}
                      </p>
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setRevealed(true);
                            requestAnimationFrame(() => {
                              document
                                .querySelector(".u-answer")
                                ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                            });
                          }}
                          className="btn btn-emerald !px-8 u-glow"
                        >
                          {lang === "ar" ? "🔍 أظهر الإجابة" : "🔍 Révéler la réponse"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    result.answer &&
                    result.answer.length > 0 && (
                      <div className="u-answer u-pop">
                        <div className="u-answer__head">
                          <span className="u-answer__check" aria-hidden>
                            ✓
                          </span>
                          {lang === "ar" ? "الحل الكامل" : "Solution complète"}
                        </div>
                        <div className="u-answer__body">{result.answer}</div>
                      </div>
                    )
                  )}
                </section>
              )}

              {result.notes && result.notes.length > 0 && (
                <section className="mt-5">
                  <div className="u-sec-label">
                    {lang === "ar" ? "⭐ نصائح مهمة" : "⭐ Conseils importants"}
                  </div>
                  <ul className="u-list">
                    {result.notes.map((s, i) => (
                      <li key={i} className="u-item u-fade" style={{ animationDelay: `${i * 60}ms` }}>
                        <span className="u-dot u-dot--amber" aria-hidden />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <footer className="u-foot">
              <button
                type="button"
                onClick={continueToChat}
                className="btn btn-emerald flex-1"
              >
                🦉 {lang === "ar" ? "تابع في الشات" : "Continuer dans le chat"}
              </button>
              <button type="button" onClick={retry} className="btn btn-ghost btn-sm">
                {lang === "ar" ? "↻ إعادة الفهم" : "↻ Re-comprendre"}
              </button>
            </footer>
          </div>
        )}

        {phase === "failed" && (
          <div className="u-fail">
            <div className="u-fail__icon u-pop">😕</div>
            <h3 id="u-title" className="u-reading__title">{errText}</h3>
            <p className="u-fail__sub">
              {lang === "ar"
                ? "يمكنك رفع صورة السؤال أو ملف PDF داخل الشات وسأقرؤه لك مباشرة، أو اسألني عن الموضوع عموماً."
                : "Tu peux joindre une photo du sujet ou un PDF dans le chat et je le lirai pour toi, ou pose-moi une question sur la matière."}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <button type="button" onClick={continueToChat} className="btn btn-emerald">
                🦉 {lang === "ar" ? "افتح الشات" : "Ouvrir le chat"}
              </button>
              <button type="button" onClick={retry} className="btn btn-ghost">
                ↻ {lang === "ar" ? "إعادة المحاولة" : "Réessayer"}
              </button>
            </div>
            <button type="button" onClick={close} className="u-fail__dismiss">
              {lang === "ar" ? "تخطي الآن" : "Passer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}