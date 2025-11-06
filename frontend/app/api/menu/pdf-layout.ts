import type { TextItem } from "pdfjs-dist/types/src/display/api";
import {
  inferColumnsFromHeader,
  deriveColumnsByClustering,
  buildColumnsWithKeywords,
  ensureColumnCount,
} from "./pdf-columns";
import { tableToMenu } from "./pdf-menu";
import type { DayMenu } from "./types";

const pdfjs = require("pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js");

export type PositionedWord = {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Line = {
  y: number;
  words: PositionedWord[];
};

export type Table = {
  headers: string[];
  columns: number[]; // x súradnice (ľavé okraje stĺpcov)
  rows: string[][]; // text v stĺpcoch pre každý vizuálny riadok
};

function groupIntoLines(items: TextItem[], tolerance = 2): Line[] {
  const lines: Line[] = [];
  const sorted = items
    .map((it) => {
      const [, , , , e, f] = (it as any).transform as number[];
      return {
        text: it.str,
        x: e,
        y: f,
        w: it.width as number,
        h: it.height as number,
      } as PositionedWord;
    })
    .sort((a, b) => b.y - a.y || a.x - b.x);

  for (const word of sorted) {
    const line = lines.find((ln) => Math.abs(ln.y - word.y) <= tolerance);
    if (line) {
      line.words.push(word);
    } else {
      lines.push({ y: word.y, words: [word] });
    }
  }

  for (const ln of lines) {
    ln.words.sort((a, b) => a.x - b.x);
  }

  lines.sort((a, b) => b.y - a.y);
  return lines;
}

function columnIndexByBounds(x: number, columns: number[]): number {
  const mids: number[] = [];
  for (let i = 0; i < columns.length - 1; i++) {
    mids.push((columns[i] + columns[i + 1]) / 2);
  }
  for (let i = 0; i < mids.length; i++) {
    if (x < mids[i]) return i;
  }
  return columns.length - 1;
}

export async function extractTable(
  buffer: Buffer,
  expectedHeaders = [
    "Dátum",
    "Desiata",
    "HM",
    "AL",
    "Obed",
    "HM",
    "AL",
    "Olovrant",
    "HM",
    "AL",
  ]
): Promise<Table> {
  pdfjs.disableWorker = true;
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const doc = await loadingTask.promise;

  try {
    const page = await doc.getPage(1);
    const textContent = await page.getTextContent({
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    });
    const items = textContent.items as TextItem[];
    const lines = groupIntoLines(items);

    // Nájdeme riadok s hlavičkou tabuľky
    let columnsMeta: { headers: string[]; columns: number[] } | null = null;
    for (const ln of lines.slice(0, 20)) {
      columnsMeta = inferColumnsFromHeader(ln, expectedHeaders);
      if (columnsMeta) break;
    }

    // Fallback zhlukovanie, ak sa hlavička nenašla
    if (!columnsMeta) {
      const cols = deriveColumnsByClustering(lines, expectedHeaders.length);
      columnsMeta = { headers: expectedHeaders, columns: cols };
    }

    // Fallback kľúčové slová, ak sa zistil menší počet stĺpcov
    if (columnsMeta.columns.length < expectedHeaders.length) {
      const cols = buildColumnsWithKeywords(lines, expectedHeaders.length);
      columnsMeta = { headers: expectedHeaders, columns: cols };
    }

    // Uistíme sa, že máme presný počet stĺpcov
    columnsMeta = ensureColumnCount(
      columnsMeta,
      expectedHeaders.length,
      expectedHeaders
    );

    // Poskladáme riadky tabuľky
    const rows: string[][] = [];
    for (const ln of lines) {
      const row = new Array(expectedHeaders.length).fill("");
      for (const w of ln.words) {
        const col = columnIndexByBounds(w.x, columnsMeta.columns);
        if (col >= 0 && col < row.length) {
          row[col] = row[col] ? `${row[col]} ${w.text}` : w.text;
        }
      }
      const joined = row.map((c) => (c || "").trim());
      if (joined.some((c) => c.length > 0)) {
        rows.push(joined);
      }
    }

    return {
      headers: columnsMeta.headers,
      columns: columnsMeta.columns,
      rows,
    };
  } finally {
    doc.cleanup();
  }
}

function parseSkDate(d: string): Date | null {
  const m = d?.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const year = Number(m[3]);
  const dt = new Date(Date.UTC(year, month, day));
  return isNaN(dt.getTime()) ? null : dt;
}

export async function parseMenuFromPDF(buffer: Buffer, text: string) {
  const table = await extractTable(buffer);
  const { days } = tableToMenu(table);

  const weekRangeMatch = text.match(
    /od (\d{1,2}\.\d{1,2}\.\d{4}) do (\d{1,2}\.\d{1,2}\.\d{4})/i
  );
  const weekRange = weekRangeMatch
    ? `${weekRangeMatch[1]} - ${weekRangeMatch[2]}`
    : "";
  const facility = text.match(/Názov\s*:\s*([^\n]+)/i)?.[1]?.trim() || "";

  const allDates = [...text.matchAll(/(\d{1,2}\.\d{1,2}\.\d{4})/g)].map(
    (m) => m[1]
  );
  const dayDates = allDates.slice(2, 7);
  const energies = [...text.matchAll(/(\d{4})\s*\/\s*(\d{4})\s*\(kJ\)/g)].map(
    (m) => `${m[1]}/${m[2]} kJ`
  );

  const visualDays = days;
  const orderedDays: DayMenu[] = [];
  const fallbackNames = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok"];

  function createDay(): DayMenu {
    return {
      date: "",
      dayName: "",
      energyValues: "",
      breakfast: { items: [] },
      lunch: { items: [] },
      snack: { items: [] },
    };
  }

  for (let i = 0; i < 5; i++) {
    const vd = visualDays[i] || createDay();
    vd.date = dayDates[i] || vd.date || "";
    if (!vd.energyValues && energies[i]) vd.energyValues = energies[i];
    vd.dayName = fallbackNames[i] || vd.dayName || "";
    orderedDays.push(vd);
  }

  const slovakDayNames = [
    "Nedeľa",
    "Pondelok",
    "Utorok",
    "Streda",
    "Štvrtok",
    "Piatok",
    "Sobota",
  ];

  for (const d of orderedDays) {
    if (d.date) {
      const dt = parseSkDate(d.date);
      if (dt) {
        const wd = dt.getUTCDay();
        d.dayName = slovakDayNames[wd];
      }
    }
  }

  return {
    weekRange,
    facility,
    days: orderedDays,
    allergenLegend: text.match(/ALERGÉNY:([^\n]+)/i)?.[1]?.trim() || "",
    notes: text.match(/Zmena jedálneho lístka[^\n]*/i)?.[0] || "",
    chef: text.match(/Vedúci\s*:\s*([^\n]+)/i)?.[1]?.trim(),
    headChef: text.match(/Hlavný kuchár\s*:\s*([^\n]+)/i)?.[1]?.trim(),
  };
}
