import type { Metadata } from "next";
import type { Lang } from "@/lib/lang";

export const SITE_URL = "https://najih.abouaaliahmed.com";
export const SITE_NAME = "ناجح | Najih";

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

export function mkMeta(opts: {
  lang: Lang;
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${opts.title} | ${SITE_NAME}`,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      locale: opts.lang === "ar" ? "ar_MA" : "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${opts.title} | ${SITE_NAME}`,
      description: opts.description,
    },
    keywords: [...KEYWORDS, ...(opts.keywords ?? [])],
  };
}