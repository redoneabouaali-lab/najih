// Moutamadriss.ma adapter — WP clone of moutamadris.ma (same hub structure).
// Lessons hub: /الثانية-باكالوريا/ ; forod hub: /فروض-الثانية-باك/ ; exams hub: /examens-2bac/
import { basename } from "node:path";
import { detectSubject, detectBranch, stripHtml, decodeEntities, abs, allHrefs, htmlToText, parseYear, parseSession, slugify, stableSlug, saveJson, fetchText } from "../common.mjs";

const SITE = "moutamadriss";
const BASE = "https://moutamadriss.ma";

const HUB_LESSONS = "https://moutamadriss.ma/الثانية-باكالوريا/";
const HUB_LESSONS_INTL = "https://moutamadriss.ma/الثانية-باك-خيار-فرنسية-مسلك-دولي/";
const HUB_FOROD = "https://moutamadriss.ma/فروض-الثانية-باك/";
const HUB_EXAMS = "https://moutamadriss.ma/examens-2bac/";

const NAV_SKIP = new Set([
  `${BASE}/`, `${BASE}/about/`, `${BASE}/contact/`, `${BASE}/privacy-policy/`, `${BASE}/terms-of-use/`,
  `${BASE}/forod/`, `${BASE}/examens/`, `${BASE}/cours/`, `${BASE}/bac-libre/`, `${BASE}/concours/`,
  `${BASE}/orientation/`, `${BASE}/alwadifa/`, `${BASE}/ofppt/`, `${BASE}/prof/`, `${BASE}/students/`,
  `${BASE}/universite/`, `${BASE}/international/`, `${BASE}/examens-1bac/`, `${BASE}/examens-6primaire/`,
  `${BASE}/devoirs/`, `${BASE}/convocation/`, `${BASE}/date-examens-maroc/`,
]);

function pathname(u) {
  try {
    return new URL(u).pathname;
  } catch {
    return "";
  }
}
function lastSegment(u) {
  return decodeURIComponent(pathname(u).split("/").filter(Boolean).pop() || "");
}
function absUrl(href) {
  try {
    return new URL(href, BASE).href;
  } catch {
    return null;
  }
}
function internalPages(html) {
  const out = [];
  for (const m of String(html).matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)) {
    const href = decodeEntities(m[1]);
    const absu = absUrl(href);
    if (!absu || !absu.startsWith(BASE)) continue;
    const p = pathname(absu);
    if (!p || p === "/" || p.includes("/wp-") || p.includes("/wp-content/")) continue;
    out.push({ href: absu, label: stripHtml(m[2]) });
  }
  return out;
}
function pdfAnchors(html) {
  const out = [];
  for (const m of String(html).matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)) {
    const absu = absUrl(decodeEntities(m[1]));
    if (!absu || !/\.pdf($|\?)/i.test(absu)) continue;
    out.push({ href: absu, label: stripHtml(m[2]) });
  }
  return out;
}
const seen = new Set();
function uniq(list) {
  const out = [];
  for (const it of list) {
    if (seen.has(it.href)) continue;
    seen.add(it.href);
    out.push(it);
  }
  return out;
}

const SUBJ_MAP = [
  ["الرياضيات", "mathematiques", "الرياضيات"],
  ["الفيزياء-والكيمياء", "physique-chimie", "الفيزياء والكيمياء"],
  ["علوم-الحياة-والارض", "svt", "علوم الحياة والأرض"],
  ["علوم-الحياة-والأرض", "svt", "علوم الحياة والأرض"],
  ["الفلسفة", "philosophie", "الفلسفة"],
  ["اللغة-الفرنسية", "francais", "اللغة الفرنسية"],
  ["اللغة-العربية", "arabe", "اللغة العربية"],
  ["اللغة-الانجليزية", "anglais", "اللغة الانجليزية"],
  ["اللغة-الإنجليزية", "anglais", "اللغة الانجليزية"],
  ["اللغة-الاسبانية", "espagnol", "اللغة الاسبانية"],
  ["التاريخ-والجغرافيا", "histoire-geo", "التاريخ والجغرافيا"],
  ["التربية-الاسلامية", "tarbia-islamia", "التربية الاسلامية"],
  ["التربية-الإسلامية", "tarbia-islamia", "التربية الاسلامية"],
  ["الفقه-والاصول", "tarbia-islamia", "الفقه والأصول"],
  ["الفقه-والأصول", "tarbia-islamia", "الفقه والأصول"],
  ["علوم-اللغة", "arabe", "علوم اللغة"],
  ["التفسير-والحديث", "tarbia-islamia", "التفسير والحديث"],
  ["الأدب", "arabe", "الأدب"],
  ["الادب", "arabe", "الأدب"],
  ["الإقتصاد-العام-والإحصاء", "economie", "الإقتصاد العام والإحصاء"],
  ["الاقتصاد-العام-والاحصاء", "economie", "الإقتصاد العام والإحصاء"],
  ["الاقتصاد-والتنظيم-الاداري", "economie", "الاقتصاد والتنظيم الاداري"],
  ["المحاسبة-والرياضيات-المالية", "comptabilite", "المحاسبة والرياضيات المالية"],
  ["العلوم-النباتية-والحيوانية", "svt", "العلوم النباتية والحيوانية"],
];
function matchSubject(slugLike) {
  const s = String(slugLike).replace(/_/g, "-");
  for (const [tok, key, label] of SUBJ_MAP) {
    if (s.includes(tok.replace(/\s/g, "-"))) return { key, label };
  }
  return null;
}
function detectSubjectAny(...texts) {
  for (const t of texts) {
    const k = detectSubject(t);
    if (k) return k;
    const k2 = detectSubject(lastSegment(t) ? lastSegment(t) : t);
    if (k2) return k2;
  }
  return null;
}

const BRANCH_TEXT = [
  [/علوم\s*رياضية|علوم-رياضية|رياضية/, "sm"],
  [/علوم\s*فيزيائية|علوم-فيزيائية|فيزيائية/, "sp"],
  [/علوم\s*الحياة\s*وال\s*أرض|الحياة-والأرض|الحيوية/, "svt"],
  [/علوم\s*زراعية|زراعية/, "svt"],
  [/علوم\s*اقتصادية|علوم\s*إقتصادية|اقتصادية|اقتصاد|تدبير/, "eco"],
  [/آداب|اداب|أدبي|انسانية/, "lettres"],
  [/دولي|فرنسية/, null],
  [/علمية/, null],
  [/شرعية/, null],
  [/ميكانيكية|كهربائية/, null],
];
function branchFromText(text) {
  for (const [re, key] of BRANCH_TEXT) {
    if (re.test(text)) return key;
  }
  return null;
}

function sessionFromText(text) {
  const m = String(text).match(/الدورة\s+(?:ال)?([^\s،.]+)/);
  if (!m) return null;
  const s = m[1];
  if (/لأولى|الاولى/.test(s)) return "normal";
  if (/ثانية/.test(s)) return "rattrapage";
  if (/استدراك/.test(s)) return "rattrapage";
  return null;
}

function sectionEvents(html) {
  const events = [];
  let m;
  const hre = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi;
  while ((m = hre.exec(html)) !== null) {
    const text = stripHtml(m[2]);
    if (text) events.push({ index: m.index, level: Number(m[1]), text });
  }
  const are = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/g;
  while ((m = are.exec(html)) !== null) {
    const absu = absUrl(decodeEntities(m[1]));
    if (!absu || !/\.pdf($|\?)/i.test(absu)) continue;
    events.push({ index: m.index, pdf: { href: absu, label: stripHtml(m[2]) } });
  }
  events.sort((a, b) => a.index - b.index);
  return events;
}

function pdfYearName(pdf) {
  const name = decodeURIComponent(basename(new URL(pdf).pathname));
  const ym = name.match(/20\d{2}/);
  return ym ? Number(ym[0]) : null;
}

function extractEntryContent(html) {
  let s = html.indexOf('<div class="entry-content" itemprop="text">');
  if (s < 0) s = html.indexOf('<div class="entry-content">');
  if (s < 0) s = html.indexOf("class=\"entry-content\"");
  if (s < 0) return null;
  const openEnd = html.indexOf(">", s);
  if (openEnd < 0) return null;
  let depth = 0;
  let i = openEnd + 1;
  while (i < html.length) {
    const nextOpen = html.indexOf("<div", i);
    const nextClose = html.indexOf("</div>", i);
    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 4;
    } else {
      if (depth === 0) return html.substring(openEnd + 1, nextClose);
      depth--;
      i = nextClose + 6;
    }
  }
  return null;
}

export async function scrape({ limit = 0 } = {}) {
  const lessons = [];
  const resources = [];
  const GURLS = new Set();
  let count = 0;
  const pushRes = (r) => {
    if (GURLS.has(r.url)) return;
    GURLS.add(r.url);
    resources.push(r);
    count++;
  };

  const subjOfPage = (href, label) => matchSubject(lastSegment(href)) ?? matchSubject(label) ?? detectSubjectAny(href, label);

  // ---- lessons ----
  try {
    console.log(`[${SITE}] lessons hub...`);
    const hubs = uniq(internalPages(await fetchText(SITE, HUB_LESSONS))).filter(
      (l) => lastSegment(l.href).includes("-الثانية-باك") || l.href.includes("خيار-فرنسية") || l.href.includes("علوم-رياضية") || l.href.includes("علوم-فيزيائية")
    ).filter((l) => !/^فروض-|^امتحانات-|تاريخ-اجتياز|convocation|cadres|الأطر|استدعاء/.test(lastSegment(l.href)));
    for (const h of [...hubs].slice(0, limit && limit < hubs.length ? limit : hubs.length)) {
      try {
        let pages = uniq(internalPages(await fetchText(SITE, h.href)));
        const subj = subjOfPage(h.href, h.label);
        for (const l of pages) {
          const seg = lastSegment(l.href);
          if (!/-الثانية-باك/.test(seg)) continue;
          if (/^فروض-|^امتحانات-|^دروس-|^ملخصات-|تاريخ-اجتياز/.test(seg)) continue;
          const html = await fetchText(SITE, l.href);
          const inner = extractEntryContent(html);
          if (!inner) continue;
          const title = stripHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "") || seg;
          const files = [];
          let branchLabel = branchFromText(seg) ?? null;
          for (const ev of sectionEvents(html)) {
            if (ev.level && ev.level >= 3) {
              const b = branchFromText(ev.text);
              if (b) branchLabel = b;
            }
            if (ev.pdf) files.push({ ...ev.pdf, branch: branchLabel });
          }
          if (files.length === 0) continue;
          const hasText = /<p[^>]*>[^<]{60,}/.test(inner);
          const content = hasText ? htmlToText(inner).slice(0, 6000) : "";
          const intro = (html.match(/<meta name="description" content="([^"]+)"/) || [])[1]
            ? decodeEntities(html.match(/<meta name="description" content="([^"]+)"/)[1]).trim()
            : "";
          const filesMd = files.map((f) => `- [${f.label || basename(f.href).replace(/\.pdf$/i, "")}](${f.href})`).join("\n");
          const body = [intro, content, filesMd].filter(Boolean).join("\n\n") || ("## " + title + "\n\nملف/ملفات الدرس PDF مرفقة أدناه.");
          lessons.push({
            branchSlug: branchFromText(seg) ?? null,
            subjectSlug: subj?.key ?? null,
            chapterSlug: slugify(seg) || stableSlug(title, subj?.key),
            titleAr: title,
            titleFr: title,
            contentAr: body,
            contentFr: body,
          });
          const year = pdfYearName(files[0].href);
          for (const f of files) {
            pushRes({
              titleFr: `${title} — ${f.label || basename(f.href).replace(/\.pdf$/i, "")}`,
              titleAr: `${title} — ${f.label || basename(f.href).replace(/\.pdf$/i, "")}`,
              kind: "lesson",
              url: f.href,
              year,
              session: null,
              subjectKey: subj?.key ?? null,
              branchSlug: f.branch ?? null,
            });
          }
        }
        console.log(`[${SITE}] lessons hub ${lastSegment(h.href)} -> done (${lessons.length})`);
      } catch (e) {
        console.log(`[${SITE}] lessons hub skip:`, e.message);
      }
    }
    console.log(`[${SITE}] lessons done: ${lessons.length}, files: ${count}`);
  } catch (e) {
    console.log(`[${SITE}] lessons FAIL:`, e.message);
  }

  // ---- forod (devoirs) ----
  try {
    console.log(`[${SITE}] forod hub...`);
    const subs = uniq(internalPages(await fetchText(SITE, HUB_FOROD))).filter(
      (l) => /فروض-/.test(lastSegment(l.href)) && !/تاريخ|مواعيد|baaalor|باكalوريا/.test(lastSegment(l.href))
    );
    for (const subj of subs) {
      const html = await fetchText(SITE, subj.href);
      const subjectSlug = subjOfPage(subj.href, subj.label)?.key ?? null;
      let secBranch = null, secSession = null;
      for (const ev of sectionEvents(html)) {
        if (ev.level) {
          if (ev.level >= 3) {
            const b = branchFromText(ev.text);
            if (b) secBranch = b;
          }
          const s = sessionFromText(ev.text);
          if (s) secSession = s;
        } else {
          pushRes({
            titleFr: (ev.pdf.label || basename(ev.pdf.href).replace(/\.pdf$/i, "")),
            titleAr: (ev.pdf.label || basename(ev.pdf.href).replace(/\.pdf$/i, "")),
            kind: "exercise",
            url: ev.pdf.href,
            year: pdfYearName(ev.pdf.href),
            session: secSession ?? null,
            subjectKey: subjectSlug,
            branchSlug: secBranch ?? null,
          });
        }
      }
      console.log(`[${SITE}] forod ${lastSegment(subj.href)} (${count})`);
    }
  } catch (e) {
    console.log(`[${SITE}] forod FAIL:`, e.message);
  }

  // ---- exams (nationals) ----
  try {
    console.log(`[${SITE}] exams hub...`);
    const subs = uniq(internalPages(await fetchText(SITE, HUB_EXAMS))).filter((l) => /امتحانات-وطنية-/.test(lastSegment(l.href)));
    for (const subj of subs) {
      const html = await fetchText(SITE, subj.href);
      const subjectSlug = subjOfPage(subj.href, subj.label)?.key ?? null;
      let secBranch = null, secSession = null;
      for (const ev of sectionEvents(html)) {
        if (ev.level) {
          if (ev.level >= 3) {
            const b = branchFromText(ev.text);
            if (b) secBranch = b;
          }
          const s = sessionFromText(ev.text);
          if (s) secSession = s;
        } else {
          const year = pdfYearName(ev.pdf.href);
          pushRes({
            titleFr: (ev.pdf.label || basename(ev.pdf.href).replace(/\.pdf$/i, "")),
            titleAr: (ev.pdf.label || basename(ev.pdf.href).replace(/\.pdf$/i, "")),
            kind: "exam",
            url: ev.pdf.href,
            year,
            session: secSession ?? null,
            subjectKey: subjectSlug,
            branchSlug: secBranch ?? null,
          });
        }
      }
      console.log(`[${SITE}] exams ${lastSegment(subj.href)} (${count})`);
    }
  } catch (e) {
    console.log(`[${SITE}] exams FAIL:`, e.message);
  }

  return { site: SITE, lessons, resources };
}

export const meta = { name: "Moutamadriss.ma", site: SITE, base: BASE };