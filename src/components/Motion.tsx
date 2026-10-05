"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REVEAL_ATTR = "data-reveal";
const REVEAL_SELECTOR = `[${REVEAL_ATTR}]`;
const GROUP_SELECTOR = "[data-reveal-group]";
const COUNTER_SELECTOR = "[data-count-to]";

function motionAllowed() {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    (navigator.hardwareConcurrency ?? 8) >= 4
  );
}

function animateCounter(el: HTMLElement) {
  const target = Number(el.dataset.countTo ?? "0");
  if (!Number.isFinite(target) || target === 0) return;
  // Suppressed on small screens, where the number is read at a glance and a
  // 900ms count is more disruptive than informative. Server already rendered
  // the final value, so leaving it alone is correct.
  if (window.matchMedia("(max-width: 640px)").matches) return;

  const duration = 900;
  const start = performance.now();
  const format = (n: number) => Math.round(n).toLocaleString("en-US");

  const tick = (now: number) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(target * eased);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = format(target);
  };

  el.textContent = format(0);
  requestAnimationFrame(tick);
}

// A counter runs at most once per mount, and always ends up marked revealed so
// the trailing dot in `.stat-num::after` draws with it.
function runCounter(el: HTMLElement) {
  if (el.dataset.counted === "true") return;
  el.dataset.counted = "true";
  el.classList.add("is-revealed");
  animateCounter(el);
}

/**
 * `data-reveal-group` staggers a container's direct children. Rather than
 * stamping `data-reveal` into 11 page templates (and forgetting one), the
 * Motion layer claims the children itself, then observes each one
 * individually. This is what keeps a 564-card grid from animating as a single
 * slab: the group supplies cadence, the observer supplies timing.
 *
 * Claiming happens here, in JS, after the `html.has-motion` gate exists — so
 * without JS the children are never marked hidden in the first place.
 */
function claimGroupChildren(groups: HTMLElement[]) {
  for (const group of groups) {
    const step = group.dataset.revealStep;
    const cap = group.dataset.revealCap;

    for (const child of Array.from(group.children)) {
      const el = child as HTMLElement;
      // Guards against overwriting a variant the template already declared:
      // a group child written as data-reveal="scale" must keep "scale", not
      // be flattened back to a bare attribute.
      if (!el.hasAttribute(REVEAL_ATTR)) el.setAttribute(REVEAL_ATTR, "");
      if (step && !el.dataset.revealStep) el.dataset.revealStep = step;
      if (cap && !el.dataset.revealCap) el.dataset.revealCap = cap;
    }
  }
}

function observeMotion(scope: ParentNode, allowed: boolean) {
  const groups = Array.from(
    scope.querySelectorAll<HTMLElement>(GROUP_SELECTOR),
  );
  claimGroupChildren(groups);

  const reveals = Array.from(
    scope.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
  );
  const counters = Array.from(
    scope.querySelectorAll<HTMLElement>(COUNTER_SELECTOR),
  );

  if (!allowed) {
    reveals.forEach((el) => el.classList.add("is-revealed"));
    counters.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  // Counters that already sit inside a revealed subtree are triggered by that
  // ancestor; only the orphans need observing directly.
  const covered = new Set<HTMLElement>();
  for (const el of reveals) {
    if (el.matches(COUNTER_SELECTOR)) covered.add(el);
    el.querySelectorAll<HTMLElement>(COUNTER_SELECTOR).forEach((c) => covered.add(c));
  }

  const io = new IntersectionObserver(
    (entries) => {
      // Delay is computed per callback from the batch that just entered, so a
      // grid cascades in waves as you scroll instead of all at once on load.
      const entering = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      entering.forEach((entry, i) => {
        const el = entry.target as HTMLElement;
        io.unobserve(el);

        if (el.matches(COUNTER_SELECTOR) && !el.hasAttribute(REVEAL_ATTR)) {
          runCounter(el);
          return;
        }

        const step = Number(el.dataset.revealStep ?? "55");
        const cap = Number(el.dataset.revealCap ?? "8");
        el.style.setProperty("--reveal-delay", `${Math.min(i, cap) * step}ms`);
        el.classList.add("is-revealed");

        if (el.matches(COUNTER_SELECTOR)) runCounter(el);
        el.querySelectorAll<HTMLElement>(COUNTER_SELECTOR).forEach(runCounter);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
  );

  reveals.forEach((el) => io.observe(el));
  counters.forEach((el) => {
    if (!covered.has(el)) io.observe(el);
  });

  return () => io.disconnect();
}

export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const allowed = motionAllowed();

    // Attach the gate and the observers in the same frame: anything above the
    // fold is already intersecting when the observer takes its first reading,
    // so there is no window where content is hidden and nothing will reveal it.
    root.classList.add("has-motion");
    const stop = observeMotion(document, allowed);

    return () => {
      stop?.();
      root.classList.remove("has-motion");
    };
  }, [pathname]);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".scroll-progress");
    if (!el) return;

    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      el.style.transform = `scaleX(${total > 0 ? h.scrollTop / total : 0})`;
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
