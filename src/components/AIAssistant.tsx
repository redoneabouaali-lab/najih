"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { t, type Lang } from "@/lib/lang";
import { renderMd } from "@/lib/md";
import { subscribePageContext, subscribeSeedChat, type AssistOpenDetail } from "@/lib/assist";
import { prepareAttachment, type Attach } from "@/lib/attach";
import { AttachButton } from "@/components/AttachButton";
import { AiFeedback } from "@/components/AiFeedback";
import { uploadsExhausted, uploadsRemaining, consumeUpload } from "@/lib/uploads";
import { sessionId } from "@/lib/session";

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
  const [uploading, setUploading] = useState(false);
  const [uploadLeft, setUploadLeft] = useState<number>(() => uploadsRemaining());
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<string>("");
  const msgsRef = useRef<Msg[]>([]);
  const busyRef = useRef(false);

  useEffect(() => {
    msgsRef.current = msgs;
  }, [msgs]);

  useEffect(() => {
    return subscribePageContext((c) => {
      contextRef.current = c ?? "";
    });
  }, []);

  useEffect(() => {
    return subscribeSeedChat((seed) => {
      if (!seed || seed.length === 0) return;
      setMsgs((m) => [...m, ...seed]);
      setChips(suggestFor(lang, pathname));
      setOpen(true);
    });
  }, [lang, pathname]);

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
    async (raw: string, attachments?: Attach[]) => {
      const text = raw.trim();
      if ((!text && !attachments?.length) || busyRef.current) return;
      busyRef.current = true;
      setLoading(true);
      setInput("");
      const history = msgsRef.current;
      setMsgs((m) => [...m, { role: "user", content: text || (lang === "ar" ? "📎 مرفق" : "📎 pièce jointe") }]);
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
            sessionId: sessionId(),
            messages: [
              { role: "system", content: system },
              ...history,
              { role: "user", content: text },
            ],
            attachments: attachments ?? [],
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

  const handleAttach = useCallback(
    async (f: File) => {
      if (busyRef.current || uploading) return;
      if (uploadsExhausted()) {
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            content:
              lang === "ar"
                ? "أنت استنفدت تحميلاتك المجانية الثلاثة 📎. جرّب زر «فهم هذا الملف» الأزرق في صفحات الدروس والتمارين، أو اسأل المرشد مباشرة عن الدرس، أو أعد رفع صورة بعد حذف السجل (إعدادات المتصفح)."
                : "Tu as épuisé tes 3 téléversements gratuits 📎. Utilise le bouton « Comprendre ce fichier » sur les pages de cours/exercices, ou interroge directement le tuteur sur la leçon.",
          },
        ]);
        return;
      }
      setUploading(true);
      setInput("");
      try {
        const attach = await prepareAttachment(f);
        if (attach.type === "pdf" && attach.text.trim().length < 80) {
          setMsgs((m) => [
            ...m,
            {
              role: "assistant",
              content:
                lang === "ar"
                  ? "😕 يبدو أن هذا الملف غير قابل للقراءة (صفحة ممسوحة أو محمية). جرّب رفع صورة واضحة للسؤال بدلاً منه."
                  : "😕 Ce fichier semble illisible (page scannée ou protégée). Essaie de joindre une photo nette de la question.",
            },
          ]);
          return;
        }
        consumeUpload();
        setUploadLeft(uploadsRemaining());
        const prompt =
          input.trim() ||
          (lang === "ar"
            ? "اقرأ هذا الملف واشرحه لي خطوة بخطوة"
            : "Lis ce fichier et explique-le-moi étape par étape");
        await sendMessage(prompt, [attach]);
      } catch {
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            content:
              lang === "ar"
                ? "تعذّر قراءة المرفق، حاول صورة أخرى أو ملف PDF أصغر."
                : "Impossible de lire la pièce jointe, essaie une autre photo ou un PDF plus léger.",
          },
        ]);
      } finally {
        setUploading(false);
      }
    },
    [input, lang, uploading, sendMessage],
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
      if (detail.prompt) {
        setOpen(true);
        void sendMessage(detail.prompt);
      } else if (detail.open) {
        setOpen(true);
      } else {
        setOpen(true);
      }
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
              <span className="ai-avatar">
                🦉
                <span className="ai-avatar__ring" aria-hidden />
              </span>
              <div className="leading-tight">
                <div className="font-bold text-[15px] text-[var(--b)]">{t(lang, "navAi")}</div>
                <div className="mono text-[11px] text-emerald-600 flex items-center gap-1">
                  <span className="ai-live" aria-hidden />
                  {lang === "ar" ? "متصل وجاهز للمساعدة" : "En ligne, prêt à aider"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ai-panel__close"
              aria-label={lang === "ar" ? "إغلاق" : "Fermer"}
            >
              ✕
            </button>
          </div>

          <div className="ai-panel__body" data-lenis-prevent>
            <div className="space-y-1">
              {msgs.map((m, i) => {
                let lastQ = "";
                for (let k = i - 1; k >= 0; k--) {
                  if (msgs[k].role === "user") {
                    lastQ = msgs[k].content;
                    break;
                  }
                }
                const isAss = m.role === "assistant";
                return (
                  <div
                    key={i}
                    className={`ai-msg ${isAss ? "ai-row--ass" : "ai-row--user"}`}
                    style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                  >
                    {isAss && <span className="ai-avatar ai-avatar--mini">🦉</span>}
                    <div className={`ai-bubble ${isAss ? "ai-bubble--bot" : "ai-bubble--user"}`}>
                      {isAss ? (
                        <>
                          <div className="ai-bubble__md">{renderMd(m.content)}</div>
                          <AiFeedback question={lastQ} lang={lang === "ar" ? "ar" : "fr"} />
                        </>
                      ) : (
                        <div className="whitespace-pre-wrap text-[14px]">{m.content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="ai-msg ai-row--ass">
                  <span className="ai-avatar ai-avatar--mini">🦉</span>
                  <div className="ai-bubble ai-bubble--bot ai-think">
                    <span className="ai-think__dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="ai-think__label">
                      {lang === "ar" ? "أحلّل سؤالك… انتظر الإجابة لحظة ✨" : "J'analyse ta question… un instant ✨"}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="ai-panel__foot">
            {chips.length > 0 && !loading && (
              <div className="flex flex-wrap gap-1.5 px-3 pt-2">
                <button
                  key="quiz"
                  type="button"
                  onClick={() =>
                    void sendMessage(
                      lang === "ar"
                        ? "اختبرني في ما أدرسه الآن 😊 (اختبار تفاعلي بأسئلة متدرجة)"
                        : "Interroge-moi sur ce que j'étudie maintenant 😊 (quiz interactif progressif)",
                    )
                  }
                  className="ai-chip ai-chip--quiz"
                >
                  🎯 {lang === "ar" ? "اختبرني الآن" : "Interroge-moi"}
                </button>
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
              {...{
                toolname: "ask_tutor",
                tooldescription:
                  "Ask the Najih AI tutor (المرشد الذكي) a question about the Moroccan Bac: explain a lesson, a quiz question or a national exam exercise with worked examples, in Arabic/Darija or French.",
              }}
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage(input);
              }}
              className="flex gap-2 p-3 items-center"
            >
              <AttachButton lang={lang === "ar" ? "ar" : "fr"} onPick={(f) => void handleAttach(f)} disabled={loading || uploading} remaining={uploadLeft ?? undefined} />
              {uploading && (
                <span className="mono text-[11px] text-[var(--l)] whitespace-nowrap">
                  {lang === "ar" ? "جارٍ تحضير الملف…" : "Préparation du fichier…"}
                </span>
              )}
              <input
                ref={inputRef}
                name="message"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t(lang, "chatPlaceholder")}
                {...{
                  toolparamdescription:
                    "The student's question about the Baccalaureate (lessons, subjects, exercises, national exams), in Arabic, Darija or French.",
                }}
                className="ai-input"
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                title={t(lang, "chatSend")}
                aria-label={t(lang, "chatSend")}
                className="ai-send"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="ai-send__icon">
                  <path d="M12 19V5" />
                  <path d="m6 11 6-6 6 6" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}