"use client";
import { useEffect, useState } from "react";

export type PdfItem = { href: string; text: string; filename: string; dateMatch?: string };

export default function PdfList({ pageWithLinks }: { pageWithLinks: string }) {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/scrape?url=${encodeURIComponent(pageWithLinks)}`)
      .then(r => r.json())
      .then(data => setItems(data.pdfs || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [pageWithLinks]);

  if (loading) return <p>Načítavam PDF…</p>;
  if (!items.length) return <p>Nenašli sa žiadne PDF odkazy.</p>;

  return (
    <ul>
      {items.map((p) => (
        <li key={p.href}>
          <a href={p.href} target="_blank" rel="noreferrer noopener">
            {p.dateMatch || p.text || p.filename}
          </a>
        </li>
      ))}
    </ul>
  );
}
