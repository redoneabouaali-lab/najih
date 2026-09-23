"use client";

import { useEffect } from "react";

type McTool = {
  registerTool?: (tool: {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    annotations?: Record<string, unknown>;
    execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
  }) => Promise<void> | void;
};

export function WebMCP() {
  useEffect(() => {
    const doc = document as unknown as { modelContext?: McTool };
    const nav = navigator as unknown as { modelContext?: McTool };
    const mc: McTool | undefined = doc.modelContext ?? nav.modelContext;
    if (!mc || typeof mc.registerTool !== "function") return;

    const registerTool = mc.registerTool;

    const register = async () => {
      await registerTool({
        name: "search_najih",
        description:
          "Search lessons, branches, subjects and downloadable resources (PDF) of the Najih Moroccan Bac platform.",
        inputSchema: {
          type: "object",
          properties: { q: { type: "string", description: "Search query" } },
          required: ["q"],
        },
        annotations: { readOnlyHint: true },
        async execute({ q }) {
          const qs = typeof q === "string" ? q : String(q ?? "");
          const res = await fetch(`/api/search?q=${encodeURIComponent(qs)}`);
          const text = await res.text();
          return { content: [{ type: "text", text }] };
        },
      });

      await registerTool({
        name: "ask_tutor",
        description:
          "Ask the Najih AI tutor a question about the Moroccan Baccalaureate (a lesson, a quiz question, or a national exam exercise). The tutor replies in Arabic, Darija or French with worked examples.",
        inputSchema: {
          type: "object",
          properties: { message: { type: "string", description: "The student's question" } },
          required: ["message"],
        },
        annotations: { readOnlyHint: true },
        async execute({ message }) {
          const text = typeof message === "string" ? message : String(message ?? "");
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{ role: "user", content: text }],
              context: window.location.pathname,
            }),
          });
          const data = await res.json();
          const answer =
            data?.choices?.[0]?.message?.content ?? data?.error ?? "No answer.";
          return { content: [{ type: "text", text: answer }] };
        },
      });
    };

    void register();
  }, []);

  return null;
}