"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });

function subscribe(cb: () => void) {
  const mqs = [window.matchMedia("(prefers-reduced-motion: reduce)"), window.matchMedia("(max-width: 640px)")];
  mqs.forEach((mq) => mq.addEventListener("change", cb));
  return () => mqs.forEach((mq) => mq.removeEventListener("change", cb));
}

function getSnapshot() {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !window.matchMedia("(max-width: 640px)").matches
  );
}

export function Hero3D({ alt }: { alt: string }) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const [ready, setReady] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-[28px] border-[6px] border-white aspect-[16/11] shadow-[0_24px_60px_-20px_rgba(79,70,229,0.45)]">
      <Image
        src="/images/hero-najih.webp"
        alt={alt}
        fill
        priority
        sizes="(max-width:1024px) 100vw, 640px"
        className="object-cover"
      />
      <div
        className={`absolute inset-0 bg-[radial-gradient(120%_120%_at_30%_12%,#1e1b4b_0%,#050818_68%)] transition-opacity duration-700 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />
      {enabled && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
          aria-hidden
        >
          <ErrorBoundary>
            <HeroScene onReady={() => setReady(true)} />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}
