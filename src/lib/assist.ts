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