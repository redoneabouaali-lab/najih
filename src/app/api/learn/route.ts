import { NextResponse } from "next/server";
import { logFeedback } from "@/lib/learning";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { question?: string; good?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const q = (body.question ?? "").toString().trim();
  if (!q) return NextResponse.json({ ok: false }, { status: 400 });
  logFeedback(q, body.good === true);
  return NextResponse.json({ ok: true });
}