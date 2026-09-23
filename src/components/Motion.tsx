"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";

const MotionLayer = dynamic(() => import("./MotionLayer").then((m) => m.MotionLayer), { ssr: false });

function subscribe(cb: () => void) {
  const mqs = [window.matchMedia("(prefers-reduced-motion: reduce)"), window.matchMedia("(max-width: 640px)")];
  mqs.forEach((mq) => mq.addEventListener("change", cb));
  return () => mqs.forEach((mq) => mq.removeEventListener("change", cb));
}

function getSnapshot() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !window.matchMedia("(max-width: 640px)").matches;
}

export function Motion() {
  const [coresOk] = useState(
    () => typeof navigator === "undefined" || (navigator.hardwareConcurrency ?? 8) >= 4,
  );
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false) && coresOk;

  return enabled ? <MotionLayer /> : null;
}