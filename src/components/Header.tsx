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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <ScrollProgress />
      <header className={`hdr ${scrolled ? "scrolled" : ""}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-[15px] shadow-[var(--shadow-md)]">
              ✦
            </span>
            <span className="text-[17px] font-bold text-[var(--b)] tracking-tight">
              ناجح<span className="text-[var(--acc)]">.bac</span>
            </span>
          </Link>

          <nav className="hdr-nav hidden md:flex" aria-label="Main">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={isActive(l.href) ? "active" : ""}
              >
                {t(lang, l.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <LangToggle lang={lang} />
            <Link href="/branches" className="btn btn-emerald btn-sm !py-2.5">
              {t(lang, "homeStart")} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}