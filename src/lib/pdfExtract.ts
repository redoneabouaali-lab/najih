let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

function loadPdfjs(): Promise<typeof import("pdfjs-dist")> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((mod) => {
      if (typeof window !== "undefined") {
        try {
          (mod as typeof import("pdfjs-dist")).GlobalWorkerOptions.workerSrc =
            "/pdf.worker.min.mjs";
        } catch {
          /* ignore */
        }
      }
      return mod;
    });
  }
  return pdfjsPromise;
}

export async function extractPdfText(
  data: ArrayBuffer | Uint8Array,
  maxPages = 5,
): Promise<string> {
  const pdfjs = await loadPdfjs();
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  try {
    const pages = Math.min(doc.numPages, maxPages);
    const texts: string[] = [];
    for (let p = 1; p <= pages; p++) {
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      const parts: string[] = [];
      for (const item of tc.items) {
        const s = (item as { str?: string }).str;
        if (typeof s === "string") parts.push(s);
      }
      texts.push(parts.join(" "));
      void page.cleanup();
    }
    return texts.join("\n\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  } finally {
    try {
      await (doc as unknown as { destroy?: () => Promise<void> }).destroy?.();
    } catch {
      /* ignore */
    }
  }
}

export async function fileToArrayBuffer(f: File): Promise<ArrayBuffer> {
  return f.arrayBuffer();
}