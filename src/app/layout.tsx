import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { prisma } from "@/lib/prisma";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { LangSync } from "@/components/LangSync";
import { Header } from "@/components/Header";
import { SWRegister } from "@/components/SWRegister";
import { AIAssistant } from "@/components/AIAssistant";
import { Motion } from "@/components/Motion";
import { GaInit } from "@/components/GaInit";
import { Analytics } from "@/components/Analytics";

const siteName = SITE_NAME;

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-arabic",
});

const gaId =
  (process.env.NAJIH_GA_ID || process.env.NEXT_PUBLIC_GA_ID || "").trim() ||
  null;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ناجح | Najih — Préparation Bac Maroc",
    template: `%s | ${siteName}`,
  },
  description:
    "Préparation gratuite au Bac Maroc — examens nationaux, quiz interactifs, tuteur IA",
  keywords: [
    "باكالوريا المغرب",
    "bac maroc",
    "examens nationaux maroc",
    "امتحانات وطنية",
    "دروس الباكالوريا",
    "cours bac maroc",
    "المرشد الذكي",
    "quiz bac maroc",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName,
    locale: "ar_MA",
    alternateLocale: "fr_FR",
    images: [{ url: `${SITE_URL}/img/logo.png`, width: 1024, height: 1024, alt: siteName }],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const lang = await getLang();
  const branches = await prisma.branch.findMany({
    select: { slug: true, nameAr: true, nameFr: true },
    orderBy: { order: "asc" },
  });

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className="h-full">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#f8fafc" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: SITE_URL,
                name: siteName,
                inLanguage: ["ar", "fr"],
                description: "Préparation gratuite au Bac Maroc",
              },
              {
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                name: "Najih",
                url: SITE_URL,
                logo: `${SITE_URL}/icon-512.png`,
              },
            ],
          }}
        />
        {gaId ? <GaInit id={gaId} /> : null}
      </head>
      <body
        className={`min-h-full flex flex-col ${spaceGrotesk.variable} ${ibmPlexSansArabic.variable}`}
      >
        {gaId ? <Analytics id={gaId} /> : null}
        <LangSync lang={lang} />
        <SWRegister />
        <Motion />
        <AIAssistant lang={lang} />
        <div className="scroll-progress" aria-hidden="true" />
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 bg-gradient-to-r from-indigo-50 via-white to-sky-50 border-t border-[var(--p)] px-6 pt-10 pb-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-[13px] text-[var(--m)]">
            <div className="flex flex-col gap-2">
              <span className="font-bold text-[var(--acc)]">ناجح / NAJIH</span>
              <span className="text-[var(--l)]">{t(lang, "footer")}</span>
            </div>
            <nav aria-label="Footer">
              <div className="font-bold text-[var(--b)] mb-2">{t(lang, "navBranches")}</div>
              <ul className="flex flex-col gap-1.5">
                {branches.map((b) => (
                  <li key={b.slug}>
                    <Link href={`/branches/${b.slug}`} className="text-[var(--p)] underline underline-offset-2 hover:opacity-75">
                      {lang === "ar" ? b.nameAr : b.nameFr}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Footer 2">
              <div className="font-bold text-[var(--b)] mb-2">{t(lang, "navHome")}</div>
              <ul className="flex flex-col gap-1.5">
                <li><Link href="/resources" className="text-[var(--p)] underline underline-offset-2 hover:opacity-75">{t(lang, "navResources")}</Link></li>
                <li><Link href="/ai" className="text-[var(--p)] underline underline-offset-2 hover:opacity-75">{t(lang, "navAi")}</Link></li>
                <li><Link href="/results" className="text-[var(--p)] underline underline-offset-2 hover:opacity-75">{t(lang, "navProgress")}</Link></li>
              </ul>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}