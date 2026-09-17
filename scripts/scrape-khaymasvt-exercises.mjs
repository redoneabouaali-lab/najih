import { writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (NajihBot/1.0; content-aggregator)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}
async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (NajihBot/1.0; content-aggregator)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const EXCLUDE = [
  "home", "contact", "lp-checkout", "lp-profile", "courses", "instructors",
  "instructor", "lp-become-a-teacher", "lp-term-conditions", "awards",
  "olympiades", "exam", "examens", "diwansvt", "adaptees", "whiteboard",
  "compte-dutilisateur", "liste-de-souhaits", "consultez-le-site",
  "instructor-public-account", "student-public-account", "gen_rep_sex_2sm",
  "plante_repro", "test_diag", "diagn_test1", "test_tcs", "devtcs", "devoirs",
];

const BRANCH_RULES = [
  [/2bacsvt|svtunite|genetique|ecologie|photosynth|plante|immuno|geo_extern|lois_statis|communication_nerv|utilisation_matieres|sujet.*svt|exo2bacsvt|energy/i, "svt"],
  [/2bacsp|exopc|2bac_sm|2bacsm|1bacsm|1bacs/i, null],
  [/doc_2bacsvt|diag.*svt|gen_rep/i, "svt"],
  [/tcs|doc_1bacse|doc_2bacsp|doc_2bacsvt/i, null],
];

function classify(slug, title) {
  const t = `${slug} ${title}`;
  for (const [re, branch] of BRANCH_RULES) {
    if (re.test(t)) {
      const subject = /energy|matiere|metabolis/i.test(t) ? "svt"
        : /pc|physique|chimie|electricite|mecanique|ondes/i.test(t) ? "sp"
        : /math|probab|statis/i.test(t) ? "sm"
        : "svt";
      return { subject, branch: branch === null ? subject : branch };
    }
  }
  if (/cours|exercices|documents/i.test(slug)) return { subject: "svt", branch: "svt" };
  return { subject: null, branch: null };
}

const FR_TITLE_FIX = {
  "exo_genet_info": "Génétique — Information génétique",
  "exo_genet_pop": "Génétique — Génétique des populations",
  "exo_genet_mendel": "Génétique — Lois de Mendel",
  "exo_gent_hum": "Génétique — Génétique humaine",
  "exopc": "Physique-Chimie — Exercices",
  "exercices": "Exercices",
  "cours": "Cours",
  "devoirs": "Devoirs",
  "exo2bacsvt": "SVT 2Bac — Exercices",
};

async function main() {
  const sitemap = await fetchText("https://khaymasvt.ma/page-sitemap.xml");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith("https://khaymasvt.ma/"));

  const results = [];
  let used = 0;
  let skipped = 0;

  for (const url of urls) {
    const slug = url.replace("https://khaymasvt.ma/", "").replace(/\/$/, "");
    if (!slug || EXCLUDE.some((e) => slug.startsWith(e))) { skipped++; continue; }
    try {
      let title = slug;
      let contentLen = 0;
      try {
        const pages = await fetchJSON(`https://khaymasvt.ma/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&per_page=1`);
        const page = pages?.[0];
        if (page?.title?.rendered) title = page.title.rendered.replace(/<[^>]+>/g, "").trim();
        if (page?.content?.rendered) contentLen = page.content.rendered.length;
      } catch {
        // fall back to slug for title
      }

      const { subject, branch } = classify(slug, title);
      const display = FR_TITLE_FIX[slug] ?? title ?? slug;
      results.push({
        titleFr: `Exercices — ${display}`,
        titleAr: `تمارين — ${display}`,
        kind: "exercise",
        url,
        year: null,
        session: null,
        subjectKey: subject,
        branchSlug: branch,
        contentLen,
      });
      used++;
      if (used % 25 === 0) console.log(`  ...${used} pages`);
      await sleep(120);
    } catch (e) {
      skipped++;
    }
  }

  const out = JSON.stringify(results, null, 2);
  writeFileSync("content/exercises.json", out); // dev note: BOM added by fs.writeFileSync on windows when buffer? writeFileSync writes utf8 no BOM by default
  console.log(`\nExercise pages: ${results.length} (skipped ${skipped})`);
  const shelf = fsReadJSON("content/exercises.json");
  const byBranch = {};
  for (const r of shelf) { const b = r.branchSlug ?? "other"; byBranch[b] = (byBranch[b] || 0) + 1; }
  console.log(byBranch);
}

function fsReadJSON(p) {
  const txt = readFileSync(p, "utf8");
  return JSON.parse(txt.replace(/^\uFEFF/, ""));
}

main().catch((e) => { console.error(e); process.exit(1); });