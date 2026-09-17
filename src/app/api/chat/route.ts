import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "AI provider key not configured" },
      { status: 500 },
    );
  }

  const res = await fetch(
    "https://integrate.api.nvidia.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta/llama-3.3-70b-instruct",
        messages,
        max_tokens: 1024,
        temperature: 0.4,
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: err?.error?.message || "AI provider error" },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}