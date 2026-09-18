// Madarisy.com adapter — sitemap driven, PDFs served via /pdf-viewer/?pdf_url=...
import { fetchText, saveJson, stripHtml, htmlToText, abs, allHrefs, decodeEntities, detectSubject, detectBranch, parseYear, parseSession, slugify, stableSlug } from "../common.mjs";

const SITE = "madarisy";
const BASE = "https://madarisy.com";

function locs(text) {
  const out = [];
  for (const m of String(text).matchAll(/<loc[^>]*>([\s\S]*?)<\/loc>/gi)) out.push(m[1].trim());
  return out;
}

async function getSitemapIndex() {
  for (const url of ["https://madarisy.com/sitemap_index.xml", "https://madarisy.com/sitemap.xml"]) {
    try {
      const text = await fetchText(SITE, url, { cache: true });
      const maps = locs(text);
      if (maps.length) return maps;
    } catch {
      /* try next */
    }
  }
  throw new Error("madarisy: sitemap index not found");
}

function decodePdfUrl(pdf) {
  let d = pdf;
  for (let i = 0; i < 3; i++) {
    const t = decodeURIComponent(d);
    if (t === d) break;
    d = t;
  }
  return d;
}

export async function scrape({ limit = 0 } = {}) {
  console.log(`[${SITE}] fetching sitemap index...`);
  const maps = await getSitemapIndex();
  console.log(`[${SITE}] sitemaps:`, maps.filter((m) => /lesson|exam|devoir/.test(m)).join("\n           "));

  const wanted = maps.filter((m) => /sitemap-(lessons|exams|devoirs)/i.test(m));
  const pages = [];
  for (const sm of wanted) {
    const text = await fetchText(SITE, sm);
    const urls = locs(text);
    const twoBac = urls.filter((u) => /lycee\/2bac\//.test(u));
    console.log(`[${SITE}] ${sm.split("/").pop()}: ${urls.length} urls, ${twoBac.length} 2bac`);
    pages.push(...twoBac);
  }

  if (limit > 0 && pages.length > limit) {
    // balance: keep lesson/exam/devoir mix
    pages.length = limit;
  }
  console.log(`[${SITE}] target pages: ${pages.length}`);

  const lessons = [];
  const resources = [];
  const seen = new Set();
  let done = 0;

  const BATCH = 6;
  for (let i = 0; i < pages.length; i += BATCH) {
    const chunk = pages.slice(i, i + BATCH);
    await Promise.all(chunk.map((url) => parsePage(url)));
    done += chunk.length;
    console.log(`[${SITE}] ${done}/${pages.length}`);
  }

  function parsePage(url) {
    return fetchText(SITE, url).then((html) => {
      let title = stripHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
      if (!title) title = stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
      const hasCompta = /(comptab|المحاسبة)/i.test(url) || /(comptab|المحاسبة)/i.test(title);
      const subject = hasCompta ? "comptabilite" : detectSubject(title) ?? detectSubject(url);
      const branch = detectBranch(url) ?? detectBranch(title);

      const rawPdf = allHrefs(html).filter((h) => h.includes("/pdf-viewer/"));
      const pdfs = [];
      for (const h of rawPdf) {
        const q = decodePdfUrl(h);
        const pdfPath = (q.match(/pdf_url=([^&]+)/) || [])[1];
        if (!pdfPath) continue;
        const file = decodePdfUrl(pdfPath).replace(/^\/?/, "/");
        const real = /^https?:\/\//i.test(file)
          ? file
          : abs(joinPath(file), BASE);
        const label =
          stripHtml((html.match(new RegExp(`<a[^>]*href=["'][^"']*${escapeRe(h)}["'][^>]*>([\\s\\S]*?)<\\/a>`))?.[1] ?? "")) ||
          file.split("/").pop()?.replace(/\.pdf$/i, "") ||
          title;
        pdfs.push({ label, url: real, file });
      }
      const uniqPdfs = [];
      for (const p of pdfs) {
        if (!seen.has(p.url)) {
          seen.add(p.url);
          uniqPdfs.push(p);
        }
      }

      const year = parseYear(title);
      const session = parseSession(title);
      const chapterSlug = slugify(title) || stableSlug(title);

      if (/\/exams\//.test(url) || /(امتحان|national)/.test(title)) {
        for (const p of uniqPdfs) {
          resources.push({
            titleFr: `${title} — ${p.label}`,
            titleAr: `${title} — ${p.label}`,
            kind: "exam",
            url: p.url,
            year,
            session,
            subjectKey: subject,
            branchSlug: branch,
          });
        }
      } else if (/\/devoirs\//.test(url) || /(فروض|devoir)/.test(title)) {
        for (const p of uniqPdfs) {
          resources.push({
            titleFr: `${title} — ${p.label}`,
            titleAr: `${title} — ${p.label}`,
            kind: "exercise",
            url: p.url,
            year,
            session,
            subjectKey: subject,
            branchSlug: branch,
          });
        }
      } else {
        const content = extractContent(html);
        const filesMd = uniqPdfs.length
          ? "\n\n## Fichiers / ملفات\n" + uniqPdfs.map((p) => `- [${p.label}](${p.url})`).join("\n")
          : "";
        lessons.push({
          branchSlug: branch,
          subjectSlug: subject,
          chapterSlug,
          titleAr: title,
          titleFr: title,
          contentAr: content + filesMd,
          contentFr: content + filesMd,
        });
        for (const p of uniqPdfs) {
          resources.push({
            titleFr: `${title} — ${p.label}`,
            titleAr: `${title} — ${p.label}`,
            kind: "lesson",
            url: p.url,
            year: null,
            session: null,
            subjectKey: subject,
            branchSlug: branch,
          });
        }
      }
    });
  }

  return { site: SITE, lessons, resources };
}

function joinPath(p) {
  // collapse // and resolve ../ without URL API quirks
  return p.replace(/\/{2,}/g, "/").replace(/^\/+/, "/");
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractContent(html) {
  let body = html;
  const h1At = body.search(/<h1\b/i);
  if (h1At > -1) body = body.slice(h1At);
  const cut =
    body.search(/<!--[\s\S]*?comment/i) ??
    body.search(/<footer\b/i) ??
    body.search(/(mobile-menu|secondary-?menu|related-post|comments-area)/i) ??
    body.length;
  body = body.slice(0, cut);
  const m =
    body.match(/<div[^>]*class=["'][^"']*(entry-content|post-content|article-content|et_pb_post_content|elementor-widget-theme-post-content|single-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[2] ??
    body;
  return htmlToText(m).slice(0, 6000);
}

export const meta = { name: "Madarisy.com", site: SITE, base: BASE };