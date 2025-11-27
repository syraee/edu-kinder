import type { Line } from "./pdf-layout";

export function inferColumnsFromHeader(
  line: Line,
  expectedHeaders: string[]
): { headers: string[]; columns: number[] } | null {
  const headerText = line.words.map((w) => w.text.trim()).join(" ");
  const normalized = headerText.replace(/\s+/g, " ").toLowerCase();
  const required = ["dátum", "desiata", "obed", "olovrant"];
  if (!required.every((k) => normalized.includes(k))) {
    return null;
  }

  const columns: number[] = [];
  const headers: string[] = [];
  for (const w of line.words) {
    const label = w.text.trim();
    if (!label) continue;
    const exists = columns.findIndex((x) => Math.abs(x - w.x) < 10);
    if (exists >= 0) {
      if (label && !headers[exists].includes(label)) {
        headers[exists] += " " + label;
      }
      continue;
    }
    columns.push(w.x);
    headers.push(label);
  }

  const pairs = columns
    .map((x, i) => ({ x, h: headers[i] }))
    .sort((a, b) => a.x - b.x);
  return { headers: pairs.map((p) => p.h), columns: pairs.map((p) => p.x) };
}

export function deriveColumnsByClustering(lines: Line[], k: number): number[] {
  const buckets = new Map<number, { sumX: number; count: number }>();
  for (const ln of lines) {
    for (const w of ln.words) {
      const bin = Math.round(w.x / 2) * 2;
      const prev = buckets.get(bin) || { sumX: 0, count: 0 };
      prev.sumX += w.x;
      prev.count += 1;
      buckets.set(bin, prev);
    }
  }

  const entries = Array.from(buckets.entries()).sort((a, b) => a[0] - b[0]);
  const clusters: { xs: number[]; count: number }[] = [];
  for (const [, agg] of entries) {
    const x = agg.sumX / agg.count;
    const last = clusters[clusters.length - 1];
    if (last && Math.abs(last.xs[last.xs.length - 1] - x) <= 12) {
      last.xs.push(x);
      last.count += agg.count;
    } else {
      clusters.push({ xs: [x], count: agg.count });
    }
  }

  return clusters
    .map((c) => ({
      x: c.xs.reduce((s, v) => s + v, 0) / c.xs.length,
      count: c.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, k)
    .sort((a, b) => a.x - b.x)
    .map((c) => c.x);
}

export function buildColumnsWithKeywords(
  lines: Line[],
  desired: number
): number[] {
  const keywordXs: number[] = [];
  const pushX = (x: number) => {
    if (!keywordXs.some((v) => Math.abs(v - x) < 8)) keywordXs.push(x);
  };

  const HEADER_KEYWORDS = ["dátum", "desiata", "obed", "olovrant"];
  for (const ln of lines.slice(0, 60)) {
    for (const w of ln.words) {
      const t = (w.text || "").trim().toLowerCase();
      if (!t) continue;
      if (HEADER_KEYWORDS.includes(t) || t === "hm" || t === "al") {
        pushX(w.x);
      }
    }
  }

  const centers = deriveColumnsByClustering(lines, desired);
  const all = [...keywordXs, ...centers];
  const uniq: number[] = [];
  for (const x of all.sort((a, b) => a - b)) {
    if (!uniq.some((v) => Math.abs(v - x) < 8)) uniq.push(x);
  }

  // Ak je stĺpcov priveľa, skomprimuj najmenšie medzery
  while (uniq.length > desired) {
    let minGap = Infinity;
    let idx = 0;
    for (let i = 1; i < uniq.length; i++) {
      const gap = Math.abs(uniq[i] - uniq[i - 1]);
      if (gap < minGap) {
        minGap = gap;
        idx = i;
      }
    }
    if (idx > 0) {
      const merged = (uniq[idx] + uniq[idx - 1]) / 2;
      uniq.splice(idx - 1, 2, merged);
    } else {
      uniq.shift();
    }
  }

  // Ak je stĺpcov primalo, doplň najväčšie medzery
  while (uniq.length < desired && uniq.length >= 2) {
    let maxGap = -1;
    let at = 1;
    for (let i = 1; i < uniq.length; i++) {
      const gap = uniq[i] - uniq[i - 1];
      if (gap > maxGap) {
        maxGap = gap;
        at = i;
      }
    }
    const mid = (uniq[at] + uniq[at - 1]) / 2;
    uniq.splice(at, 0, mid);
  }

  return uniq.slice(0, desired);
}

export function ensureColumnCount(
  columnsMeta: { headers: string[]; columns: number[] },
  expectedCount: number,
  expectedHeaders: string[]
): { headers: string[]; columns: number[] } {
  if (columnsMeta.columns.length >= expectedCount) {
    return columnsMeta;
  }

  const currentCols = [...columnsMeta.columns];
  const currentHeaders = [...columnsMeta.headers];

  while (currentCols.length < expectedCount) {
    let maxGap = -1;
    let insertAt = 1;
    for (let i = 1; i < currentCols.length; i++) {
      const gap = currentCols[i] - currentCols[i - 1];
      if (gap > maxGap) {
        maxGap = gap;
        insertAt = i;
      }
    }
    const midpoint = (currentCols[insertAt] + currentCols[insertAt - 1]) / 2;
    currentCols.splice(insertAt, 0, midpoint);
    currentHeaders.splice(insertAt, 0, expectedHeaders[insertAt] || "");
  }

  return {
    headers: currentHeaders.slice(0, expectedCount),
    columns: currentCols.slice(0, expectedCount),
  };
}

export type ColumnIndices = {
  date: number;
  breakfast: number;
  breakfastHM: number;
  breakfastAL: number;
  lunch: number;
  lunchHM: number;
  lunchAL: number;
  snack: number;
  snackHM: number;
  snackAL: number;
};

function findColumnIndex(headers: string[], searchTerms: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const header = (headers[i] || "").toLowerCase();
    if (searchTerms.some((term) => header.includes(term.toLowerCase()))) {
      return i;
    }
  }
  return -1;
}

export function detectColumnIndices(headers: string[]): ColumnIndices {
  const colIndex: ColumnIndices = {
    date:
      findColumnIndex(headers, ["dátum"]) >= 0
        ? findColumnIndex(headers, ["dátum"])
        : 0,
    breakfast:
      findColumnIndex(headers, ["desiata"]) >= 0
        ? findColumnIndex(headers, ["desiata"])
        : 1,
    breakfastHM: -1,
    breakfastAL: -1,
    lunch:
      findColumnIndex(headers, ["obed"]) >= 0
        ? findColumnIndex(headers, ["obed"])
        : 4,
    lunchHM: -1,
    lunchAL: -1,
    snack:
      findColumnIndex(headers, ["olovrant"]) >= 0
        ? findColumnIndex(headers, ["olovrant"])
        : 7,
    snackHM: -1,
    snackAL: -1,
  };

  // Nájdeme všetky stĺpce označené HM/AL
  const allHMColumns: number[] = [];
  const allALColumns: number[] = [];
  for (let i = 0; i < headers.length; i++) {
    const h = (headers[i] || "").toLowerCase().trim();
    if (h === "hm") allHMColumns.push(i);
    if (h === "al") allALColumns.push(i);
  }

  // Namapujeme HM/AL na jednotlivé sekcie jedla
  const breakfastIdx = colIndex.breakfast;
  const lunchIdx = colIndex.lunch;
  const snackIdx = colIndex.snack;

  if (breakfastIdx >= 0 && lunchIdx >= 0) {
    for (let i = breakfastIdx + 1; i < lunchIdx && i < headers.length; i++) {
      if (allHMColumns.includes(i) && colIndex.breakfastHM < 0)
        colIndex.breakfastHM = i;
      if (allALColumns.includes(i) && colIndex.breakfastAL < 0)
        colIndex.breakfastAL = i;
    }
  }

  if (lunchIdx >= 0 && snackIdx >= 0) {
    for (let i = lunchIdx + 1; i < snackIdx && i < headers.length; i++) {
      if (allHMColumns.includes(i) && colIndex.lunchHM < 0)
        colIndex.lunchHM = i;
      if (allALColumns.includes(i) && colIndex.lunchAL < 0)
        colIndex.lunchAL = i;
    }
  }

  if (snackIdx >= 0) {
    for (let i = snackIdx + 1; i < headers.length; i++) {
      if (allHMColumns.includes(i) && colIndex.snackHM < 0)
        colIndex.snackHM = i;
      if (allALColumns.includes(i) && colIndex.snackAL < 0)
        colIndex.snackAL = i;
    }
  }

  // Použi overené štandardné pozície HM/AL stĺpcov
  colIndex.breakfastHM = 2;
  colIndex.breakfastAL = 3;
  colIndex.lunchHM = 5;
  colIndex.lunchAL = 6;
  colIndex.snackHM = 8;
  colIndex.snackAL = 9;

  return colIndex;
}
