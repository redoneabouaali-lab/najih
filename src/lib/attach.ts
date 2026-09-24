import { compressImage } from "./image";
import { extractPdfText } from "./pdfExtract";

export type AttachImage = { type: "image"; dataUrl: string; name?: string };
export type AttachPdf = { type: "pdf"; text: string; name?: string };
export type Attach = AttachImage | AttachPdf;

export async function prepareAttachment(f: File): Promise<Attach> {
  if (f.type.startsWith("image/")) {
    const c = await compressImage(f);
    return { type: "image", dataUrl: c.dataUrl, name: f.name || undefined };
  }
  const buf = await f.arrayBuffer();
  const text = await extractPdfText(buf, 5);
  return { type: "pdf", text, name: f.name || undefined };
}