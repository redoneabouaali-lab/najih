export function GaInit({ id }: { id: string }) {
  const code = [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){dataLayer.push(arguments);}",
    "gtag('js',new Date());",
    `gtag('config',${JSON.stringify(id)},{send_page_view:false});`,
  ].join("");

  return <script id="ga4-init" dangerouslySetInnerHTML={{ __html: code }} />;
}
