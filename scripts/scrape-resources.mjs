import { writeFileSync } from "node:fs";

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (NajihBot/1.0; content-aggregator)" },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}
async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (NajihBot/1.0; content-aggregator)" },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const BRANCH_MAP = { svt: "svt", sp: "sp", sm: "sm", anglais: "lettres", french: "lettres", philosophie: "lettres", maths: "sm" };
const FR_NAMES = { svt: "Sciences de la Vie et de la Terre", sp: "Sciences Physiques", sm: "Sciences Mathématiques A", anglais: "Anglais", french: "Français", philosophie: "Philosophie", maths: "Mathématiques" };
const AR_NAMES = { svt: "علوم الحياة والأرض", sp: "علوم فيزيائية", sm: "علوم رياضية", anglais: "الإنجليزية", french: "الفرنسية", philosophie: "الفلسفة", maths: "الرياضيات" };
const KIND_FR = { sujet: "Sujet", correction: "Correction", exercice: "Exercice" };
const KIND_AR = { sujet: "الموضوع", correction: "التصحيح", exercice: "تمرين" };

async function scrapeKhaymasvt() {
  console.log("Scraping khaymasvt.ma ...");
  const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];
  const results = [];
  const subjOrder = ["svt", "sp", "sm"];

  for (const year of years) {
    try {
      const pages = await fetchJSON(`https://khaymasvt.ma/wp-json/wp/v2/pages?slug=exam${year}&per_page=10`);
      if (!pages.length) { console.log(`  ${year}: page not found`); continue; }
      const page = await fetchJSON(`https://khaymasvt.ma/wp-json/wp/v2/pages/${pages[0].id}`);
      const html = page.content.rendered;
      const links = [...html.matchAll(/href="(https:\/\/drive\.google\.com[^"]+)"/g)].map((m) => m[1]);
      const sessions = links.length >= 12 ? ["normal", "rattrapage"] : links.length >= 6 ? ["normal"] : [];
      let idx = 0;
      for (const session of sessions) {
        for (const subj of subjOrder) {
          for (const kind of ["sujet", "correction"]) {
            if (idx < links.length) {
              results.push({
                titleFr: `${FR_NAMES[subj]} — Examen National ${year} — ${session === "rattrapage" ? "Rattrapage" : "Session normale"} — ${KIND_FR[kind]}`,
                titleAr: `${AR_NAMES[subj]} — الامتحان الوطني ${year} — ${session === "rattrapage" ? "التعويضية" : "الدورة العادية"} — ${KIND_AR[kind]}`,
                kind: "exam",
                url: links[idx],
                year,
                session,
                subjectKey: subj,
                branchSlug: BRANCH_MAP[subj],
              });
              idx++;
            }
          }
        }
      }
      console.log(`  ${year}: ${links.length} links (${sessions.length} sessions)`);
    } catch (e) { console.log(`  ${year}: ERROR ${e.message}`); }
  }
  return results;
}

async function scrapeMoroccoEnglish() {
  console.log("Scraping moroccoenglish.com ...");
  const results = [];
  try {
    const pages = await fetchJSON("https://moroccoenglish.com/wp-json/wp/v2/posts?search=bac&per_page=100&_fields=id,title,link");
    for (const p of pages) {
      const title = p.title?.rendered ?? "";
      if (!/bac|baccalaur/i.test(title)) continue;
      const yearMatch = title.match(/(20[12]\d)/);
      results.push({
        titleFr: title.replace(/<[^>]+>/g, ""),
        titleAr: title.replace(/<[^>]+>/g, ""),
        kind: "exam",
        url: p.link,
        year: yearMatch ? Number(yearMatch[1]) : null,
        session: null,
        subjectKey: "anglais",
        branchSlug: "lettres",
      });
    }
    console.log(`  ${results.length} posts found`);
  } catch (e) { console.log(`  ERROR ${e.message}`); }
  return results;
}

async function scrapeMyEnglishPages() {
  console.log("Scraping myenglishpages.com ...");
  const results = [];
  try {
    const html = await fetchText("https://www.myenglishpages.com/anglais-bac-maroc");
    const links = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>\s*([^<]*(?:bac|baccalaur)[^<]*)/gi)];
    for (const m of links) {
      const url = m[1];
      const label = m[2].trim();
      const yearMatch = label.match(/(20[12]\d)/);
      if (!/pdf|exam|download|sujet|correction|sujet|épreuve/i.test(label + " " + url)) continue;
      results.push({
        titleFr: `Examen National Anglais ${yearMatch ? yearMatch[1] : ""} — ${label}`,
        titleAr: `الامتحان الوطني للإنجليزية ${yearMatch ? yearMatch[1] : ""} — ${label}`,
        kind: "exam",
        url: url.startsWith("http") ? url : "https://www.myenglishpages.com" + url,
        year: yearMatch ? Number(yearMatch[1]) : null,
        session: null,
        subjectKey: "anglais",
        branchSlug: "lettres",
      });
    }
    console.log(`  ${results.length} PDFs found`);
  } catch (e) { console.log(`  ERROR ${e.message}`); }
  return results;
}

async function scrapeTeacherKhedda() {
  console.log("Scraping teacherkhedda.com ...");
  const results = [];
  try {
    const html = await fetchText("https://www.teacherkhedda.com/p/english-national-bac-exams.html");
    const links = [...html.matchAll(/<a[^>]+href="([^"]+\.pdf[^"]*)"[^>]*>\s*([^<]+)/gi)];
    for (const m of links) {
      const url = m[1];
      const label = m[2].trim();
      const yearMatch = label.match(/(20[12]\d)/);
      results.push({
        titleFr: `Examen National Anglais ${yearMatch ? yearMatch[1] : ""} — ${label}`,
        titleAr: `الامتحان الوطني للإنجليزية ${yearMatch ? yearMatch[1] : ""} — ${label}`,
        kind: "exam",
        url: url.startsWith("http") ? url : "https://www.teacherkhedda.com" + url,
        year: yearMatch ? Number(yearMatch[1]) : null,
        session: null,
        subjectKey: "anglais",
        branchSlug: "lettres",
      });
    }
    console.log(`  ${results.length} PDFs found`);
  } catch (e) { console.log(`  ERROR ${e.message}`); }
  return results;
}

async function main() {
  const all = [
    ...(await scrapeKhaymasvt()),
    ...(await scrapeMoroccoEnglish()),
    ...(await scrapeMyEnglishPages()),
    ...(await scrapeTeacherKhedda()),
  ];
  const output = JSON.stringify(all, null, 2);
  writeFileSync("content/resources.json", output);
  console.log(`\nTotal resources: ${all.length}`);
  console.log("Breakdown by subjectKey:");
  const counts = {};
  for (const r of all) { counts[r.subjectKey] = (counts[r.subjectKey] || 0) + 1; }
  console.log(counts);
}

main().catch((e) => { console.error(e); process.exit(1); });