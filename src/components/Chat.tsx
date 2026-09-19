"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { t, type Lang } from "@/lib/lang";

type Msg = { role: "user" | "assistant"; content: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const esc = escapeHtml(text);
  const parts: ReactNode[] = [];
  const re =
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|(https?:\/\/[^\s<]+)/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(esc))) {
    if (m.index > last)
      parts.push(<span key={`${keyBase}-t${i++}`}>{esc.slice(last, m.index)}</span>);
    if (m[1] && m[2]) {
      parts.push(
        <a
          key={`${keyBase}-l${i++}`}
          href={m[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--acc)] font-semibold underline decoration-2 underline-offset-2"
        >
          {m[1]}
        </a>,
      );
    } else if (m[3]) {
      parts.push(
        <strong key={`${keyBase}-b${i++}`} className="font-bold">
          {m[3]}
        </strong>,
      );
    } else if (m[4]) {
      parts.push(
        <code
          key={`${keyBase}-c${i++}`}
          className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-[12px] font-mono"
        >
          {m[4]}
        </code>,
      );
    } else if (m[5]) {
      parts.push(
        <a
          key={`${keyBase}-u${i++}`}
          href={m[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-[var(--acc)] underline decoration-2 underline-offset-2"
        >
          {m[5]}
        </a>,
      );
    }
    last = re.lastIndex;
  }
  if (last < esc.length)
    parts.push(<span key={`${keyBase}-e${i++}`}>{esc.slice(last)}</span>);
  return parts;
}

function renderMd(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;
  let k = 0;
  const flush = () => {
    if (!list) return;
    const List = list.type === "ul" ? "ul" : "ol";
    out.push(
      <List
        key={`list-${k++}`}
        className={`${list.type === "ul" ? "list-disc" : "list-decimal"} pl-5 space-y-1 my-2`}
      >
        {list.items.map((it, j) => (
          <li key={`li-${j}`} className="leading-relaxed">
            {renderInline(it, `li${k}${j}`)}
          </li>
        ))}
      </List>,
    );
    list = null;
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (/^#{1,4}\s+/.test(line)) {
      flush();
      out.push(
        <p key={`h-${k++}`} className="font-bold text-[15px] my-2">
          {renderInline(line.replace(/^#{1,4}\s+/, ""), `h${k}`)}
        </p>,
      );
      continue;
    }
    const ul = line.match(/^[-*•]\s+(.*)/);
    const ol = line.match(/^\d+[.)]\s+(.*)/);
    if (ul || ol) {
      if (!list || list.type !== (ul ? "ul" : "ol")) {
        flush();
        list = { type: ul ? "ul" : "ol", items: [] };
      }
      list.items.push((ul ? ul[1] : ol![1]) ?? "");
      continue;
    }
    flush();
    if (line !== "") out.push(<p key={`p-${k++}`} className="mb-2 leading-relaxed">{renderInline(raw, `p${k}`)}</p>);
  }
  flush();
  return out;
}

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

      <div className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-[55vh] pr-1">
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