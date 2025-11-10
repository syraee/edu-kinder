import * as cheerio from "cheerio";

export const runtime = "nodejs";

// absolutizácia relatívnych URL
function toAbs(base: string, href: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

async function isPdfUrl(url: string) {
  // nie všetky servery dovoľujú HEAD – skúsime HEAD a fallback na GET (bez sťahovania celého tela)
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow" });
    const ct = head.headers.get("content-type") || "";
    if (ct.includes("application/pdf")) return true;
  } catch {
    /* ignore */
  }

  try {
    const resp = await fetch(url, { method: "GET", redirect: "follow" });
    const ct = resp.headers.get("content-type") || "";
    // nečítame body, len zisťujeme typ
    return ct.includes("application/pdf");
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) {
    return new Response(JSON.stringify({ error: "Missing ?url=" }), {
      status: 400,
    });
  }

  // Ak niekto dá priamo .pdf, vráť to rovno
  if (target.toLowerCase().endsWith(".pdf")) {
    const name = target.split("/").pop() || "file.pdf";
    return new Response(
      JSON.stringify(
        { count: 1, pdfs: [{ href: target, text: name, filename: name }] },
        null,
        2
      ),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Stiahni HTML stránky s dátumami
  const resp = await fetch(target, { cache: "no-store", redirect: "follow" });
  if (!resp.ok) {
    return new Response(
      JSON.stringify({ error: `Fetch failed: ${resp.status}` }),
      { status: 502 }
    );
  }

  const html = await resp.text();
  const $ = cheerio.load(html);

  // Nazbieraj všetky odkazy
  const rawLinks: { href: string; text: string }[] = [];
  $("a[href]").each((_, a) => {
    const href = ($(a).attr("href") || "").trim();
    if (!href) return;
    const abs = toAbs(target, href);
    const text = ($(a).text() || "").trim();
    rawLinks.push({ href: abs, text });
  });

  // 1) priame .pdf
  const direct = rawLinks.filter((l) => l.href.toLowerCase().endsWith(".pdf"));

  // 2) „dátumové“ odkazy bez .pdf – skúsime overiť obsah
  const maybeDates = rawLinks.filter(
    (l) =>
      !l.href.toLowerCase().endsWith(".pdf") &&
      // heuristika: text obsahuje dátumový pattern
      /(\d{1,2}\.\d{1,2}\.\d{4}|\d{1,2}\.\d{1,2}\.\d{2,4})/.test(l.text)
  );

  // limituj paralelizmus, nech netrápime server
  const limit = 6;
  const checked: { href: string; text: string }[] = [];
  for (let i = 0; i < maybeDates.length; i += limit) {
    const batch = maybeDates.slice(i, i + limit);
    const results = await Promise.all(
      batch.map(async (l) => ((await isPdfUrl(l.href)) ? l : null))
    );
    checked.push(...(results.filter(Boolean) as any[]));
  }

  // Zlúčenie a deduplikácia
  const all = [...direct, ...checked];
  const uniq = Array.from(new Map(all.map((l) => [l.href, l])).values());

  const pdfs = uniq
    .map((l) => {
      const filename = l.href.split("/").pop() || "file.pdf";
      const m = (filename + " " + l.text).match(
        /(\d{1,2}[.\-]\d{1,2}[.\-]\d{2,4})(?:\s*[\-–]\s*(\d{1,2}[.\-]\d{1,2}[.\-]\d{2,4}))?/i
      );
      return {
        href: l.href,
        text: l.text,
        filename,
        dateMatch: m ? m[0] : undefined,
      };
    })
    .sort((a, b) => {
      // Zoradenie podľa koncového dátumu zostupne (najnovšie navrchu)
      const getEndDate = (pdf: any) => {
        if (!pdf.dateMatch) return null;
        const parts = pdf.dateMatch.split(/[\s\-–]+/);
        const datePart = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        const match = datePart.match(/(\d{1,2})[.\-](\d{1,2})[.\-](\d{2,4})/);
        if (!match) return null;
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const year = parseInt(match[3]);
        return new Date(year, month, day);
      };

      const dateA = getEndDate(a);
      const dateB = getEndDate(b);

      if (dateA && dateB) {
        return dateB.getTime() - dateA.getTime(); // Descending order
      }
      if (dateA) return -1;
      if (dateB) return 1;
      return (b.text || "").localeCompare(a.text || "");
    });

  return new Response(JSON.stringify({ count: pdfs.length, pdfs }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
