export const FREE_UPLOADS = 3;
const KEY = "najih:uploads:v1";

function read(): number {
  try {
    return parseInt(localStorage.getItem(KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function uploadsRemaining(): number {
  return Math.max(0, FREE_UPLOADS - read());
}

export function consumeUpload(): number {
  const n = read() + 1;
  try {
    localStorage.setItem(KEY, String(n));
  } catch {}
  return n;
}

export function uploadsExhausted(): boolean {
  return uploadsRemaining() <= 0;
}