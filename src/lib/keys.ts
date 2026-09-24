export const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

let pool: string[] | null = null;
let cursor = 0;

function load(): string[] {
  if (pool) return pool;
  const raw =
    process.env.NVIDIA_API_KEYS?.trim() ||
    [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_2, process.env.NVIDIA_API_KEY_3]
      .filter(Boolean)
      .join(",") ||
    "";
  pool = raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return pool;
}

export function apiKeyCount(): number {
  return load().length;
}

export function nextApiKey(): string | null {
  const ks = load();
  if (ks.length === 0) return null;
  const key = ks[cursor % ks.length];
  cursor++;
  return key;
}

export function hasApiKeys(): boolean {
  return load().length > 0;
}