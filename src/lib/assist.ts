export type AssistOpenDetail = {
  prompt?: string;
  context?: string;
  open?: boolean;
};

export function openAssistant(detail: AssistOpenDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AssistOpenDetail>("najih:assist", { detail }),
  );
}

type PageContextListener = (context: string | null) => void;

let pageContext: string | null = null;
const contextListeners = new Set<PageContextListener>();

export function setPageContext(context: string | null) {
  pageContext = context;
  contextListeners.forEach((l) => l(context));
}

export function getPageContext(): string | null {
  return pageContext;
}

export function subscribePageContext(listener: PageContextListener): () => void {
  contextListeners.add(listener);
  listener(pageContext);
  return () => {
    contextListeners.delete(listener);
  };
}

export type SeedMsg = { role: "user" | "assistant"; content: string };

let seedMsgs: SeedMsg[] = [];
const seedListeners = new Set<(m: SeedMsg[]) => void>();

export function seedChat(messages: SeedMsg[]) {
  seedMsgs = messages;
  seedListeners.forEach((l) => l(messages));
}

export function getSeed(): SeedMsg[] {
  return seedMsgs;
}

export function subscribeSeedChat(listener: (m: SeedMsg[]) => void): () => void {
  seedListeners.add(listener);
  listener(seedMsgs);
  return () => {
    seedListeners.delete(listener);
  };
}