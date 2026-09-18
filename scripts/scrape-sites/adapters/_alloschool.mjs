// AlloSchool.com adapter — category -> course -> element crawl (free content).
// robots.txt: Crawl-delay: 10 → we enforce a slow polite pace.
import { fetchText, saveJson, stripHtml, htmlToText, abs, allHrefs, extractAnchors, detectSubject, parseYear, parseSession, slugify, stableSlug, polite } from "../common.mjs";

const SITE = "alloschool";
const BASE = "https://www.alloschool.com";

const CATS = [
  ["sciences-mathematiques", "mathematical-sciences", "sm"],
  ["sciences-experimentales", "experimental-sciences", "svt"],
  ["sciences-physiques", "sciences", "sp"],
  ["sciences-technologies-electriques", "electrical-science-and-technology", null],
  ["sciences-technologies-mecaniques", "mechanical-science-and-technology", null],
  ["economie-gestion", "economics-and-management", "eco"],
  ["lettres-sciences-humaines", "letters-and-human-sciences", "lettres"],
];

const TWO_BAC_RE = /(2[ée]me-?(annee)?-?bac|2-bac|2eme-annee|al?ttani(t|ya)|thaniat|2[\u0662]?a|[_-]2[_-]|deuxieme-annee|2nde-annee)/i;
const ONE_BAC_RE = /(1er-?bac|1-bac|alaola|premi[èe]re-annee|tronc-commun|1[ée]re)/i;

const COURSE_SUBJECT = [
  [/alriadhiat|mathematiques/, "mathematiques"],
  [/alfiziaa|physique-et-chimie|physique/, "physique-chimie"],
  [/svt|vie-et-de-la-terre|alhiaa-oalardh|sciences-de-la-vie/, "svt"],
  [/alflsfa|flsf|philosoph/, "philosophie"],
  [/francais/, "francais"],
  [/anglais/, "anglais"],
  [/alarbia|arab/, "arabe"],
  [/altrbia-alislamia|islam/, "tarbia-islamia"],
  [/ijtmaaiat|histoire|geograph|tarih/, "histoire-geo"],
  [/iqti|economi|gestion|tadbir|comptab/, "economie"],
];
function courseSubject(slug, title) {
  for (const [re, key] of COURSE_SUBJECT) {
    if (re.test(slug)) return key;
  }
  return detectSubject(title) ?? null;
}

export async function scrape({ limit = 0 } = {}) {
  const lessons = [];
  const resources = [];
  const seenElem = new Set();
  let courseCount = 0;
  const perCatLimit = limit > 0 ? Math.max(2, Math.ceil(limit / CATS.length)) : 0;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const [label, catSlug, branchSlug] of CATS) {
    console.log(`[${SITE}] category ${catSlug}...`);
    const courseLinks = new Map();
    let catCourses = 0;
    for (let page = 1; page <= 3; page++) {
      const url = `${BASE}/category/${catSlug}?page=${page}`;
      let html;
      try {
        html = await fetchText(SITE, url);
      } catch {
        break;
      }
      let found = 0;
      for (const h of allHrefs(html)) {
        const m = h.match(/\/course\/([a-z0-9-]+)/);
        if (!m) continue;
        const full = h.includes("http") ? h : `${BASE}/course/${m[1]}`;
        courseLinks.set(m[1], full);
        found++;
      }
      if (found === 0 || page === 1 && found < 10) break;
    }
    console.log(`[${SITE}] ${catSlug}: ${courseLinks.size} courses`);

    for (const [slug, url] of courseLinks) {
      if (ONE_BAC_RE.test(slug) && !TWO_BAC_RE.test(slug)) continue; // 1bac / tronc only
      if (perCatLimit > 0 && catCourses >= perCatLimit) break;
      catCourses++;
      courseCount++;
      const branch = branchSlug ?? null;
      let subject = courseSubject(slug, slug);
      console.log(`[${SITE}] course ${slug} (${courseCount})`);
      let html;
      try {
        html = await fetchText(SITE, url);
      } catch {
        continue;
      }
      const titleBase = stripHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "") || slug;
      if (!subject) subject = courseSubject(slug, titleBase);

      const elems = [...new Set(allHrefs(html).filter((h) => /\/element\/\d+/.test(h)))].slice(0, 60);
      console.log(`[${SITE}]   elements: ${elems.length}`);
      const BATCH = 3;
      for (let i = 0; i < elems.length; i += BATCH) {
        await Promise.all(elems.slice(i, i + BATCH).map((e) => parseElement(e, subject, branch, titleBase)));
        await sleep(0);
      }
    }
  }

  async function parseElement(elemUrl, subject, branch, courseTitle) {
    if (seenElem.has(elemUrl)) return;
    seenElem.add(elemUrl);
    await polite(SITE, 1100);
    let html;
    try {
      html = await fetchText(SITE, elemUrl);
    } catch {
      return;
    }
    const title = stripHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
    if (!title) return;
    try {
      const contentHtml = html.match(/<div[^>]*class=["'][^"']*(element-content|entry-content|section-content|content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[2] ?? html;
      const text = htmlToText(contentHtml).slice(0, 12000);
      const pdfs = [];
      for (const m of String(html).matchAll(/<a[^>]+href=["']([^"']+\.pdf[^"']*)["'][^>]*>(.*?)<\/a>/gi)) {
        pdfs.push({ href: abs(m[1], BASE), label: stripHtml(m[2]) });
      }
      const hasRealText = /[<\u0600-\u06FF\u00C0-\u024F]{3,}/.test(text) || text.length > 200;
      if (text.length >= 120) {
        lessons.push({
          branchSlug: branch,
          subjectSlug: subject,
          chapterSlug: slugify(title) || stableSlug(title, subject),
          titleAr: title,
          titleFr: title,
          contentAr: text + (pdfs.length ? "\n\n## Fichiers\n" + pdfs.map((p) => `- [${p.label || p.href.split("/").pop()}](${p.href})`).join("\n") : ""),
          contentFr: text + (pdfs.length ? "\n\n## Fichiers\n" + pdfs.map((p) => `- [${p.label || p.href.split("/").pop()}](${p.href})`).join("\n") : ""),
        });
      }
      for (const p of pdfs) {
        resources.push({
          titleFr: `${title} — ${p.label || p.href.split("/").pop()}`,
          titleAr: `${title} — ${p.label || p.href.split("/").pop()}`,
          kind: "lesson",
          url: p.href,
          year: null,
          session: null,
          subjectKey: subject,
          branchSlug: branch,
        });
      }
    } catch (e) {
      console.log(`  [dbg parse-err] ${elemUrl}: ${e.stack}`);
    }
  }

  return { site: SITE, lessons, resources };
}

export const meta = { name: "AlloSchool", site: SITE, base: BASE };