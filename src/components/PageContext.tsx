"use client";

import { useEffect } from "react";
import { setPageContext } from "@/lib/assist";

export function PageContext({ context }: { context: string | null }) {
  useEffect(() => {
    setPageContext(context);
    return () => setPageContext(null);
  }, [context]);
  return null;
}