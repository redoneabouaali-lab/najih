import { getLang } from "@/lib/getLang";
import type { Metadata } from "next";
import { Progress } from "@/components/Progress";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: lang === "ar" ? "تقدمك في المراجعة" : "Ta progression",
    robots: { index: false, follow: false },
  };
}

export default async function ResultsPage() {
  const lang = await getLang();
  return <Progress lang={lang} />;
}