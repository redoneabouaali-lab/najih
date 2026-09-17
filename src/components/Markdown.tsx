function inline(text: string) {
  const parts: (string | React.ReactNode)[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<strong key={m.index}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

function renderLines(content: string) {
  const lines = content.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (!list.length) return;
    out.push(
      <ul key={key} className="list-disc list-inside space-y-1 my-2 text-[var(--b)]">
        {list.map((li, i) => (
          <li key={i}>{inline(li)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((line, i) => {
    const key = `l${i}`;
    if (line.startsWith("### ")) {
      flushList(key + "a");
      out.push(<h3 key={key} className="text-lg font-medium text-[var(--b)] mt-5 mb-2">{inline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      flushList(key + "a");
      out.push(<h2 key={key} className="text-xl font-medium text-[var(--b)] mt-6 mb-2">{inline(line.slice(3))}</h2>);
    } else if (line.startsWith("- ")) {
      list.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList(key + "a");
    } else {
      flushList(key + "a");
      out.push(<p key={key} className="my-2 leading-relaxed text-[var(--b)]">{inline(line)}</p>);
    }
  });
  flushList("last");
  return out;
}

export function Markdown({ content }: { content: string }) {
  return <div dir="auto">{renderLines(content)}</div>;
}