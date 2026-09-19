import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const SITES_DIR = "content/sites";

type SiteLesson = {
  branchSlug?: string | null;
  subjectSlug?: string | null;
  chapterSlug?: string | null;
  titleAr: string;
  titleFr: string;
  contentAr: string;
  contentFr: string;
};

type SiteResource = {
  titleFr: string;
  titleAr: string;
  kind: string;
  url: string;
  year?: number | null;
  session?: string | null;
  subjectKey?: string | null;
  branchSlug?: string | null;
};

const FALLBACK_BRANCH: Record<string, string> = {
  mathematiques: "sm",
  "physique-chimie": "sp",
  svt: "svt",
  economie: "eco",
  comptabilite: "eco",
  "histoire-arts": "arts",
  arabe: "lettres",
  francais: "lettres",
  anglais: "lettres",
  espagnol: "lettres",
  philosophie: "lettres",
  "tarbia-islamia": "lettres",
  "histoire-geo": "lettres",
};

const SUBJECT_NAMES: Record<string, [string, string]> = {
  mathematiques: ["الرياضيات", "Mathématiques"],
  "physique-chimie": ["الفيزياء والكيمياء", "Physique-Chimie"],
  svt: ["علوم الحياة والأرض", "Sciences de la Vie et de la Terre"],
  economie: ["الاقتصاد والتدبير", "Économie et Gestion"],
  comptabilite: ["المحاسبة", "Comptabilité"],
  "histoire-arts": ["تاريخ الفنون", "Histoire des Arts"],
  arabe: ["اللغة العربية", "Arabe"],
  francais: ["الفرنسية", "Français"],
  anglais: ["الإنجليزية", "Anglais"],
  espagnol: ["الإسبانية", "Espagnol"],
  philosophie: ["الفلسفة", "Philosophie"],
  "tarbia-islamia": ["التربية الإسلامية", "Éducation Islamique"],
  "histoire-geo": ["التاريخ والجغرافيا", "Histoire-Géographie"],
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function branchFor(r: { branchSlug?: string | null; subjectSlug?: string | null; subjectKey?: string | null }): string | undefined {
  if (r.branchSlug) return r.branchSlug;
  const subj = r.subjectSlug ?? r.subjectKey ?? "";
  return FALLBACK_BRANCH[subj];
}

function cleanTitle(t: string): string {
  const idx = t.indexOf(" — Madarisy.com");
  if (idx > 0) return t.slice(0, idx).trim();
  return t.trim();
}

const db = new Database(process.env.DATABASE_PATH ?? "dev.db");
db.pragma("busy_timeout = 10000");

function repairUrl(u: string): string {
  const m = u.match(/^(https?:\/\/[^/]+\/)(https?:(?:\/\/?)(?:www\.)?(?:dyrassa\.ma|madarisy\.com|doross\.ma)\/)(.*)$/i);
  if (m) return m[1] + m[3];
  return u;
}

const repair = db.transaction(() => {
  const rows = db
    .prepare("SELECT id, url FROM Resource")
    .all() as { id: string; url: string }[];
  let urlsFixed = 0;
  const updUrl = db.prepare("UPDATE Resource SET url = ? WHERE id = ?");
  for (const r of rows) {
    const fixed = repairUrl(r.url);
    if (fixed !== r.url) {
      updUrl.run(fixed, r.id);
      urlsFixed++;
    }
  }
  let contentFixed = 0;
  for (const col of ["contentAr", "contentFr"] as const) {
    const lessons = db.prepare(`SELECT id, "${col}" AS v FROM Lesson`).all() as { id: string; v: string }[];
    const upd = db.prepare(`UPDATE Lesson SET "${col}" = ? WHERE id = ?`);
    for (const l of lessons) {
      const fixed = repairUrl(l.v);
      if (fixed !== l.v) {
        upd.run(fixed, l.id);
        contentFixed++;
      }
    }
  }
  console.log(`[repair] resources checked=${rows.length} urls fixed=${urlsFixed} lesson contents fixed=${contentFixed}`);
});
repair();

const now = () => new Date().toISOString();
const id = () => randomUUID();

const existingUrls = new Set((db.prepare("SELECT url FROM Resource").all() as { url: string }[]).map((r) => r.url));

const REMOVED_FILE = path.join(SITES_DIR, "removed-urls.txt");
const removedUrls = new Set<string>();
try {
  for (const line of readFileSync(REMOVED_FILE, "utf8").split(/\r?\n/)) {
    const u = line.trim();
    if (u) removedUrls.add(u);
  }
  console.log(`[seed] loaded ${removedUrls.size} removed/denylisted urls from ${REMOVED_FILE}`);
} catch (e) {
  console.log(`[seed] no removed-urls denylist at ${REMOVED_FILE} (${(e as Error).message})`);
}

const stmt = {
  branchBySlug: db.prepare("SELECT id FROM Branch WHERE slug = ?"),
  subjectByBranchSlug: db.prepare("SELECT id FROM Subject WHERE branchId = ? AND slug = ?"),
  insertSubject: db.prepare(
    'INSERT INTO Subject (id, slug, nameAr, nameFr, icon, "order", branchId, createdAt) VALUES (?,?,?,?,?,0,?,?)'
  ),
  chapterBySubjectSlug: db.prepare("SELECT id FROM Chapter WHERE subjectId = ? AND slug = ?"),
  insertChapter: db.prepare(
    'INSERT INTO Chapter (id, slug, titleAr, titleFr, "order", subjectId, createdAt) VALUES (?,?,?,?,0,?,?)'
  ),
  lessonByChapter: db.prepare("SELECT id FROM Lesson WHERE chapterId = ?"),
  insertLesson: db.prepare(
    "INSERT INTO Lesson (id, contentAr, contentFr, chapterId, createdAt) VALUES (?,?,?,?,?)"
  ),
  insertResource: db.prepare(
    "INSERT INTO Resource (id, titleAr, titleFr, kind, url, year, session, subjectKey, branchId, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)"
  ),
};

const branchIdCache = new Map<string, string>();
const subjectIdCache = new Map<string, string>();
const usedSlugs = new Map<string, Set<string>>();

let lessonsCreated = 0;
let chaptersCreated = 0;
let subjectsCreated = 0;
let lessonsSkipped = 0;
let resourcesCreated = 0;
let resourcesSkipped = 0;

function resolveSubject(branchSlug: string, subjectSlug: string): string | undefined {
  let branchId = branchIdCache.get(branchSlug);
  if (!branchId) {
    const row = stmt.branchBySlug.get(branchSlug) as { id: string } | undefined;
    if (!row) return undefined;
    branchId = row.id;
    branchIdCache.set(branchSlug, branchId);
  }
  const key = `${branchId}::${subjectSlug}`;
  let subjectId = subjectIdCache.get(key);
  if (subjectId) return subjectId;
  const row = stmt.subjectByBranchSlug.get(branchId, subjectSlug) as { id: string } | undefined;
  if (row) {
    subjectId = row.id;
  } else {
    const [nameAr, nameFr] = SUBJECT_NAMES[subjectSlug] ?? [subjectSlug, subjectSlug];
    subjectId = id();
    stmt.insertSubject.run(subjectId, subjectSlug, nameAr, nameFr, "📘", branchId, now());
    subjectsCreated++;
  }
  subjectIdCache.set(key, subjectId);
  return subjectId;
}

function uniqueSlug(subjectId: string, base0: string): string {
  let seen = usedSlugs.get(subjectId);
  if (!seen) {
    seen = new Set();
    usedSlugs.set(subjectId, seen);
  }
  const base = base0 || "lecon";
  let slug = base;
  let i = 2;
  while (seen.has(slug)) slug = `${base}-${i++}`;
  seen.add(slug);
  return slug;
}

const seed = db.transaction(() => {
  const sites = readdirSync(SITES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = JSON.parse(readFileSync(path.join(SITES_DIR, f), "utf8")) as {
        site: string;
        lessons?: SiteLesson[];
        resources?: SiteResource[];
      };
      return raw;
    });

  for (const site of sites) {
    for (const l of site.lessons ?? []) {
      const subjectSlug = l.subjectSlug;
      if (!subjectSlug || subjectSlug === "null") {
        lessonsSkipped++;
        continue;
      }
      const branchSlug = branchFor(l);
      if (!branchSlug) {
        lessonsSkipped++;
        continue;
      }
      const subjectId = resolveSubject(branchSlug, subjectSlug);
      if (!subjectId) {
        lessonsSkipped++;
        continue;
      }

      const slug = uniqueSlug(subjectId, slugify(l.titleAr || l.titleFr));

      let chapterRow = stmt.chapterBySubjectSlug.get(subjectId, slug) as { id: string } | undefined;
      if (!chapterRow) {
        const chapterId = id();
        stmt.insertChapter.run(chapterId, slug, l.titleAr, l.titleFr || l.titleAr, subjectId, now());
        chapterRow = { id: chapterId };
        chaptersCreated++;
      }
      if (stmt.lessonByChapter.get(chapterRow.id)) {
        lessonsSkipped++;
        continue;
      }
      stmt.insertLesson.run(id(), l.contentAr, l.contentFr || l.contentAr, chapterRow.id, now());
      lessonsCreated++;
    }

    for (const r of site.resources ?? []) {
      const url = (r.url ?? "").trim();
      if (!url || existingUrls.has(url) || removedUrls.has(url)) {
        resourcesSkipped++;
        continue;
      }
      const branchSlug = branchFor(r);
      let branchId: string | undefined;
      if (branchSlug) {
        if (!branchIdCache.has(branchSlug)) {
          const row = stmt.branchBySlug.get(branchSlug) as { id: string } | undefined;
          if (row) branchIdCache.set(branchSlug, row.id);
        }
        branchId = branchIdCache.get(branchSlug);
      }
      stmt.insertResource.run(
        id(),
        cleanTitle(r.titleAr || r.titleFr),
        cleanTitle(r.titleFr || r.titleAr),
        r.kind,
        url,
        r.year ?? null,
        r.session ?? null,
        r.subjectKey ?? null,
        branchId ?? null,
        now()
      );
      existingUrls.add(url);
      resourcesCreated++;
    }
  }
});

seed();

const count = (t: string) => (db.prepare(`SELECT COUNT(*) c FROM "${t}"`).get() as { c: number }).c;
console.log(
  `Seed done. lessons=${lessonsCreated} chapters=${chaptersCreated} subjects=${subjectsCreated} resources=${resourcesCreated} skipped(lesson)=${lessonsSkipped} skipped(resource)=${resourcesSkipped}`
);
console.log(
  `DB totals: ${JSON.stringify({
    subtitle: count("Subject"),
    chapter: count("Chapter"),
    lesson: count("Lesson"),
    resource: count("Resource"),
  })}`
);