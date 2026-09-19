import { getLang } from "@/lib/getLang";
import { mkMeta } from "@/lib/seo";
import type { Metadata } from "next";
import { Chat } from "@/components/Chat";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return mkMeta({
    lang,
    path: "/ai",
    title: lang === "ar" ? "المرشد الذكي" : "Tuteur IA",
    description:
      lang === "ar"
        ? "اسأل المرشد الذكي عن أي درس أو امتحان في الباكالوريا المغربية — يجيبك بالعربية أو الفرنسية ويمنحك روابط مباشرة."
        : "Demande au Tuteur IA n'importe quelle leçon ou examen du Bac marocain — il répond en arabe ou en français avec des liens directs.",
  });
}

export default async function AIPage() {
  const lang = await getLang();
  return <Chat lang={lang} />;
}