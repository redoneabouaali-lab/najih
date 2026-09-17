"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getClientLang, normalizeLang, t, type Lang } from "@/lib/lang";
import { LangToggle } from "./LangToggle";
import { ScrollProgress } from "./ScrollProgress";

export function Header() {
  const [lang, setLang] = useState<Lang>("ar");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const update = () => {
      const l = normalizeLang(getClientLang());
      setLang(l);
      setScrolled(window.scrollY > 8);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    const iv = setInterval(update, 500);
    return () => {
      window.removeEventListener("scroll", update);
      clearInterval(iv);
    };
  }, []);

  const links = [
    { href: "/branches", key: "navBranches" },
    { href: "/resources", key: "navResources" },
    { href: "/ai", key: "navAi" },
    { href: "/results", key: "navProgress" },
  ];

  return (
    <>
      <ScrollProgress />
      <header className={`hdr ${scrolled ? "scrolled" : ""}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
          <Link href="/" className="text-[15px] font-normal tracking-[0.06em] uppercase">
            <span className="text-[var(--b)]">ناجِح</span>
            <span className="text-[var(--b)] opacity-50">.bac</span>
          </Link>

          <nav className="hdr-nav hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={pathname === l.href ? "text-[var(--b)]" : ""}>
                {t(lang, l.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LangToggle lang={lang} />
            <Link href="/branches" className="btn btn-emerald btn-sm">
              {t(lang, "homeStart")} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}