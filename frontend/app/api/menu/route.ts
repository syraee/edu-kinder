export const runtime = "nodejs";

// Definície typov (zachovať pre MenuDisplay komponent)
export interface MealItem {
  name: string;
  portion: string;
  allergens: string;
}

export interface MealSection {
  items: MealItem[];
}

export interface DayMenu {
  date: string;
  dayName: string;
  energyValues: string;
  breakfast: MealSection;
  lunch: MealSection;
  snack: MealSection;
}

export interface MenuData {
  weekRange: string;
  facility: string;
  pageNumber: string;
  days: DayMenu[];
  allergenLegend?: string;
  notes?: string;
  chef?: string;
  headChef?: string;
  pdfUrl: string;
}

function extractPageNumber(text: string): string {
  const match = text.match(/Strana\s+č?\.?\s*(\d+)/i);
  return match ? match[1] : "1";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pdfUrl = searchParams.get("url");

  if (!pdfUrl) {
    return new Response(JSON.stringify({ error: "Missing ?url= parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Načítanie a parsovanie PDF
    const pdfResponse = await fetch(pdfUrl, { cache: "no-store" });

    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
    }

    const arrayBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extrakcia textu z PDF
    const { parsePDF } = require("./pdf-parser.js");
    const text = await parsePDF(buffer);

    // Parsovanie dát jedálneho lístka
    const { parseMenuPDF } = require("./pdf-utils.ts");
    const menuData = {
      ...parseMenuPDF(text),
      pageNumber: extractPageNumber(text),
      pdfUrl,
    };

    // Validácia
    if (menuData.days.length === 0) {
      throw new Error("No menu data found in PDF");
    }

    return new Response(JSON.stringify(menuData, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process PDF",
        message: error instanceof Error ? error.message : "Unknown error",
        pdfUrl,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
