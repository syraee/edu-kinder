export const runtime = "nodejs";

type UrlCandidate = {
  url: string;
  label: string;
};

type ScrapedPdf = {
  href: string;
  text: string;
  filename: string;
  dateMatch?: string;
};

// Vygeneruje kandidátov URL pre aktuálny týždeň na základe dátumových vzorov
function generateWeekUrlCandidates(date: Date): UrlCandidate[] {
  const candidates: UrlCandidate[] = [];
  const baseUrl = "https://www.upjs.sk/app/uploads/sites/26";

  // Zisti pondelok v aktuálnom týždni
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);

  for (let weekOffset = 1; weekOffset >= -1; weekOffset--) {
    const weekMonday = new Date(monday);
    weekMonday.setDate(monday.getDate() + weekOffset * 7);

    const friday = new Date(weekMonday);
    friday.setDate(weekMonday.getDate() + 4);

    // Zobrazenie dátumu ako DD.MM.RRRR
    const mondayStr = formatDate(weekMonday);
    const fridayStr = formatDate(friday);

    // Skrátený formát v názve súboru: DD-DD.MM.RRRR
    const shortFormat = `${weekMonday.getDate()}-${friday.getDate()}.${String(
      friday.getMonth() + 1
    ).padStart(2, "0")}.${friday.getFullYear()}`;

    const year = weekMonday.getFullYear();
    const month = String(weekMonday.getMonth() + 1).padStart(2, "0");

    // Štruktúrovaná cesta: /rok/mesiac/názov.pdf
    candidates.push({
      url: `${baseUrl}/${year}/${month}/${shortFormat}.pdf`,
      label: `${mondayStr} - ${fridayStr}`,
    });

    // Alternatíva: bez zložky rok/mesiac
    candidates.push({
      url: `${baseUrl}/${shortFormat}.pdf`,
      label: `${mondayStr} - ${fridayStr}`,
    });
  }

  return candidates;
}

// Formátovanie dátumu na DD.MM.RRRR
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Voliteľný zdroj pre scraping (?source=...), inak predvolená stránka škôlky
  const sourceUrl =
    searchParams.get("source") ||
    "https://www.upjs.sk/materska-skola-upejesko/stravovanie/";

  try {
    let pdfUrl: string | null = null;
    let pdfLabel: string | null = null;
    let scrapedCount = 0;

    try {
      // Prvý pokus: vyhľadanie PDF cez scraping
      const scrapeUrl = new URL("/api/scrape", req.url);
      scrapeUrl.searchParams.set("url", sourceUrl);

      const scrapeResponse = await fetch(scrapeUrl.toString(), {
        cache: "no-store",
      });

      if (scrapeResponse.ok) {
        const scrapeData = await scrapeResponse.json();
        const pdfs = scrapeData.pdfs || [];
        scrapedCount = pdfs.length;

        // Odfiltruj administratívne PDF; uprednostni tie s dátumom
        const menuPdfs = pdfs.filter((pdf: ScrapedPdf) => {
          const name = (pdf.filename + pdf.text).toLowerCase();
          return (
            !name.includes("zodpovedna") &&
            !name.includes("zakon") &&
            (pdf.dateMatch || /\d{2}.*\d{2}.*\d{4}/.test(pdf.filename))
          );
        });

        if (menuPdfs.length > 0) {
          pdfUrl = menuPdfs[0].href;
          pdfLabel =
            menuPdfs[0].dateMatch || menuPdfs[0].text || menuPdfs[0].filename;
        }
      }
    } catch (scrapeError) {
      // Scraping zlyhal – prejdeme na predikciu URL podľa dátumu
    }

    if (!pdfUrl) {
      // Druhý pokus: predikcia URL podľa aktuálneho týždňa
      const now = new Date();
      const candidates = generateWeekUrlCandidates(now);

      for (const candidate of candidates) {
        try {
          const testResponse = await fetch(candidate.url, {
            method: "HEAD",
            cache: "no-store",
          });

          if (
            testResponse.ok &&
            testResponse.headers.get("content-type")?.includes("pdf")
          ) {
            pdfUrl = candidate.url;
            pdfLabel = candidate.label;
            break;
          }
        } catch {
          continue;
        }
      }
    }

    if (!pdfUrl) {
      // Nenašli sme žiadne PDF
      return new Response(
        JSON.stringify({
          error: "No PDF menus found",
          message:
            "Could not find any menu PDFs on the website or predict the current week's URL",
          sourceUrl,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stiahnutie a spracovanie PDF
    const pdfResponse = await fetch(pdfUrl, { cache: "no-store" });
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
    }

    const arrayBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extrakcia textu z PDF
    const { parsePDF } = require("./pdf-parser.js");
    const text = await parsePDF(buffer);

    // Parsovanie štruktúrovaného menu z PDF
    const { parseMenuFromPDF } = await import("./pdf-layout");
    const menuData = await parseMenuFromPDF(buffer, text);

    return new Response(
      JSON.stringify({
        ...menuData,
        autoDiscovered: true,
        sourceUrl,
        availablePdfs: scrapedCount,
        selectedPdf: {
          url: pdfUrl,
          label: pdfLabel || pdfUrl.split("/").pop() || "Aktuálny týždeň",
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chyba v /api/menu:", error);
    return new Response(
      JSON.stringify({
        error: "Nepodarilo sa získať aktuálne menu",
        message: error instanceof Error ? error.message : "Neznáma chyba",
        sourceUrl,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
