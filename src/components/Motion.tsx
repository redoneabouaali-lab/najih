"use client";

import dynamic from "next/dynamic";

const MotionLayer = dynamic(() => import("./MotionLayer").then((m) => m.MotionLayer), { ssr: false });

export function Motion() {
  return <MotionLayer />;
}
