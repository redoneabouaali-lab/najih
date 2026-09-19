import { prisma } from "@/lib/prisma";
import { getClientLang } from "@/lib/lang";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const lang = getClientLang();
  if (q.length < 2) return Response.json({ items: [] });

  const tk = q.toLowerCase();
  const items: { url: string; label: string; sub: string; icon: string }[] = [];
  const seen = new Set<string>();

  const branches = await prisma.branch.findMany({
    where: { OR: [{ nameAr: { contains: tk } }, { nameFr: { contains: tk } }] },
    take: 5,
  });
  for (const b of branches) {
    const label = lang === "ar" ? b.nameAr : b.nameFr;
    const key = `/branches/${b.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      url: key,
      label,
      sub: lang === "ar" ? "الشعبة" : "Filière",
      icon: "🎓",
    });
  }

  const subjects = await prisma.subject.findMany({
    where: {
      OR: [{ nameAr: { contains: tk } }, { nameFr: { contains: tk } }],
    },
    include: { branch: { select: { slug: true } } },
    take: 8,
  });
  for (const s of subjects) {
    const label = lang === "ar" ? s.nameAr : s.nameFr;
    const key = `/branches/${s.branch.slug}/matiere/${s.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      url: key,
      label,
      sub: lang === "ar" ? "مادة" : "Matière",
      icon: s.icon,
    });
  }

  const chapters = await prisma.chapter.findMany({
    where: { lesson: { isNot: null } },
    include: {
      subject: { select: { slug: true, nameAr: true, nameFr: true } },
    },
    take: 40,
  });
  for (const c of chapters) {
    const title = `${c.titleAr ?? ""} ${c.titleFr ?? ""}`.toLowerCase();
    if (!title.includes(tk)) continue;
    const label = lang === "ar" ? c.titleAr : c.titleFr;
    const key = `/branches/${c.subject.slug}/lesson/${c.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const subj = lang === "ar" ? c.subject.nameAr : c.subject.nameFr;
    items.push({
      url: key,
      label,
      sub: `${subj} — ${lang === "ar" ? "درس" : "Cours"}`,
      icon: "📖",
    });
  }

  const resources = await prisma.resource.findMany({
    where: {
      OR: [{ titleAr: { contains: tk } }, { titleFr: { contains: tk } }],
    },
    take: 12,
    orderBy: [{ year: "desc" }],
  });
  for (const r of resources) {
    const label = lang === "ar" ? r.titleAr : r.titleFr;
    const key = r.url;
    if (seen.has(key)) continue;
    seen.add(key);
    const yearStr = r.year ? `${r.year} · ` : "";
    const kind =
      r.kind === "exam"
        ? lang === "ar"
          ? "امتحان"
          : "Examen"
        : r.kind === "lesson"
        ? lang === "ar"
          ? "تحميل"
          : "Téléchargement"
        : lang === "ar"
        ? "ملف"
        : "Fichier";
    items.push({
      url: key,
      label,
      sub: `${yearStr}${kind}`,
      icon: r.kind === "exam" ? "🗓" : "📄",
    });
  }

  return Response.json({ items: items.slice(0, 14) });
}
