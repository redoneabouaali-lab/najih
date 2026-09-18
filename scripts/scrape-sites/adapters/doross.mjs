// Doross.ma adapter — WordPress REST API.
// categories: دروس|فروض|تمارين|امتحانات - <subject> - الثانية-ثانوي
import { fetchJson, fetchText, saveJson, htmlToText, stripHtml, abs, allHrefs, allImages, dedupeLines, detectSubject, parseYear, parseSession, slugify, stableSlug } from "../common.mjs";

const SITE = "doross";
const BASE = "https://doross.ma";
const API = `${BASE}/index.php?rest_route=`;
function safeDecode(s) {
  try {
    return decodeURIComponent(String(s));
  } catch {
    return String(s).replace(/%[0-9a-f]{2}/gi, "");
  }
}

const PREFIX_TO_KIND = {
  "دروس": "lesson",
  "درس": "lesson",
  "فروض": "exercise",
  "تمرين": "exercise",
  "تمارين": "exercise",
  "امتحانات": "exam",
  "امتحان": "exam",
  "تصحيح": "exercise",
};

function kindOf(catSlug, title) {
  const t = (catSlug || "").toLowerCase() + " " + (title || "").toLowerCase();
  for (const [k, v] of Object.entries(PREFIX_TO_KIND)) {
    if (t.includes(k)) return v;
  }
  return "lesson";
}

async function allPages(endpoint) {
  const out = [];
  let page = 1;
  for (;;) {
    const arr = await fetchJson(SITE, `${endpoint}&page=${page}`);
    if (!Array.isArray(arr) || arr.length === 0) break;
    out.push(...arr);
    if (arr.length < 100) break;
    page++;
  }
  return out;
}

export async function scrape({ limit = 0 } = {}) {
  console.log(`[${SITE}] fetching categories...`);
  const cats = await allPages(`${API}/wp/v2/categories&per_page=100`);
  console.log(`[${SITE}] total categories: ${cats.length}`);

  const twoBac = cats.filter((c) => safeDecode(c.slug).includes("الثانية-ثانوي"));
  console.log(`[${SITE}] 2bac categories: ${twoBac.length}`);
  for (const c of twoBac) console.log(`   [${c.id}] ${c.name} (${c.count})`);

  const lessons = [];
  const resources = [];
  const seenUrls = new Set();

  const BATCH = 4;
  let processed = 0;
  for (let i = 0; i < twoBac.length; i += BATCH) {
    await Promise.all(twoBac.slice(i, i + BATCH).map((c) => crawlCat(c)));
    processed += Math.min(BATCH, twoBac.length - i);
    console.log(`[${SITE}] categories done ${processed}/${twoBac.length}`);
    if (limit > 0 && resources.length + lessons.length >= limit) break;
  }

  async function crawlCat(cat) {
    const catName = safeDecode(cat.name);
    let subjectSlug = detectSubject(catName) ?? detectSubject(cat.slug);
    const posts = await allPages(`${API}/wp/v2/posts&categories=${cat.id}&per_page=100&_fields=id,link,title,slug,content`);
    console.log(`[${SITE}] cat ${catName}: ${posts.length} posts`);
    for (const post of posts) {
      const title = stripHtml(post.title?.rendered ?? post.slug ?? "");
      let subj = subjectSlug ?? detectSubject(title);
      if (!subj) continue;
      const kind = kindOf(cat.slug, title);
      const html = post.content?.rendered ?? "";
      const pdfLinks = allHrefs(html).filter((h) => /\.pdf$/i.test(h) || /drive\.google\.com|docs\.google\.com/.test(h));
      const links = pdfLinks.map((h) => abs(h, BASE));
      const imgs = [...new Set(allImages(html).map((s) => abs(s, BASE)))];
      const year = parseYear(title);
      const session = parseSession(title);
      const text = dedupeLines(htmlToText(html)).slice(0, 6000);

      if (kind === "lesson") {
        const imgMd = imgs.length ? "\n\n" + imgs.map((u) => `![${u.split("/").pop()}](${u})`).join("\n") : "";
        const fileMd = links.length ? "\n\n## ملفات\n" + links.map((u) => `- [${u.split("/").pop()}](${u})`).join("\n") : "";
        lessons.push({
          branchSlug: null,
          subjectSlug: subj,
          chapterSlug: slugify(post.slug) || stableSlug(title, subj),
          titleAr: title,
          titleFr: title,
          contentAr: text + imgMd + fileMd,
          contentFr: text + imgMd + fileMd,
        });
        for (const u of links) {
          if (seenUrls.has(u)) continue;
          seenUrls.add(u);
          resources.push({ titleFr: title, titleAr: title, kind: "lesson", url: u, year, session, subjectKey: subj, branchSlug: null });
        }
      } else {
        const imgRes = imgs.length ? imgs : links;
        for (const u of imgRes) {
          if (seenUrls.has(u)) continue;
          seenUrls.add(u);
          resources.push({ titleFr: title, titleAr: title, kind, url: u, year, session, subjectKey: subj, branchSlug: null });
        }
      }
    }
  }

  return { site: SITE, lessons, resources };
}

export const meta = { name: "Doross.ma", site: SITE, base: BASE };