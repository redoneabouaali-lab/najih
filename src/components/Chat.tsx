"use client";

import { useState, useRef, useEffect } from "react";
import { t, type Lang } from "@/lib/lang";
import { renderMd } from "@/lib/md";

type Msg = { role: "user" | "assistant"; content: string };

export function Chat({ lang }: { lang: Lang }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const pushAssistant = (content: string) =>
    setMsgs((m) => [...m, { role: "assistant", content }]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: text }]);
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
        {msgs.map((m, i) => (
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
                <div className="text-[15px]">{renderMd(m.content)}</div>
              ) : (
                <div className="whitespace-pre-wrap">{m.content}</div>
              )}
            </div>
          </div>
        ))}
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
        className="flex gap-2 mt-2"
      >
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