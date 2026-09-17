"use client";

import { useEffect, useState } from "react";
import { t, type Lang } from "@/lib/lang";
import { db, type QuizResultRow } from "@/lib/db";

export function Progress({ lang }: { lang: Lang }) {
  const [results, setResults] = useState<QuizResultRow[]>([]);

  useEffect(() => {
    db.results
      .orderBy("createdAt")
      .reverse()
      .toArray()
      .then(setResults);
  }, []);

  const avg =
    results.length > 0
      ? Math.round(
          results.reduce((s, r) => s + (r.score / r.total) * 100, 0) /
            results.length,
        )
      : 0;

  const best =
    results.length > 0
      ? Math.round(
          Math.max(...results.map((r) => (r.score / r.total) * 100)),
        )
      : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
      <div className="label mb-4">📈 {t(lang, "progressTitle")}</div>
      <h1 className="sec-title text-[var(--b)]">{t(lang, "progressTitle")}</h1>

      {results.length === 0 && (
        <p className="sec-sub mt-6">{t(lang, "progressEmpty")}</p>
      )}

      {results.length > 0 && (
        <div className="space-y-8 mt-8">
          <div className="stats">
            <div className="stat">
              <div className="stat-num">{results.length}</div>
              <div className="stat-label">{t(lang, "progressTotal")}</div>
            </div>
            <div className="stat">
              <div className="stat-num">{avg}%</div>
              <div className="stat-label">{t(lang, "progressAvg")}</div>
            </div>
            <div className="stat">
              <div className="stat-num">{best}%</div>
              <div className="stat-label">{t(lang, "progressBest")}</div>
            </div>
            <div className="stat">
              <div className="stat-num">
                {results.filter((r) => (r.score / r.total) * 100 >= 50).length}
              </div>
              <div className="stat-label">≥ 50%</div>
            </div>
          </div>

          <div className="journal">
            {results.map((r) => (
              <div key={r.id} className="entry">
                <span className="entry__idx">
                  {new Date(r.createdAt).toLocaleDateString(
                    lang === "ar" ? "ar-MA" : "fr-FR",
                  )}
                  <i />
                </span>
                <div>
                  <div className="entry__title">
                    {lang === "ar" ? r.chapterTitleAr : r.chapterTitleFr}
                  </div>
                  <div className="entry__role mt-2">
                    {r.score} {t(lang, "of")} {r.total} · <b className={r.score / r.total >= 0.5 ? "text-[var(--b)]" : "text-[var(--l)]"}>{Math.round((r.score / r.total) * 100)}%</b>
                  </div>
                </div>
                <span className="entry__meta">
                  <b className={`${(r.score / r.total) * 100 >= 50 ? "" : ""}`}>
                    {Math.round((r.score / r.total) * 100)}%
                  </b>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}