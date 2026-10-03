import type { Metadata } from "next";
import type { Lang } from "@/lib/lang";

export const SITE_URL = "https://najih.abouaaliahmed.com";
export const SITE_NAME = "ناجح | Najih";
export const TITLE_SUFFIX = "Najih";

const KEYWORDS = [
  "باكالوريا المغرب",
  "bac maroc",
  "examens nationaux maroc",
  "امتحانات وطنية",
  "دروس الباكالوريا",
  "cours bac maroc",
  "المرشد الذكي",
  "quiz bac maroc",
  "تلميذ المغرب",
];

export function branchAr(nameAr: string): string {
  return nameAr.replace(/^شعبة\s+/, "").trim();
}

const BRANCH_SHORT_AR: Record<string, string> = {
  sm: "العلوم الرياضية",
  sp: "العلوم الفيزيائية",
  svt: "العلوم التجريبية",
  eco: "العلوم الاقتصادية",
  lettres: "الآداب",
  arts: "الفنون",
};

const BRANCH_SHORT_FR: Record<string, string> = {
  sm: "Maths",
  sp: "Physique",
  svt: "SVT",
  eco: "Économie",
  lettres: "Lettres",
  arts: "Arts",
};

export function branchShortAr(slug: string, nameAr: string): string {
  return BRANCH_SHORT_AR[slug] ?? branchAr(nameAr);
}

export function branchShortFr(slug: string, nameFr: string): string {
  return BRANCH_SHORT_FR[slug] ?? nameFr;
}

export function mkMeta(opts: {
  lang: Lang;
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  brandInTitle?: boolean;
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  return {
    title: opts.brandInTitle === false ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${opts.title} | ${TITLE_SUFFIX}`,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      locale: opts.lang === "ar" ? "ar_MA" : "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${opts.title} | ${TITLE_SUFFIX}`,
      description: opts.description,
    },
    keywords: [...KEYWORDS, ...(opts.keywords ?? [])],
  };
}