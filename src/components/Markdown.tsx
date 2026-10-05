import { splitMath, InlineMath, DisplayMath, type Seg } from "@/lib/math";

function renderLinks(text: string, keyBase: string) {
  const nodes: (string | React.ReactNode)[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)\]]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(
        <a
          key={`${keyBase}-a${m.index}`}
          href={m[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--line)] underline break-all"
        >
          {renderLinks(m[1], `${keyBase}-r${m.index}`)}
        </a>,
      );
    } else {
      nodes.push(
        <a
          key={`${keyBase}-u${m.index}`}
          href={m[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--line)] underline break-all"
        >
          {m[3]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? nodes : text;
}

function renderBold(text: string, keyBase: string) {
  const parts: (string | React.ReactNode)[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last)
      parts.push(...renderLinks(text.slice(last, m.index), `${keyBase}-t${m.index}`));
    parts.push(
      <strong key={`${keyBase}-b${m.index}`}>
        {renderLinks(m[1], `${keyBase}-i${m.index}`)}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length)
    parts.push(...renderLinks(text.slice(last), `${keyBase}-e${last}`));
  return parts.length ? parts : text;
}

function renderSegs(segs: Seg[], keyBase: string) {
  const parts: React.ReactNode[] = [];
  let i = 0;
  for (const seg of segs) {
    if (seg.type === "text") {
      if (seg.value === "") continue;
      parts.push(
        <span key={`${keyBase}-s${i++}`}>
          {renderBold(seg.value, `${keyBase}-x${i}`)}
        </span>,
      );
    } else if (seg.display) {
      parts.push(<DisplayMath key={`${keyBase}-m${i++}`} latex={seg.value} />);
    } else {
      parts.push(<InlineMath key={`${keyBase}-m${i++}`} latex={seg.value} />);
    }
  }
  return parts;
}

function inline(text: string, keyBase = "i") {
  return renderSegs(splitMath(text), keyBase);
}

function renderPara(raw: string, keyBase: string) {
  const segs = splitMath(raw);
  if (!segs.some((s) => s.type === "math" && s.display)) {
    return (
      <p key={keyBase} className="my-2 leading-relaxed text-[var(--ink)]">
        {renderSegs(segs, keyBase)}
      </p>
    );
  }
  const out: React.ReactNode[] = [];
  let pending: Seg[] = [];
  let n = 0;
  const flush = () => {
    if (pending.length === 0) return;
    if (pending.some((s) => s.type === "text" && s.value.trim() !== "")) {
      out.push(
        <p key={`${keyBase}-p${n++}`} className="my-2 leading-relaxed text-[var(--ink)]">
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

function renderLines(content: string) {
  const lines = content.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (!list.length) return;
    out.push(
      <ul key={key} className="list-disc list-inside space-y-1 my-2 text-[var(--ink)]">
        {list.map((li, i) => (
          <li key={i}>{inline(li, `l${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((line, i) => {
    const key = `l${i}`;
    if (line.startsWith("### ")) {
      flushList(key + "a");
      out.push(
        <h3 key={key} className="text-lg font-medium text-[var(--ink)] mt-5 mb-2">
          {inline(line.slice(4), key + "h")}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      flushList(key + "a");
      out.push(
        <h2 key={key} className="text-xl font-medium text-[var(--ink)] mt-6 mb-2">
          {inline(line.slice(3), key + "h")}
        </h2>,
      );
    } else if (line.startsWith("- ")) {
      list.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList(key + "a");
    } else {
      flushList(key + "a");
      const para = renderPara(line, key);
      out.push(...(Array.isArray(para) ? para : [para]));
    }
  });
  flushList("last");
  return out;
}

export function Markdown({ content }: { content: string }) {
  return <div dir="auto">{renderLines(content)}</div>;
}