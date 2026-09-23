"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

export function MotionLayer() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  // Smooth scrolling — created once for the whole session.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll-driven effects, re-built for every route.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!registered) {
      gsap.registerPlugin(ScrollTrigger, SplitText);
      registered = true;
    }

    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-fx='parallax']").forEach((el) => {
        const speed = Number(el.dataset.fxSpeed ?? 0.3);
        gsap.to(el, {
          yPercent: -speed * 100,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-fx='split']").forEach((el) => {
        const split = SplitText.create(el, { type: "words", wordsClass: "fx-word", aria: "none" });
        splits.push(split);
        gsap.from(split.words, {
          yPercent: 70,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.04,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-fx='rise']").forEach((el) => {
        gsap.from(el, {
          yPercent: 60,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-fx='counter']").forEach((el) => {
        const to = Number(el.dataset.to ?? 0);
        if (!Number.isFinite(to)) return;
        const box = { v: 0 };
        gsap.to(box, {
          v: to,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(box.v).toLocaleString("fr-FR");
          },
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-fx='stagger']").forEach((grid) => {
        gsap.from(grid.children, {
          y: 34,
          opacity: 0,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: grid, start: "top 85%", once: true },
        });
      });

      const marquee = document.querySelector<HTMLElement>(".marquee");
      if (marquee) {
        const setSkew = gsap.quickTo(marquee, "skewX", { duration: 0.5, ease: "power3.out" });
        ScrollTrigger.create({
          trigger: document.body,
          start: 0,
          end: "max",
          onUpdate: (self) => setSkew(gsap.utils.clamp(-10, 10, self.getVelocity() / 220)),
        });
      }
    });

    const id = window.setTimeout(() => {
      lenisRef.current?.scrollTo(0, { immediate: true });
      ScrollTrigger.refresh();
    }, 120);

    return () => {
      window.clearTimeout(id);
      splits.forEach((s) => s.revert());
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
