export function splitAllergens(cell: string): { digits: string; spill: string } {
  const cellStr = (cell || "").trim();
  const allergenMatch = cellStr.match(/^(\d+(?:\s*,\s*\d+)*)/);
  const digits = allergenMatch
    ? allergenMatch[1]
        .replace(/\s+/g, "")
        .replace(/,{2,}/g, ",")
        .replace(/^,|,$/g, "")
    : "";

  const spill = allergenMatch
    ? cellStr.substring(allergenMatch[0].length).trim()
    : cellStr.replace(/[0-9,]/g, "").replace(/\s{2,}/g, " ").trim();

  return { digits, spill };
}

export function cleanHM(hm: string): string {
  const hmStr = (hm || "").trim();
  const hmMatch = hmStr.match(/^(\d{1,4}(\s*\/\s*\d{1,4})?)/);
  return hmMatch
    ? hmMatch[1].replace(/\s+/g, "")
    : hmStr.replace(/[^0-9\/]/g, "").trim();
}

export function getRowCol(row: string[], idx: number): string {
  if (idx < 0 || idx >= row.length) return "";
  return row[idx] || "";
}

