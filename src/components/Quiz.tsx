"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { t, type Lang } from "@/lib/lang";
import { shuffle } from "@/lib/shuffle";
import { db } from "@/lib/db";

type Option = { id: string; textAr: string; textFr: string; isCorrect: boolean };

type Question = {
  id: string;
  promptAr: string;
  promptFr: string;
  year?: number | null;
  session?: string | null;
  source?: string | null;
  explanationAr?: string | null;
  explanationFr?: string | null;
  options: Option[];
};

export type QuizProps = {
  lang: Lang;
  chapterId: string;
  chapterTitleAr: string;
  chapterTitleFr: string;
  questions: Question[];
};

export function Quiz({
  lang,
  chapterId,
  chapterTitleAr,
  chapterTitleFr,
  questions,
}: QuizProps) {
  const [deck, setDeck] = useState<Question[]>(questions);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [acc, setAcc] = useState(0);
  const [phase, setPhase] = useState<"quiz" | "done">("quiz");
  const [answers, setAnswers] = useState<{ qId: string; correct: boolean }[]>(
    [],
  );

  const handleSelect = useCallback(
    (optId: string) => {
      if (feedback) return;
      setSelected(optId);
      setFeedback(true);
      const q = deck![idx];
      const correct = q.options.find((o) => o.id === optId)?.isCorrect ?? false;
      setAcc((a) => (correct ? a + 1 : a));
      setAnswers((a) => [...a, { qId: q.id, correct }]);
    },
    [deck, idx, feedback],
  );

  const advance = useCallback(() => {
    if (idx + 1 >= deck!.length) {
      setPhase("done");
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      setFeedback(false);
    }
  }, [deck, idx]);

  useEffect(() => {
    if (phase !== "done" || answers.length === 0) return;
    db.results.add({
      chapterId,
      chapterTitleAr,
      chapterTitleFr,
      score: acc,
      total: answers.length,
      createdAt: Date.now(),
    });
  }, [phase, answers.length, acc, chapterId, chapterTitleAr, chapterTitleFr]);

  const restart = () => {
    setDeck(
      shuffle(questions).map((q) => ({
        ...q,
        options: shuffle(q.options),
      })),
    );
    setIdx(0);
    setSelected(null);
    setFeedback(false);
    setAcc(0);
    setAnswers([]);
    setPhase("quiz");
  };

  if (!deck)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;

  if (deck.length === 0)
    return (
      <div className="p-8 text-center space-y-4">
        <p>{t(lang, "noQuestions")}</p>
        <Link href="/" className="text-[var(--b)] hover:opacity-60">
          {t(lang, "backToLessons")}
        </Link>
      </div>
    );

  if (phase === "done") {
    const pct = Math.round((acc / answers.length) * 100);
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="label mb-4">🎯 {t(lang, "score")}</div>
        <div className="text-6xl font-bold text-center my-8 text-[var(--b)]">{pct}%</div>
        <p className="sec-sub text-center mt-2">
          {acc} {t(lang, "of")} {answers.length} ✓
        </p>
        <div className="space-y-4 mt-8">
          {deck.map((q, i) => (
            <div
              key={q.id}
              className={`panel p-5 ${answers[i]?.correct ? "" : "ans-wrong"}`}
            >
              <div className={`mono text-xs mb-2 ${answers[i]?.correct ? "text-[var(--acc)]" : "text-[var(--d)]"}`}>
                {answers[i]?.correct ? "✓" : "✗"} — 0{i + 1}
              </div>
              <p className="font-bold text-[var(--b)]">
                {lang === "ar" ? q.promptAr : q.promptFr}
              </p>
              {!answers[i]?.correct &&
                ((lang === "ar" && q.explanationAr) ||
                  (lang === "fr" && q.explanationFr)) && (
                  <p className="text-sm mt-2 text-[var(--l)]">
                    {lang === "ar" ? q.explanationAr : q.explanationFr}
                  </p>
                )}
              {q.source && (
                <p className="mono text-[11px] mt-2 text-[var(--p)]">{q.source}</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={restart} className="btn btn-emerald">
            {t(lang, "retry")}
          </button>
          <Link href="/" className="btn btn-ghost">
            {t(lang, "backToLessons")}
          </Link>
        </div>
      </div>
    );
  }

  const q = deck[idx];
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mono text-xs uppercase tracking-[.14em] text-[var(--l)]">
        <span>{t(lang, "score")}: <b className="text-[var(--b)]">{acc}</b></span>
        <span>
          <b className="text-[var(--b)]">{idx + 1}</b> {t(lang, "of")} {deck.length}
        </span>
      </div>
      <div className="panel p-6 sm:p-8 text-lg leading-relaxed font-bold text-[var(--b)]">
        {lang === "ar" ? q.promptAr : q.promptFr}
      </div>
      <div className="space-y-3">
        {q.options.map((opt, oi) => {
          const text = lang === "ar" ? opt.textAr : opt.textFr;
          let cls = "opt-o";
          if (feedback && opt.id === selected) {
            cls = opt.isCorrect ? "ans-correct" : "ans-wrong";
          } else if (feedback && opt.isCorrect) {
            cls = "ans-correct";
          } else if (feedback) {
            cls = "opacity-50 cursor-default border-ha";
          }
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={feedback}
              className={`block w-full text-right p-4 px-5 border transition-all ${cls}`}
            >
              <span className="mono text-xs mr-3 text-[var(--p)]">
                {String.fromCharCode(97 + oi)}
              </span>
              {text}
            </button>
          );
        })}
      </div>
      {feedback && (
        <div className="space-y-3">
          <div
            className={`p-3 text-sm font-medium ${q.options.find((o) => o.id === selected)?.isCorrect ? "ans-correct" : "ans-wrong"}`}
          >
            {q.options.find((o) => o.id === selected)?.isCorrect
              ? `✓ ${t(lang, "correct")}`
              : `✗ ${t(lang, "wrong")}`}
          </div>
          {((lang === "ar" && q.explanationAr) ||
            (lang === "fr" && q.explanationFr)) && (
            <p className="text-sm text-[var(--l)]">
              {lang === "ar" ? q.explanationAr : q.explanationFr}
            </p>
          )}
          {q.source && (
            <p className="mono text-[11px] text-[var(--p)]">{q.source}</p>
          )}
          <button onClick={advance} className="btn btn-emerald w-full">
            {idx + 1 >= deck.length ? t(lang, "finish") : t(lang, "nextQ")}
          </button>
        </div>
      )}
    </div>
  );
}