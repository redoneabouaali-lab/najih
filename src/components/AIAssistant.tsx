"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { t, type Lang } from "@/lib/lang";
import { renderMd } from "@/lib/md";
import type { AssistOpenDetail } from "@/lib/assist";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_HINT = "najih-assist-hint-v1";

function suggestFor(lang: Lang, path: string): string[] {
  const isQuiz = path.startsWith("/quiz/");
  const isLesson = path.startsWith("/lesson/");
  const isResources = path.startsWith("/resources") || path.startsWith("/branches");
  const chips: string[] = [];
  if (lang === "ar") {
    if (isQuiz) chips.push("ما فهمت السؤال، اشرح لي ببساطة", "ما هي الإجابة الصحيحة؟", "أعطني نصائح للامتحان");
    else if (isLesson) chips.push("لخص لي هذا الدرس في نقاط", "اشرح أكبر فكرة بالدارجة", "أعطني مثال تطبيقي");
    else if (isResources) chips.push("أي شعبة تناسبني؟", "وريني التصحيحات الرسمية", "كيف نخطط للمراجعة؟");
    else chips.push("اشرح لي درس الرياضيات بالدارجة", "عطيني خطة مراجعة للباك", "وريني امتحانات شعبتي");
  } else {
    if (isQuiz) chips.push("Je n'ai pas compris la question, explique-moi", "Quelle est la bonne réponse ?", "Conseils pour l'examen");
    else if (isLesson) chips.push("Résume ce cours en points", "Explique l'idée clé en darija", "Donne-moi un exemple");
    else if (isResources) chips.push("Quelle filière me convient ?", "Montre-moi les corrections", "Comment planifier ?");
    else chips.push("Explique-moi les maths en darija", "Donne-moi un plan de révision", "Montre-moi les examens");
  }
  return chips;
}

function welcomeMsg(lang: Lang): Msg {
  return {
    role: "assistant",
    content:
      lang === "ar"
        ? "أهلاً بك! أنا **المرشد الذكي** 👋 — اسألني عن أي درس أو امتحان أو سؤال في الباك، وأشرح لك بالعربية أو بالفرنسية. فين راك محتاج المساعدة؟"
        : "Salut ! Je suis le **Tuteur IA** 👋 — pose-moi une question sur n'importe quelle leçon ou examen du Bac, je t'explique en arabe ou en français. Besoin d'aide ?",
  };
}

export function AIAssistant({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chips, setChips] = useState<string[]>([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<string>("");
  const msgsRef = useRef<Msg[]>([]);
  const busyRef = useRef(false);

  useEffect(() => {
    msgsRef.current = msgs;
  }, [msgs]);

  const seedWelcome = useCallback(
    (withOpen: boolean) => {
      setMsgs((m) => (m.length === 0 ? [welcomeMsg(lang)] : m));
      setChips(suggestFor(lang, pathname));
      if (withOpen) setOpen(true);
      setHasGreeted(true);
    },
    [lang, pathname],
  );

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busyRef.current) return;
      busyRef.current = true;
      setLoading(true);
      setInput("");
      const history = msgsRef.current;
      setMsgs((m) => [...m, { role: "user", content: text }]);
      const system =
        lang === "ar"
          ? "أنت المرشد الذكي في موقع ناجح لتحضير الباكالوريا المغربية."
          : "Tu es le Tuteur IA du site Najih pour la préparation au Bac marocain.";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: contextRef.current || (pathname !== "/" ? pathname : ""),
            messages: [
              { role: "system", content: system },
              ...history,
              { role: "user", content: text },
            ],
          }),
        });
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            content:
              reply ??
              (lang === "ar" ? "⚠️ حدث خطأ، حاول مجدداً." : "⚠️ Erreur, réessaie."),
          },
        ]);
      } catch {
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            content: lang === "ar" ? "خطأ في الاتصال بالخادم." : "Erreur de connexion.",
          },
        ]);
      } finally {
        busyRef.current = false;
        setLoading(false);
      }
    },
    [lang, pathname],
  );

  useEffect(() => {
    if (pathname === "/") return;
    let tm: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!sessionStorage.getItem(STORAGE_HINT)) {
        tm = setTimeout(() => {
          seedWelcome(false);
          setOpen(true);
          try {
            sessionStorage.setItem(STORAGE_HINT, "1");
          } catch {}
        }, 2200);
      }
    } catch {}
    return () => {
      if (tm) clearTimeout(tm);
    };
  }, [pathname, seedWelcome]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<AssistOpenDetail>).detail ?? {};
      if (detail.context) contextRef.current = detail.context;
      if (!hasGreeted) seedWelcome(true);
      if (detail.prompt) void sendMessage(detail.prompt);
      else setOpen(true);
    };
    window.addEventListener("najih:assist", handler);
    return () => window.removeEventListener("najih:assist", handler);
  }, [hasGreeted, seedWelcome, sendMessage]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, msgs, loading]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!hasGreeted) seedWelcome(true);
          setOpen((v) => !v);
        }}
        aria-label={t(lang, "navAi")}
        className="ai-fab"
        dir="ltr"
      >
        <span className="ai-fab__icon">🦉</span>
        <span className="ai-fab__ping" aria-hidden />
      </button>

      {open && (
        <div className="ai-panel" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="ai-panel__head">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-lg shadow-[var(--shadow-md)]">
                🦉
              </span>
              <div className="leading-tight">
                <div className="font-bold text-[15px] text-[var(--b)]">{t(lang, "navAi")}</div>
                <div className="mono text-[11px] text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {lang === "ar" ? "متصل وجاهز للمساعدة" : "En ligne, prêt à aider"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid place-items-center w-8 h-8 rounded-lg text-[var(--l)] hover:bg-black/5"
              aria-label={lang === "ar" ? "إغلاق" : "Fermer"}
            >
              ✕
            </button>
          </div>

          <div className="ai-panel__body" data-lenis-prevent>
            <div className="space-y-3">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`ai-bubble ${m.role === "user" ? "ai-bubble--user" : "ai-bubble--bot"}`}
                >
                  {m.role === "assistant" ? (
                    <div className="ai-bubble__md">{renderMd(m.content)}</div>
                  ) : (
                    <div className="whitespace-pre-wrap text-[14px]">{m.content}</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="ai-bubble ai-bubble--bot">
                  <div className="typing-dot" />
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="ai-panel__foot">
            {chips.length > 0 && !loading && (
              <div className="flex flex-wrap gap-1.5 px-3 pt-2">
                {chips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => void sendMessage(c)}
                    className="ai-chip"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage(input);
              }}
              className="flex gap-2 p-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t(lang, "chatPlaceholder")}
                className="flex-1 min-w-0 p-3.5 border border-[var(--p)] bg-[var(--of)] text-[var(--b)] text-[14px] rounded-xl focus:outline-none focus:border-[var(--acc)] transition-colors"
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn btn-emerald btn-sm !px-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t(lang, "chatSend")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}