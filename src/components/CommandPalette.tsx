"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeLang, getClientLang, t, type Lang } from "@/lib/lang";

type Item = { url: string; label: string; sub: string; icon: string };

export function CommandPalette() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("ar");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const seqRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickLockRef = useRef<string | null>(null);

  const openPalette = useCallback(() => {
    setLang(normalizeLang(getClientLang()));
    void setOpen?.(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      } else if (open && (k === "arrowdown" || k === "arrowup")) {
        e.preventDefault();
        setActive((a) => {
          const n = items.length;
          if (n === 0) return -1;
          return k === "arrowdown" ? (a + 1) % n : (a - 1 + n) % n;
        });
      } else if (open && e.key === "Enter") {
        e.preventDefault();
        const it = items[active];
        if (it) {
          const url = it.url;
          setOpen(false);
          if (clickLockRef.current === url) return;
          clickLockRef.current = url;
          router.push(url);
          setTimeout(() => (clickLockRef.current = null), 300);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, active, router]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const f = setTimeout(() => inputRef.current?.focus(), 30);
      return () => {
        document.body.style.overflow = "";
        clearTimeout(f);
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const tk = q.trim();
    if (tk.length < 2) {
      setItems([]);
      setActive(-1);
      setLoading(false);
      return;
    }
    const seq = ++seqRef.current;
    setLoading(true);
    setActive(-1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(tk)}&lang=${lang}`);
        const data = await res.json();
        if (seq !== seqRef.current) return;
        setItems(data.items ?? []);
        setActive(data.items?.length ? 0 : -1);
        setLoading(false);
      } catch {
        if (seq === seqRef.current) {
          setItems([]);
          setLoading(false);
        }
      }
    }, 150);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [q, open, lang]);

  useEffect(() => {
    const li = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    li?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const ar = lang === "ar";
  const truncated =
    items.length && items.length < 1 ? [] : items;
  void truncated;

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="palette-btn"
        title={`${ar ? "بحث سريع" : "Recherche rapide"} (Ctrl K)`}
      >
        <span aria-hidden>🔍</span>
        <span className="palette-btn-t">{ar ? "ابحث…" : "Rechercher…"}</span>
        <kbd aria-hidden>Ctrl K</kbd>
      </button>

      {open && (
        <div
          className="palette-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="palette" dir={ar ? "rtl" : "ltr"}>
            <div className="palette-bar">
              <span aria-hidden className="palette-dot">🔍</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={ar ? "اكتب: مادة، درس، امتحان، سنة…" : "Tapez : matière, cours, examen, année…"}
                aria-label={ar ? "بحث سريع" : "Recherche rapide"}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="palette-input"
              />
              {loading && <span className="palette-spin" aria-hidden />}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={ar ? "إغلاق" : "Fermer"}
                className="palette-close"
              >
                Esc
              </button>
            </div>

            {q.trim().length < 2 ? (
              <div className="palette-hint">
                {ar
                  ? "ابدأ الكتابة للقفز مباشرة إلى أي درس أو امتحان أو اختبار أو مادة."
                  : "Commencez à taper pour sauter directement vers un cours, un examen, un quiz ou une matière."}
              </div>
            ) : (
              <ul ref={listRef} className="palette-list" role="listbox" aria-label={ar ? "نتائج" : "Résultats"}>
                {items.map((it, i) => (
                  <li key={it.url} role="option" aria-selected={i === active}>
                    <button
                      type="button"
                      data-active={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => {
                        const url = it.url;
                        setOpen(false);
                        if (clickLockRef.current === url) return;
                        clickLockRef.current = url;
                        router.push(url);
                        setTimeout(() => (clickLockRef.current = null), 300);
                      }}
                      className="palette-item"
                    >
                      <span aria-hidden className="palette-ic">{it.icon}</span>
                      <span className="palette-tx">
                        <span className="palette-lb">{it.label}</span>
                        <span className="palette-sb">{it.sub}</span>
                      </span>
                      {i === active && (
                        <span aria-hidden className="palette-go">{ar ? "←" : "→"}</span>
                      )}
                    </button>
                  </li>
                ))}
                {items.length === 0 && !loading && (
                  <li className="palette-none">{ar ? "لا نتائج مطابقة." : "Aucun résultat."}</li>
                )}
              </ul>
            )}

            <div className="palette-foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> {ar ? "تنقل" : "Naviguer"}</span>
              <span><kbd>↵</kbd> {ar ? "فتح" : "Ouvrir"}</span>
              <span><kbd>esc</kbd> {ar ? "إغلاق" : "Fermer"}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
