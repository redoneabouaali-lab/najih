const WINDOW_MS = 24 * 3600 * 1000;
const FLAT_FEE = 350;

const Q = () => {
  const n = Number(process.env.SESSION_TOKEN_QUOTA);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 40000;
};

type Acc = { used: number; resetAt: number };

const store = new Map<string, Acc>();

export function quotaRemaining(sessionId: string): number {
  if (!sessionId) return Number.MAX_SAFE_INTEGER;
  const now = Date.now();
  const a = store.get(sessionId);
  if (!a || now > a.resetAt) return Q();
  return Math.max(0, Q() - a.used);
}

/** Returns remaining tokens after charging. If over the budget it clamps to 0. */
export function chargeTokens(sessionId: string, usageTokens?: number): number {
  if (!sessionId) return Number.MAX_SAFE_INTEGER;
  const now = Date.now();
  const q = Q();
  let a = store.get(sessionId);
  if (!a || now > a.resetAt) a = { used: 0, resetAt: now + WINDOW_MS };
  a.used += Math.max(1, usageTokens || FLAT_FEE);
  a.used = Math.min(a.used, q + 50000);
  store.set(sessionId, a);
  return Math.max(0, q - a.used);
}

export function quotaUsed(sessionId: string): number {
  if (!sessionId) return 0;
  const now = Date.now();
  const a = store.get(sessionId);
  if (!a || now > a.resetAt) return 0;
  return a.used;
}

export function quotaLimit(): number {
  return Q();
}