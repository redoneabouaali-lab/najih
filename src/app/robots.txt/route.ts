import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";

export function GET() {
  const body =
    `User-agent: *\n` +
    `Allow: /\n` +
    `Disallow: /results\n` +
    `Disallow: /api/\n` +
    `\n` +
    `Sitemap: ${SITE_URL}/sitemap.xml\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}