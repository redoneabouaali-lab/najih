import { NextResponse } from "next/server";
import { extractPdfText } from "@/lib/pdfExtract";
import {
  analyzeInstruction,
  buildAnalyzeUser,
  parseAnalyzeJson,
  type AnalyzeInput,
  type AnalyzeResult,
} from "@/lib/analyze";

export const runtime = "nodejs";

const MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";
const VISION_MODEL = "meta/llama-3.2-90b-vision-instruct";

const FETCH_TIMEOUT = 12_000;
const MODEL_TIMEOUT = 45_000;
const MAX_CONTENT = 16_000;

const hits = new Map<string, number[]>();
const LIMIT = 25;
const WINDOW = 3_600_000;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "local";
}

function allow(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (arr.length >= LIMIT) return false;
  arr.push(now);
  hits.set(ip, arr);
  return true;
}

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|bmp)(\?|#|$)/i;

function looksLikeImage(url: string): boolean {
  return IMAGE_EXT.test(url.split("#")[0]);
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
        Referer: "https://najih.abouaaliahmed.com/",
        Accept: "*/*",
      },
    });
  } finally {
    clearTimeout(tm);
  }
}

type Source =
  | { type: "text"; text: string }
  | { type: "image"; url: string }
  | { type: "none"; fallback: "upload" };

async function resolveSource(input: AnalyzeInput): Promise<Source> {
  if (input.content?.trim()) return { type: "text", text: input.content.trim() };

  const url = input.resourceUrl?.trim();
  if (!url) return { type: "none", fallback: "upload" };

  if (looksLikeImage(url)) return { type: "image", url };

  let res: Response;
  try {
    res = await fetchWithTimeout(url, FETCH_TIMEOUT);
  } catch {
    return { type: "none", fallback: "upload" };
  }
  if (!res.ok) return { type: "none", fallback: "upload" };

  const ctype = (res.headers.get("content-type") ?? "").toLowerCase();
  const finalUrl = res.url || url;

  if (looksLikeImage(finalUrl) || ctype.startsWith("image/")) {
    return { type: "image", url: finalUrl };
  }
  if (ctype.includes("pdf") || finalUrl.toLowerCase().split("#")[0].endsWith(".pdf")) {
    try {
      const buf = await res.arrayBuffer();
      const text = await extractPdfText(buf, 5);
      if (text.length < 120) return { type: "none", fallback: "upload" };
      return { type: "text", text };
    } catch {
      return { type: "none", fallback: "upload" };
    }
  }
  return { type: "none", fallback: "upload" };
}

async function callModel(
  key: string,
  model: string,
  messages: { role: string; content: unknown }[],
  maxTokens: number,
): Promise<string> {
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), MODEL_TIMEOUT);
  try {
    let res: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.3,
        }),
        signal: ctrl.signal,
      });
      if (res.ok || (res.status !== 429 && res.status < 500)) break;
      const retryAfter = Number(res.headers.get("retry-after")) || 1.5 * (attempt + 1);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
    }
    if (!res) throw new Error("provider unreachable after retries");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || err?.detail || `HTTP ${res.status}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content) throw new Error("empty completion");
    return content;
  } finally {
    clearTimeout(tm);
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!allow(ip)) {
    return NextResponse.json(
      { ok: false, fallback: "retry", raw: "حدّ الطلبات مؤقتاً، حاول بعد قليل." },
      { status: 429 },
    );
  }

  let body: AnalyzeInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, fallback: "retry" }, { status: 400 });
  }

  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, fallback: "retry" }, { status: 500 });
  }

  const lang = body.lang === "fr" ? "fr" : "ar";
  const instruction = analyzeInstruction(body.kindHint, lang);

  try {
    const source = await resolveSource(body);

    let raw: string;
    if (source.type === "image") {
      raw = await callModel(
        key,
        VISION_MODEL,
        [
          { role: "system", content: instruction },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: body.title ? `العنوان: «${body.title}»` : "اقرأ محتوى الصورة التالية وحلّله.",
              },
              { type: "image_url", image_url: { url: source.url } },
            ],
          },
        ],
        2000,
      );
    } else if (source.type === "text") {
      const text = source.text.length > MAX_CONTENT ? source.text.slice(0, MAX_CONTENT) : source.text;
      raw = await callModel(
        key,
        MODEL,
        [
          { role: "system", content: instruction },
          { role: "user", content: buildAnalyzeUser(text, body.title) },
        ],
        1800,
      );
    } else {
      return NextResponse.json({
        ok: false,
        fallback: "upload",
        title: body.title,
      } satisfies AnalyzeResult);
    }

    const parsed = parseAnalyzeJson(raw);
    if (parsed) {
      return NextResponse.json({
        ok: true,
        ...parsed,
        title: parsed.title || body.title,
      } satisfies AnalyzeResult);
    }

    return NextResponse.json({
      ok: false,
      fallback: "retry",
      title: body.title,
      raw: raw.slice(0, 1200),
    } satisfies AnalyzeResult);
  } catch (e) {
    const msg = (e as Error).message || "unknown";
    const timeout = msg.includes("abort") || msg.includes("timed out") || msg.includes("AbortError");
    return NextResponse.json({
      ok: false,
      fallback: "retry",
      title: body.title,
      raw: timeout ? "timeout" : msg,
    } satisfies AnalyzeResult);
  }
}