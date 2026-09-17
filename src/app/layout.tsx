import type { Metadata } from "next";
import "./globals.css";
import { getLang } from "@/lib/getLang";
import { t } from "@/lib/lang";
import { LangSync } from "@/components/LangSync";
import { Header } from "@/components/Header";
import { SWRegister } from "@/components/SWRegister";

export const metadata: Metadata = {
  title: "ناجِح | Najih — Préparation Bac Maroc",
  description:
    "Préparation gratuite au Bac Maroc — examens nationaux, quiz interactifs, tuteur IA",
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const lang = await getLang();

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className="h-full">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#f0f0f0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500&family=IBM+Plex+Sans+Arabic:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LangSync lang={lang} />
        <SWRegister />
        <div className="scroll-progress" aria-hidden="true" />
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--b)] px-6 py-10 flex flex-col items-center gap-3 text-[12px] uppercase tracking-[0.12em] text-[var(--b)]">
          <span className="font-normal">
            ناجِح / NAJIH<span className="align-super text-[9px]">®</span>
          </span>
          <span className="normal-case text-[var(--l)]">{t(lang, "footer")}</span>
        </footer>
      </body>
    </html>
  );
}