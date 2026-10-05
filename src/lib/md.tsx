import type { ReactNode } from "react";
import {
  splitMath,
  InlineMath,
  DisplayMath,
  type Seg,
} from "./math";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderText(text: string, keyBase: string): ReactNode[] {
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
          className="px-1.5 py-0.5 rounded-[var(--r-sm)] bg-[var(--surface-sunk)] text-[12px] font-mono"
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
          className="text-[var(--acc)] underline decoration-2 underline-offset-2 break-all"
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

function renderSegs(segs: Seg[], keyBase: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let i = 0;
  for (const seg of segs) {
    if (seg.type === "text") {
      if (seg.value === "") continue;
      parts.push(...renderText(seg.value, `${keyBase}-s${i++}`));
    } else if (seg.display) {
      parts.push(<DisplayMath key={`${keyBase}-m${i++}`} latex={seg.value} />);
    } else {
      parts.push(<InlineMath key={`${keyBase}-m${i++}`} latex={seg.value} />);
    }
  }
  return parts;
}

export function renderInlineMd(text: string, keyBase = "i"): ReactNode[] {
  return renderSegs(splitMath(text), keyBase);
}

function renderBodyLine(raw: string, keyBase: string): ReactNode[] {
  const segs = splitMath(raw);
  if (!segs.some((s) => s.type === "math" && s.display)) {
    return [
      <p key={keyBase} className="mb-2 leading-relaxed">
        {renderSegs(segs, keyBase)}
      </p>,
    ];
  }
  const out: ReactNode[] = [];
  let pending: Seg[] = [];
  let n = 0;
  const flush = () => {
    if (pending.length === 0) return;
    if (pending.some((s) => s.type === "text" && s.value.trim() !== "")) {
      out.push(
        <p key={`${keyBase}-p${n++}`} className="mb-2 leading-relaxed">
          {renderSegs(pending, `${keyBase}-q${n}`)}
        </p>,
      );
    }
    pending = [];
  };
  for (const seg of segs) {
    if (seg.type === "math" && seg.display) {
      flush();
      out.push(<DisplayMath key={`${keyBase}-m${n++}`} latex={seg.value} />);
    } else {
      pending.push(seg);
    }
  }
  flush();
  return out;
}

export function renderMd(text: string): ReactNode[] {
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
          <li key={`li${j}`} className="leading-relaxed">
            {renderInlineMd(it, `li${k}${j}`)}
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
          {renderInlineMd(line.replace(/^#{1,4}\s+/, ""), `h${k}`)}
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
    if (line !== "") out.push(...renderBodyLine(raw, `p${k++}`));
  }
  flush();
  return out;
}