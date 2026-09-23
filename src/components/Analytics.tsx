"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function Analytics({ id }: { id: string | null }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!id || !window.gtag) return;
    window.gtag("config", id, {
      page_path: pathname,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [id, pathname]);

  if (!id) return null;

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
      strategy="afterInteractive"
    />
  );
}