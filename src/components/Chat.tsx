"use client";

import { useState, useRef, useEffect } from "react";
import { t, type Lang } from "@/lib/lang";
import { renderMd } from "@/lib/md";
import { prepareAttachment } from "@/lib/attach";
import { AttachButton } from "@/components/AttachButton";
import { AiFeedback } from "@/components/AiFeedback";
import { uploadsExhausted, uploadsRemaining, consumeUpload } from "@/lib/uploads";
import { sessionId } from "@/lib/session";

type Msg = { role: "user" | "assistant"; content: string };

export function Chat({ lang }: { lang: Lang }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadLeft, setUploadLeft] = useState<number>(() => uploadsRemaining());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const pushAssistant = (content: string) =>
    setMsgs((m) => [...m, { role: "assistant", content }]);

  const send = async (raw?: string, attachments?: unknown[]) => {
    const text = (raw ?? input).trim();
    if ((!text && !attachments?.length) || loading) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: text || "📎 مرفق" }]);
    setLoading(true);
    try {
      const system =
        lang === "ar"
          ? "أنت المرشد الذكي في موقع ناجح لتحضير الباكالوريا المغربية."
          : "Tu es le Tuteur IA du site Najih pour la préparation au Bac marocain.";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: system },
            ...msgs.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
          attachments: attachments ?? [],
          sessionId: sessionId(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg =
          data?.error || (lang === "ar" ? "عتذر، حدث خطأ." : "Désolé, une erreur est survenue.");
        pushAssistant(
          lang === "ar"
            ? `⚠️ ${msg}`
            : `⚠️ ${msg}`,
        );
        return;
      }
      const reply =
        data.choices?.[0]?.message?.content ??
        (lang === "ar" ? "عتذر، حدث خطأ." : "Désolé, une erreur est survenue.");
      pushAssistant(reply);
    } catch {
      pushAssistant(
        lang === "ar" ? "خطأ في الاتصال بالخادم." : "Erreur de connexion au serveur.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAttach = async (f: File) => {
    if (loading || uploading) return;
    if (uploadsExhausted()) {
      pushAssistant(
        lang === "ar"
          ? "أنت استنفدت تحميلاتك المجانية الثلاثة 📎. جرّب زر «فهم هذا الملف» في صفحات الدروس، أو اسأل المرشد مباشرة."
          : "Tu as épuisé tes 3 téléversements gratuits 📎. Utilise le bouton « Comprendre ce fichier » ou interroge directement le tuteur.",
      );
      return;
    }
    setUploading(true);
    try {
      const attach = await prepareAttachment(f);
      if (attach.type === "pdf" && attach.text.trim().length < 80) {
        pushAssistant(
          lang === "ar"
            ? "😕 هذا الملف غير قابل للقراءة (مسح ضوئي أو محمي). جرّب رفع صورة واضحة."
            : "😕 Ce fichier est illisible (scanné ou protégé). Essaie une photo nette.",
        );
        return;
      }
      consumeUpload();
      setUploadLeft(uploadsRemaining());
      await send(
        input.trim() ||
          (lang === "ar" ? "اقرأ هذا الملف واشرحه لي خطوة بخطوة" : "Lis ce fichier et explique-le étape par étape"),
        [attach],
      );
    } catch {
      pushAssistant(
        lang === "ar" ? "تعذّر قراءة المرفق، حاول مرة أخرى." : "Impossible de lire la pièce jointe.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 flex flex-col min-h-[78vh]">
      <div className="mb-8">
        <div className="label mb-4">🦉 {t(lang, "chatTitle")}</div>
        <h1 className="sec-title text-[var(--b)]">{t(lang, "chatTitle")}</h1>
        <p className="sec-sub mt-3">{t(lang, "chatSub")}</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-[55vh] pr-1" data-lenis-prevent>
        {msgs.length === 0 && (
          <p className="sec-sub text-[var(--l)]">{t(lang, "chatExample")}</p>
        )}
        {msgs.map((m, i) => {
          let lastQ = "";
          for (let k = i - 1; k >= 0; k--) {
            if (msgs[k].role === "user") {
              lastQ = msgs[k].content;
              break;
            }
          }
          return (
            <div
              key={i}
              dir={lang === "ar" ? "rtl" : "ltr"}
              className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto w-full"}`}
            >
              <div className="mono text-[10px] uppercase tracking-[.14em] text-[var(--l)] mb-1">
                {m.role === "user"
                  ? lang === "ar" ? "أنت" : "Vous"
                  : lang === "ar" ? "المرشد" : "Tuteur"}
              </div>
              <div
                className={`p-4 rounded-2xl ${m.role === "user" ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-[var(--shadow-md)]" : "panel p-5 text-[var(--b)]"}`}
                dir="auto"
              >
                {m.role === "assistant" ? (
                  <>
                    <div className="text-[15px]">{renderMd(m.content)}</div>
                    <AiFeedback question={lastQ} lang={lang} />
                  </>
                ) : (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <p className="mono text-xs text-[var(--p)]">{t(lang, "chatThinking")}</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 mt-2 items-center"
      >
        <AttachButton lang={lang} onPick={(f) => void handleAttach(f)} disabled={loading || uploading} remaining={uploadLeft ?? undefined} />
        {uploading && (
          <span className="mono text-[11px] text-[var(--l)] whitespace-nowrap">
            {lang === "ar" ? "جارٍ تحضير الملف…" : "Préparation du fichier…"}
          </span>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(lang, "chatPlaceholder")}
          className="flex-1 p-4 border border-[var(--p)] bg-[var(--w)] text-[var(--b)] text-base rounded-2xl focus:outline-none focus:border-[var(--acc)] transition-colors shadow-sm"
          dir={lang === "ar" ? "rtl" : "ltr"}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn-emerald !px-6 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t(lang, "chatSend")}
        </button>
      </form>
    </div>
  );
}