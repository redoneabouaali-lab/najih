// Shared helpers for the multi-site content scrapers (najih).
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..", "..");
export const OUT_DIR = join(ROOT, "content", "sites");
const CACHE_DIR = join(OUT_DIR, ".cache");

export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (NajihBot content-aggregator)";

let lastHit = 0;

export async function polite(site, minMs = 450) {
  const wait = minMs - (Date.now() - lastHit);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  void site;
}

export function cacheFile(site, url) {
  return join(CACHE_DIR, site, createHash("sha1").update(url).digest("hex") + ".html");
}

export async function fetchText(site, url, { cache = true, timeoutMs = 30000 } = {}) {
  const cp = cacheFile(site, url);
  if (cache && existsSync(cp)) return readFileSync(cp, "utf8");
  let err;
  for (let i = 0; i < 4; i++) {
    try {
      await polite(site);
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/json,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ar,fr-FR;q=0.9,en;q=0.8",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
      lastHit = Date.now();
      if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status} ${url}`);
      const text = await res.text();
      if (res.ok && cache && text.length > 500) {
        mkdirSync(join(CACHE_DIR, site), { recursive: true });
        writeFileSync(cp, text, "utf8");
      }
      return text;
    } catch (e) {
      err = e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw err;
}

export async function fetchJson(site, url, opts) {
  return JSON.parse(await fetchText(site, url, opts));
}

export function skipCache(site, url) {
  try {
    const cp = cacheFile(site, url);
    if (existsSync(cp)) return readFileSync(cp, "utf8");
  } catch {
    /* ignore */
  }
  return null;
}

export function saveJson(name, data) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, name), JSON.stringify(data, null, 2), "utf8");
  console.log(`[written] content/sites/${name} (${(data.lessons?.length ?? 0)} lessons, ${(data.resources?.length ?? 0)} resources)`);
}

export const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#039": "'" };

export function decodeEntities(s) {
  return String(s ?? "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return code ? String.fromCodePoint(code) : "";
    }
    return ENT[e.toLowerCase()] ?? "";
  });
}

export function stripHtml(s) {
  return decodeEntities(
    String(s ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function htmlToText(s) {
  return decodeEntities(
    String(s ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n- ")
      .replace(/<\/tr>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function allHrefs(html) {
  const out = [];
  for (const m of String(html).matchAll(/href=["']([^"']+)["']/gi)) {
    out.push(decodeEntities(m[1]));
  }
  return out;
}

export function abs(url, base) {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

export function extractAnchors(html, select = () => true) {
  const out = [];
  for (const m of String(html).matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = decodeEntities(m[1]);
    const label = stripHtml(m[2]);
    if (select({ href, label })) out.push({ href, label });
  }
  return out;
}

export function slugify(s, max = 70) {
  const norm = String(s ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'‘`]+/g, "-")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, max)
    .replace(/-+$/, "");
  return norm || "item-" + createHash("sha1").update(String(s)).digest("hex").slice(0, 8);
}

export function stableSlug(seed, salt = "") {
  return createHash("sha1").update(String(seed) + salt).digest("hex").slice(0, 10);
}

export const YEAR_RE = /(19|20)\d{2}/;
export function parseYear(text) {
  const m = String(text ?? "").match(YEAR_RE);
  return m ? Number(m[0]) : null;
}

export function parseSession(text) {
  const t = String(text ?? "").toLowerCase();
  if (/(استدراكية|rattrapage)/.test(t)) return "rattrapage";
  if (/(عادية|normale|session normale|principal)/.test(t)) return "normal";
  return null;
}

const SUBJECT_TOKENS = [
  { key: "mathematiques", re: /(math[a-z]*|رياضيات|رياضية|mathemati|dérivation|limites|suites|intégral?)/i },
  { key: "physique-chimie", re: /(physique|chimie|فيزياء|كيمياء|pc\b|physique-chimie|phys)/i },
  { key: "svt", re: /(svt|أحياء|علوم الحياة|الأرض|biologie|vie-et-t|life)/i },
  { key: "philosophie", re: /(philosophie|فلسفة|philo)/i },
  { key: "francais", re: /(fran[çc]ais|فرنسية|francaise|french)/i },
  { key: "anglais", re: /(anglais|إنجليزية|english)/i },
  { key: "espagnol", re: /(espagnol|إسبانية|espan|spanish)/i },
  { key: "arabe", re: /(arabic|لغ[ةه] عربية|عربية|arabe\b|انشاء|أدب)/i },
  { key: "tarbia-islamia", re: /(islam|إسلامية|تربية إسلامية|مادة التربية)/i },
  { key: "histoire-geo", re: /(history|histoire|جغرافيا|اجتماعيات|تاريخ|geo\b|géograph)/i },
  { key: "economie", re: /(economi|اقتصاد|gestion|تدبير)/i },
  { key: "comptabilite", re: /(compta|محاسبه|محاسبة)/i },
  { key: "histoire-arts", re: /(art|فنون)/i },
  { key: "informatique", re: /(informatique|معلوميات)/i },
];

export function detectSubject(text) {
  const t = String(text ?? "");
  for (const { key, re } of SUBJECT_TOKENS) if (re.test(t)) return key;
  return null;
}

const BRANCH_TOKENS = [
  { key: "sm", re: /(رياضي|math|sm\b|sciences maths|sc\.? ?math)/i },
  { key: "svt", re: /(svt|علوم الحياة|sciences de la vie|biof)/i },
  { key: "sp", re: /(فيزيائي|physiqu|sp\b|sciences physiques|sc\.? ?phys|pc\b)/i },
  { key: "eco", re: /(اقتصاد|econom|gestion|compta|تدبير|محاسب)/i },
  { key: "lettres", re: /(آداب|lettres|histoire|علوم إنساني)/i },
  { key: "arts", re: /(فنون|arts)/i },
];

export function detectBranch(text) {
  const t = String(text ?? "");
  for (const { key, re } of BRANCH_TOKENS) if (re.test(t)) return key;
  return null;
}

export function isFreeBlocked(titleOrUrl) {
  const t = String(titleOrUrl ?? "");
  return /(premium|premium_content|للتحميل|pro|vip|gated)/i.test(t) && !/(\d{4}|national|امتحان)/.test(t);
}

export function allImages(html) {
  const out = [];
  for (const m of String(html).matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    out.push(decodeEntities(m[1]));
  }
  return out;
}

export function dedupeLines(s) {
  const seen = new Set();
  const lines = [];
  for (const ln of String(s ?? "").split("\n")) {
    const k = ln.trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    lines.push(ln.trim());
  }
  return lines.join("\n");
}

export function markdownLinks(items) {
  return items.map((x) => `- [${x.label || x.url}](${x.url})`).join("\n");
}