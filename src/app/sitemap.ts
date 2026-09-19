import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

type Entry = {
  url: string;
  lastModified?: Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
};

export default async function sitemap(): Promise<Entry[]> {
  const entries: Entry[] = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/branches`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/resources`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/ai`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const [branches, subjects, chapters] = await Promise.all([
    prisma.branch.findMany({
      select: { slug: true, createdAt: true },
      orderBy: { order: "asc" },
    }),
    prisma.subject.findMany({
      select: { slug: true, branch: { select: { slug: true } }, createdAt: true },
    }),
    prisma.chapter.findMany({
      where: { lesson: { isNot: null } },
      select: { id: true, createdAt: true, lesson: { select: { createdAt: true } } },
    }),
  ]);

  for (const b of branches) {
    entries.push({
      url: `${SITE_URL}/branches/${b.slug}`,
      lastModified: b.createdAt,
      changeFrequency: "weekly",
      priority: 0.85,
    });
    entries.push({
      url: `${SITE_URL}/resources/${b.slug}`,
      lastModified: b.createdAt,
      changeFrequency: "weekly",
      priority: 0.75,
    });
  }

  for (const s of subjects) {
    const base = `${SITE_URL}/branches/${s.branch.slug}/matiere/${s.slug}`;
    entries.push({
      url: base,
      lastModified: s.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    entries.push({
      url: `${base}/examens`,
      lastModified: s.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const c of chapters) {
    const lastModified = c.lesson?.createdAt ?? c.createdAt;
    entries.push({
      url: `${SITE_URL}/lesson/${c.id}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    });
    entries.push({
      url: `${SITE_URL}/quiz/${c.id}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}