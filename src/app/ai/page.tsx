import { getLang } from "@/lib/getLang";
import { Chat } from "@/components/Chat";

export default async function AIPage() {
  const lang = await getLang();
  return <Chat lang={lang} />;
}