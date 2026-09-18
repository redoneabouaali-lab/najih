// Dyrassa.ma adapter — custom PHP app: level.php?level=2bac&content={lessons,forod,exams}
// subject.php?level=2bac&subject=<code>&content=<type> lists direct PDFs under /uploads/.
import { fetchText, saveJson, stripHtml, abs, allHrefs, detectSubject, parseYear, parseSession, slugify, stableSlug } from "../common.mjs";

const SITE = "dyrassa";
const BASE = "https://www.dyrassa.ma";

const SUBJECT_CODES = {
  math: "mathematiques",
  matha: "mathematiques",
  pc: "physique-chimie",
  pca: "physique-chimie",
  svt: "svt",
  svta: "svt",
  islam: "tarbia-islamia",
  arabic: "arabe",
  french: "francais",
  english: "anglais",
  philo: "philosophie",
  history: "histoire-geo",
  eco: "economie",
  si: null,
};

async function subjectList(level, content) {
  const url = `${BASE}/level.php?level=${level}&content=${content}`;
  const html = await fetchText(SITE, url);
  const subs = new Set();
  for (const h of allHrefs(html)) {
    const m = h.match(/subject\.php\?level=[^&]+&subject=([^&]+)/);
    if (m) subs.add(decodeURIComponent(m[1]));
  }
  return [...subs];
}

function parseFiles(html) {
  const files = [];
  for (const h of allHrefs(html)) {
    const clean = h.replace(/&amp;/g, "&");
    if (!/\.pdf$/i.test(clean)) continue;
    const file = clean.startsWith("/") ? clean : "/" + clean.split("/").filter(Boolean).join("/");
    const url = abs(file, BASE);
    const base = file.split("/").pop().replace(/\.pdf$/i, "").replace(/^\d+_/, "").replace(/_/g, " ");
    const title = stripHtml(base) || url;
    const year = parseYear(title);
    const session = parseSession(title);
    files.push({ file: file.toLowerCase(), base, title, url, year, session });
  }
  const uniq = new Map();
  for (const f of files) if (!uniq.has(f.url)) uniq.set(f.url, f);
  return [...uniq.values()];
}

const TYPE_WORD_re = /^(cours|course|resume|r[ée]sum[ée]|le[çc]on|serie|s[ée]rie|exercices?|tamarin|application|activit[ée]|sujet|corrig[ée]|concours|bilan|synth[èe]se|examen|national)/i;
const BAC_re = /(^|[-_ ])(2|1)?bac(calaur)?([-_ ]|$)/i;

function lessonStem(file) {
  let base = file.replace(/\.pdf$/i, "").replace(/^.*\//, "").replace(/^\d+_?/, "").replace(/\s*\([^)]*\)/g, "");
  const parts = base.split(/[-_]+/).filter(Boolean);
  const stem = [];
  for (const p of parts) {
    if (/\d{4}/.test(p)) break;
    if (BAC_re.test(p)) break;
    if (TYPE_WORD_re.test(p)) {
      if (stem.length === 0) continue;
      break;
    }
    stem.push(p);
  }
  return stem.join(" ").trim() || base.trim();
}

const EX_MAX_re = /(examen|national|امتحان|استدراك)/i;

export async function scrape({ level = "2bac", limit = 0 } = {}) {
  const lessons = [];
  const resources = [];
  const lessonMap = new Map();
  const GLOBAL_SEEN = new Set();
  let done = 0;

  function pushResource(r) {
    if (GLOBAL_SEEN.has(r.url)) return;
    GLOBAL_SEEN.add(r.url);
    resources.push(r);
  }

  for (const content of ["lessons", "forod"]) {
    console.log(`[${SITE}] listing subjects for ${level}/${content}...`);
    const subs = await subjectList(level, content);
    console.log(`[${SITE}] ${content}: subjects ${subs.join(",")}`);
    const BATCH = 5;
    for (let i = 0; i < subs.length; i += BATCH) {
      await Promise.all(subs.slice(i, i + BATCH).map((code) => parseSubject(content, code)));
      done += Math.min(BATCH, subs.length - i);
      console.log(`[${SITE}] ${content} ${done}/${subs.length}`);
    }
  }

  async function parseSubject(content, code) {
    const subjectSlug = SUBJECT_CODES[code] ?? detectSubject(code);
    if (!subjectSlug) {
      console.log(`[${SITE}] skip subject code: ${code}`);
      return;
    }
    const url = `${BASE}/subject.php?level=${level}&subject=${code}&content=${content}`;
    const html = await fetchText(SITE, url);
    const files = parseFiles(html);
    console.log(`[${SITE}] ${content}/${code}: ${files.length} pdfs`);

    for (const f of files) {
      if (content === "lessons" && EX_MAX_re.test(f.title)) {
        pushResource({
          titleFr: f.title,
          titleAr: f.title,
          kind: "exam",
          url: f.url,
          year: f.year,
          session: f.session,
          subjectKey: subjectSlug,
          branchSlug: null,
        });
        continue;
      }
      if (content === "lessons") {
        const stem = lessonStem(f.file);
        const key = `${subjectSlug}::${stem.toLowerCase()}`;
        const cl = slugify(stem) || stableSlug(stem, subjectSlug);
        let rec = lessonMap.get(key);
        if (!rec) {
          rec = {
            branchSlug: null,
            subjectSlug,
            chapterSlug: cl,
            titleAr: stem,
            titleFr: stem,
            contentAr: `## ${stem}\n\nملف بصيغة PDF يتعلق بالدرس:\n`,
            contentFr: `## ${stem}\n\nLignes directrices du cours (fichier PDF) :\n`,
            files: [],
          };
          lessonMap.set(key, rec);
        }
        rec.files.push(f);
      } else if (content === "forod") {
        pushResource({
          titleFr: f.title,
          titleAr: f.title,
          kind: "exercise",
          url: f.url,
          year: f.year,
          session: f.session,
          subjectKey: subjectSlug,
          branchSlug: null,
        });
      }
    }
  }

  for (const rec of lessonMap.values()) {
    rec.contentAr += rec.files.map((f) => `- [${f.title}](${f.url})`).join("\n");
    rec.contentFr += rec.files.map((f) => `- [${f.title}](${f.url})`).join("\n");
    for (const f of rec.files) {
      pushResource({
        titleFr: f.title,
        titleAr: f.title,
        kind: "lesson",
        url: f.url,
        year: f.year,
        session: f.session,
        subjectKey: rec.subjectSlug,
        branchSlug: null,
      });
    }
    lessons.push({
      branchSlug: rec.branchSlug,
      subjectSlug: rec.subjectSlug,
      chapterSlug: rec.chapterSlug,
      titleAr: rec.titleAr,
      titleFr: rec.titleFr,
      contentAr: rec.contentAr,
      contentFr: rec.contentFr,
    });
  }

  return { site: SITE, lessons, resources };
}

export const meta = { name: "Dyrassa.ma", site: SITE, base: BASE };