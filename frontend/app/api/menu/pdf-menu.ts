import type { Table } from "./pdf-layout";
import type { ColumnIndices } from "./pdf-columns";
import type { DayMenu, MealItem } from "./types";
import { detectColumnIndices } from "./pdf-columns";
import { splitAllergens, cleanHM, getRowCol } from "./pdf-parsers";

export type MealSection = "breakfast" | "lunch" | "snack";

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

function attachAllergenToItem(
  items: MealItem[],
  allergens: string,
  section: MealSection,
  pending: Record<MealSection, { portion?: string; allergens?: string }>
): boolean {
  if (!allergens.trim()) return false;

  // Nájde najnovšiu položku bez alergénov
  for (let i = items.length - 1; i >= 0; i--) {
    if (!items[i].allergens || !items[i].allergens.trim()) {
      items[i].allergens = allergens;
      return true;
    }
  }

  // Všetky položky už majú alergény – ulož do fronty pre nasledujúcu položku
  pending[section].allergens = allergens;
  return false;
}

function processMealItem(
  section: MealSection,
  name: string,
  portion: string,
  allergens: string,
  currentDay: DayMenu,
  lastItemRef: Record<MealSection, MealItem | undefined>,
  pending: Record<MealSection, { portion?: string; allergens?: string }>
): string {
  const cleanedName = (name || "").trim();
  const portionClean = (portion || "").trim();
  const { digits, spill } = splitAllergens(allergens || "");

  const isSectionLabel = ["desiata", "obed", "olovrant"].includes(
    cleanedName.toLowerCase()
  );
  if (isSectionLabel && !portionClean && !digits) {
    return spill;
  }

  if (cleanedName && !isSectionLabel) {
    const finalPortion = portionClean || pending[section].portion || "";
    const finalAllergens = digits || pending[section].allergens || "";

    const item: MealItem = {
      name: cleanedName,
      portion: finalPortion,
      allergens: finalAllergens,
    };

    currentDay[section].items.push(item);
    lastItemRef[section] = item;

    if (portionClean || digits) {
      pending[section] = {};
    } else if (pending[section].portion || pending[section].allergens) {
      pending[section] = {};
    }
    return spill;
  }

  // Bez názvu, ale máme HM/AL -> pripoj k predchádzajúcej položke
  const hasData = !!portionClean || !!digits;
  if (hasData && lastItemRef[section]) {
    if (
      portionClean &&
      (!lastItemRef[section]!.portion || !lastItemRef[section]!.portion.trim())
    ) {
      lastItemRef[section]!.portion = portionClean;
    }

    if (digits && digits.trim()) {
      const lastItemHasAL =
        lastItemRef[section]!.allergens &&
        lastItemRef[section]!.allergens.trim();

      if (!lastItemHasAL) {
        lastItemRef[section]!.allergens = digits;
      } else {
        attachAllergenToItem(
          currentDay[section].items,
          digits,
          section,
          pending
        );
      }
    }
    return spill;
  }

  // Ulož HM/AL do zásobníka, ak zatiaľ nemáme žiadnu položku
  if (hasData && !lastItemRef[section]) {
    if (portionClean) pending[section].portion = portionClean;
    if (digits) pending[section].allergens = digits;
  }
  return spill;
}

function isHeaderOnlyRow(
  row: string[],
  colIndex: ColumnIndices,
  getRowCol: (row: string[], idx: number) => string
): boolean {
  const rowText = row.join(" ").toLowerCase();
  return (
    (!getRowCol(row, colIndex.date) ||
      !getRowCol(row, colIndex.date).match(/\d/)) &&
    (rowText.includes("hm") || rowText.includes("al")) &&
    !getRowCol(row, colIndex.breakfast).trim() &&
    !getRowCol(row, colIndex.lunch).trim() &&
    !getRowCol(row, colIndex.snack).trim() &&
    (rowText.includes("dátum") ||
      rowText.includes("desiata") ||
      rowText.includes("obed") ||
      rowText.includes("olovrant"))
  );
}

function normalizeSection(items: MealItem[]): MealItem[] {
  const out: MealItem[] = [];
  let pendingPortion: string | null = null;
  let pendingAllergens: string | null = null;

  for (const it of items) {
    const rawName = (it.name || "").trim();
    let hasName = rawName.length > 0;
    const hasData =
      (it.portion && it.portion.trim()) ||
      (it.allergens && it.allergens.trim());
    const isSectionLabel = ["desiata", "obed", "olovrant"].includes(
      rawName.toLowerCase()
    );

    if (isSectionLabel) hasName = false;

    if (!hasName && hasData && out.length > 0) {
      const prev = out[out.length - 1];
      if (it.portion && (!prev.portion || !prev.portion.trim())) {
        prev.portion = it.portion;
      }
      if (it.allergens && it.allergens.trim()) {
        if (!prev.allergens || !prev.allergens.trim()) {
          prev.allergens = it.allergens;
        } else {
          // Nájde najnovšiu položku bez alergénov
          for (let j = out.length - 1; j >= 0; j--) {
            if (!out[j].allergens || !out[j].allergens.trim()) {
              out[j].allergens = it.allergens;
              break;
            }
          }
        }
      }
      continue;
    }

    if (!hasName) {
      if (it.portion && it.portion.trim()) pendingPortion = it.portion.trim();
      if (it.allergens && it.allergens.trim())
        pendingAllergens = it.allergens.trim();
      continue;
    }

    if (pendingPortion && (!it.portion || !it.portion.trim())) {
      it.portion = pendingPortion;
    }
    if (pendingAllergens && (!it.allergens || !it.allergens.trim())) {
      it.allergens = pendingAllergens;
    }
    pendingPortion = null;
    pendingAllergens = null;
    out.push(it);
  }

  return out;
}

function mergeDaysByDate(days: DayMenu[]): DayMenu[] {
  const merged: DayMenu[] = [];
  for (const d of days) {
    const last = merged[merged.length - 1];
    if (last && d.date && last.date === d.date) {
      last.breakfast.items.push(...d.breakfast.items);
      last.lunch.items.push(...d.lunch.items);
      last.snack.items.push(...d.snack.items);
      if (!last.dayName && d.dayName) last.dayName = d.dayName;
      if (!last.energyValues && d.energyValues)
        last.energyValues = d.energyValues;
    } else {
      merged.push(d);
    }
  }
  return merged;
}

export function tableToMenu(table: Table): { days: DayMenu[] } {
  const colIndex = detectColumnIndices(table.headers);
  const dayNames = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok"];
  const days: DayMenu[] = [];

  let currentDay: DayMenu | null = null;
  let currentDate: string | null = null;
  let lastItemRef: Record<MealSection, MealItem | undefined> = {
    breakfast: undefined,
    lunch: undefined,
    snack: undefined,
  };
  let pending: Record<MealSection, { portion?: string; allergens?: string }> = {
    breakfast: {},
    lunch: {},
    snack: {},
  };

  for (const row of table.rows) {
    if (isHeaderOnlyRow(row, colIndex, getRowCol)) continue;

    const maybeDate = getRowCol(row, colIndex.date);
    const dateMatch = maybeDate?.match(/(\d{1,2}\.\d{1,2}\.\d{4})/);
    const dateStr = dateMatch ? dateMatch[1] : null;
    const dayNameFromCell = dayNames.find((d) => maybeDate?.includes(d)) || "";
    const signalsNewDay =
      (dateStr && dateStr !== currentDate && !!currentDay) || false;

    if (!currentDay) {
      const hasAnyMealContent = Boolean(
        getRowCol(row, colIndex.breakfast).trim() ||
          getRowCol(row, colIndex.lunch).trim() ||
          getRowCol(row, colIndex.snack).trim()
      );
      if (hasAnyMealContent || dateStr || dayNameFromCell) {
        currentDay = createDay();
        currentDay.date = dateStr || "";
        currentDay.dayName = dayNameFromCell;
        currentDate = dateStr || null;
        lastItemRef = {
          breakfast: undefined,
          lunch: undefined,
          snack: undefined,
        };
      }
    }

    if (signalsNewDay) {
      if (currentDay) days.push(currentDay);
      currentDate = dateStr || currentDate;
      currentDay = createDay();
      currentDay.date = dateStr || "";
      currentDay.dayName = dayNameFromCell;
      lastItemRef = {
        breakfast: undefined,
        lunch: undefined,
        snack: undefined,
      };
      pending = { breakfast: {}, lunch: {}, snack: {} };
    }

    if (!currentDay) continue;

    if (!currentDay.date && dateStr) currentDay.date = dateStr;
    if (!currentDay.dayName && dayNameFromCell)
      currentDay.dayName = dayNameFromCell;

    // Extrahovanie a čistenie hodnôt z riadku
    const breakfastName = getRowCol(row, colIndex.breakfast);
    const breakfastHM = cleanHM(getRowCol(row, colIndex.breakfastHM));
    const { digits: breakfastALDigits, spill: breakfastALSpill } =
      splitAllergens(getRowCol(row, colIndex.breakfastAL));

    const lunchName = getRowCol(row, colIndex.lunch);
    const lunchHM = cleanHM(getRowCol(row, colIndex.lunchHM));
    const { digits: lunchALDigits, spill: lunchALSpill } = splitAllergens(
      getRowCol(row, colIndex.lunchAL)
    );
    const finalLunchName = lunchName.trim() || breakfastALSpill;

    const snackName = getRowCol(row, colIndex.snack);
    const snackHM = cleanHM(getRowCol(row, colIndex.snackHM));
    const { digits: snackALDigits } = splitAllergens(
      getRowCol(row, colIndex.snackAL)
    );
    const finalSnackName = snackName.trim() || lunchALSpill;

    // Spracovanie jedál
    const spillB = processMealItem(
      "breakfast",
      breakfastName,
      breakfastHM,
      breakfastALDigits,
      currentDay,
      lastItemRef,
      pending
    );

    const spillL = processMealItem(
      "lunch",
      finalLunchName,
      lunchHM,
      lunchALDigits,
      currentDay,
      lastItemRef,
      pending
    );

    // Alergény k obedu na samostatnom riadku
    if (!finalLunchName.trim() && lunchALDigits.trim() && lastItemRef.lunch) {
      const lastItemHasAL =
        lastItemRef.lunch.allergens && lastItemRef.lunch.allergens.trim();
      if (!lastItemHasAL) {
        lastItemRef.lunch.allergens = lunchALDigits;
      } else {
        attachAllergenToItem(
          currentDay.lunch.items,
          lunchALDigits,
          "lunch",
          pending
        );
      }
    }

    const spillS = processMealItem(
      "snack",
      finalSnackName,
      snackHM,
      snackALDigits,
      currentDay,
      lastItemRef,
      pending
    );

    // Pretečený text z AL stĺpcov presuň do nasledujúcej sekcie
    if (spillB && !getRowCol(row, colIndex.lunch)) {
      currentDay.lunch.items.push({
        name: spillB,
        portion: "",
        allergens: "",
      });
    }
    if (spillL && !getRowCol(row, colIndex.snack)) {
      currentDay.snack.items.push({
        name: spillL,
        portion: "",
        allergens: "",
      });
    }
  }

  if (currentDay) days.push(currentDay);

  const merged = mergeDaysByDate(days);
  const filtered = merged.filter(
    (d) =>
      (d.breakfast.items && d.breakfast.items.length) ||
      (d.lunch.items && d.lunch.items.length) ||
      (d.snack.items && d.snack.items.length)
  );

  for (const d of filtered) {
    d.breakfast.items = normalizeSection(d.breakfast.items || []);
    d.lunch.items = normalizeSection(d.lunch.items || []);
    d.snack.items = normalizeSection(d.snack.items || []);
  }

  return { days: filtered };
}
