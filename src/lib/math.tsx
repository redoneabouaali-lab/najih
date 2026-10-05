import type { ReactNode } from "react";
import katex from "katex";

export function renderKatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
      output: "html",
    });
  } catch {
    return "";
  }
}

type TextSeg = { type: "text"; value: string };
type MathSeg = { type: "math"; value: string; display: boolean };
export type Seg = TextSeg | MathSeg;

const MATH_RE =
  /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$\n]+?)\$/g;

export function splitMath(text: string): Seg[] {
  const segs: Seg[] = [];
  let i = 0;
  let m: RegExpExecArray | null;
  MATH_RE.lastIndex = 0;
  while ((m = MATH_RE.exec(text)) !== null) {
    if (m.index > i) segs.push({ type: "text", value: text.slice(i, m.index) });
    const display = m[1] !== undefined || m[2] !== undefined;
    const latex = (m[1] ?? m[2] ?? m[3] ?? m[4] ?? "").trim();
    segs.push({ type: "math", value: latex, display });
    i = MATH_RE.lastIndex;
  }
  if (i < text.length) segs.push({ type: "text", value: text.slice(i) });
  return segs;
}

export function isDisplayOnly(line: string): boolean {
  const t = line.trim();
  if (t === "") return false;
  const segs = splitMath(t);
  if (segs.length === 0) return false;
  if (!segs.every((s) => s.type === "math")) return false;
  return segs.some((s) => s.type === "math" && s.display);
}

export function InlineMath({ latex }: { latex: string }): ReactNode {
  const html = renderKatex(latex, false);
  if (!html) return <code dir="ltr" className="font-mono">{latex}</code>;
  return (
    <span
      dir="ltr"
      className="inline-block align-middle math-inline"
      style={{ unicodeBidi: "isolate" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function DisplayMath({ latex }: { latex: string }): ReactNode {
  const html = renderKatex(latex, true);
  if (!html) {
    return (
      <div dir="ltr" className="my-4 text-center font-mono text-[var(--ink)]">
        {latex}
      </div>
    );
  }
  return (
    <div
      dir="ltr"
      className="my-4 flex justify-center math-display"
      style={{ unicodeBidi: "isolate" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}