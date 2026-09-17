import { getLang } from "@/lib/getLang";
import { Progress } from "@/components/Progress";

export default async function ResultsPage() {
  const lang = await getLang();
  return <Progress lang={lang} />;
}