interface MenuItem {
  name: string;
  portion: string;
  allergens: string;
}

export function parseMenuPDF(text: string) {
  // Extrakcia metadát
  const weekRange = text.match(
    /od (\d{1,2}\.\d{1,2}\.\d{4}) do (\d{1,2}\.\d{1,2}\.\d{4})/i
  );
  const facility = text.match(/Názov\s*:\s*([^\n]+)/i)?.[1]?.trim() || "";

  // Extrakcia dátumov a energetických hodnôt
  const allDates = [...text.matchAll(/(\d{1,2}\.\d{1,2}\.\d{4})/g)].map(
    (m) => m[1]
  );
  const dayDates = allDates.slice(2, 7);

  const energies = [...text.matchAll(/(\d{4})\s*\/\s*(\d{4})\s*\(kJ\)/g)].map(
    (m) => `${m[1]}/${m[2]} kJ`
  );

  // Nájdenie hraníc obsahu
  const contentStart =
    text.lastIndexOf(energies[energies.length - 1]) +
    energies[energies.length - 1].length;
  const footerIndex = text.indexOf("DesiataHMALObedHMAL");
  const fullContent = text.substring(
    contentStart,
    footerIndex > 0 ? footerIndex : text.length
  );

  // Parsovanie všetkých položiek z obsahu
  const allItems = parseItems(fullContent);

  // Rozdelenie položiek do 3 sekcií na základe formátu porcií (PODMIENKA 1)
  const sections = splitIntoSections(allItems);

  // Rozdelenie každej sekcie do 5 dní pomocou inteligentnej detekcie (PODMIENKY 2 & 3)
  const dayNames = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok"];
  const daysData = dayNames.map((name, i) => ({
    dayName: name,
    date: dayDates[i] || "",
    energyValues: energies[i] || "",
    breakfast: { items: sections.breakfast[i] || [] },
    lunch: { items: sections.lunch[i] || [] },
    snack: { items: sections.snack[i] || [] },
  }));

  return {
    weekRange: weekRange ? `${weekRange[1]} - ${weekRange[2]}` : "",
    facility,
    days: daysData,
    allergenLegend: text.match(/ALERGÉNY:([^\n]+)/i)?.[1]?.trim() || "",
    notes: text.match(/Zmena jedálneho lístka[^\n]*/i)?.[0] || "",
    chef: text.match(/Vedúci\s*:\s*([^\n]+)/i)?.[1]?.trim(),
    headChef: text.match(/Hlavný kuchár\s*:\s*([^\n]+)/i)?.[1]?.trim(),
  };
}

/**
 * PODMIENKA 1: Detekcia sekcií podľa formátu porcií
 */
function splitIntoSections(items: MenuItem[]) {
  const lunchStart = items.findIndex((item) => item.portion.includes("/"));
  const lunchEnd = items
    .slice()
    .reverse()
    .findIndex((item) => item.portion.includes("/"));
  const lunchEndIndex = lunchEnd >= 0 ? items.length - lunchEnd : items.length;

  const breakfast = items.slice(0, lunchStart);
  const lunch = items.slice(lunchStart, lunchEndIndex);
  const snack = items.slice(lunchEndIndex);

  return {
    breakfast: splitBreakfastSnackIntoDays(breakfast),
    lunch: splitLunchIntoDays(lunch),
    snack: splitBreakfastSnackIntoDays(snack),
  };
}

/**
 * PODMIENKA 2: Rozdelenie dní pre Raňajky/Olovrant pomocou nápojov
 */
function splitBreakfastSnackIntoDays(items: MenuItem[]): MenuItem[][] {
  const days: MenuItem[][] = [[], [], [], [], []];

  // 2.1 - Detekcia nápojov (100-200ml porcie, minimálne alergény)
  const drinkIndices: number[] = [];
  items.forEach((item, i) => {
    const portionNum = parseInt(item.portion.split("/")[0]);
    if (portionNum >= 100 && portionNum <= 200 && item.allergens.length <= 2) {
      drinkIndices.push(i);
    }
  });

  if (drinkIndices.length >= 3) {
    let startIdx = 0;

    // 2.2 - Päť nápojov = perfektné rozdelenie
    if (drinkIndices.length === 5) {
      for (let i = 0; i < 5; i++) {
        days[i] = items.slice(startIdx, drinkIndices[i] + 1);
        startIdx = drinkIndices[i] + 1;
      }
    }
    // 2.3 - Štyri nápoje = určenie ktorý deň nemá nápoj
    else if (drinkIndices.length === 4) {
      const avgSpacing =
        drinkIndices.length > 1
          ? (drinkIndices[drinkIndices.length - 1] - drinkIndices[0]) / 3
          : 3;

      if (drinkIndices[0] >= avgSpacing) {
        // Prvý deň nemá nápoj (napr. pondelok len s cereáliami)
        days[0] = items.slice(0, 1);
        startIdx = 1;
        for (let i = 0; i < 4; i++) {
          days[i + 1] = items.slice(startIdx, drinkIndices[i] + 1);
          startIdx = drinkIndices[i] + 1;
        }
      } else {
        // Posledný deň nemá nápoj
        for (let i = 0; i < 4; i++) {
          days[i] = items.slice(startIdx, drinkIndices[i] + 1);
          startIdx = drinkIndices[i] + 1;
        }
        days[4] = items.slice(startIdx);
      }
    }
    // 2.4 - Tri alebo 6+ nápojov
    else {
      const usedDrinks = Math.min(drinkIndices.length, 5);
      for (let day = 0; day < usedDrinks; day++) {
        days[day] = items.slice(startIdx, drinkIndices[day] + 1);
        startIdx = drinkIndices[day] + 1;
      }
      // Rozdelenie zostávajúcich položiek
      if (startIdx < items.length) {
        const remainingDays = 5 - usedDrinks;
        const itemsPerDay = Math.ceil(
          (items.length - startIdx) / Math.max(remainingDays, 1)
        );
        for (let day = usedDrinks; day < 5; day++) {
          const endIdx = Math.min(startIdx + itemsPerDay, items.length);
          days[day] = items.slice(startIdx, endIdx);
          startIdx = endIdx;
        }
      }
    }
  }
  // 2.5 - Záložné riešenie: rovnomerné rozdelenie
  else {
    const itemsPerDay = Math.ceil(items.length / 5);
    for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
      days[dayIdx] = items.slice(
        dayIdx * itemsPerDay,
        (dayIdx + 1) * itemsPerDay
      );
    }
  }

  return days;
}

/**
 * PODMIENKA 3: Rozdelenie dní pre Obed pomocou príloh + pozície
 */
function splitLunchIntoDays(items: MenuItem[]): MenuItem[][] {
  const days: MenuItem[][] = [[], [], [], [], []];

  // 3.1 - Detekcia koncových príloh (30-100g, bez proteínových alergénov, málo alergénov)
  const boundaryIndices: number[] = [];
  items.forEach((item, i) => {
    if (item.portion.includes("/")) {
      const firstPortion = parseInt(item.portion.split("/")[0]);
      const allergenCount = item.allergens
        ? item.allergens.split(",").length
        : 0;
      const hasProteinAllergens = /4|9/.test(item.allergens);

      if (
        firstPortion >= 30 &&
        firstPortion <= 100 &&
        !hasProteinAllergens &&
        allergenCount <= 2
      ) {
        boundaryIndices.push(i);
      }
    }
  });

  // 3.2 - Hybridný prístup: použitie hraníc príloh + očakávané pozície
  const avgItemsPerDay = items.length / 5;
  let startIdx = 0;
  let dayIdx = 0;
  let boundaryIdx = 0;

  while (dayIdx < 5 && startIdx < items.length) {
    const expectedEnd = Math.round((dayIdx + 1) * avgItemsPerDay) - 1;

    // Nájdenie ďalšej nevyužitej hranice
    while (
      boundaryIdx < boundaryIndices.length &&
      boundaryIndices[boundaryIdx] < startIdx
    ) {
      boundaryIdx++;
    }

    let endIdx;
    if (
      boundaryIdx < boundaryIndices.length &&
      Math.abs(boundaryIndices[boundaryIdx] - expectedEnd) < avgItemsPerDay / 2
    ) {
      // Použitie hranice prílohy ak je blízko očakávanej pozície
      endIdx = boundaryIndices[boundaryIdx] + 1;
      boundaryIdx++;
    } else {
      // Použitie očakávanej pozície
      endIdx = Math.min(expectedEnd + 1, items.length);
    }

    days[dayIdx] = items.slice(startIdx, endIdx);
    startIdx = endIdx;
    dayIdx++;
  }

  // 3.3 - Pridanie zostávajúcich položiek k poslednému dňu
  if (startIdx < items.length && dayIdx > 0) {
    days[dayIdx - 1] = days[dayIdx - 1].concat(items.slice(startIdx));
  }

  return days;
}

/**
 * PODMIENKA 4: Parsovanie položiek s filtrovaním obsahu
 */
function parseItems(text: string): MenuItem[] {
  const items: MenuItem[] = [];
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  const skipPatterns =
    /jedálny|masiarska|strana|dátum|^20\.|^21\.|^22\.|^23\.|^24\.|^č\./i;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (skipPatterns.test(line)) {
      i++;
      continue;
    }

    const match = line.match(/^(.+?)(\d+(?:\/\d+)?)$/);
    if (match) {
      const name = match[1].trim();
      const portion = match[2];

      if (name.length < 3 || /^\d+\.?\d*$/.test(name)) {
        i++;
        continue;
      }

      let allergens = "";
      if (i + 1 < lines.length && /^[\d,\.]+$/.test(lines[i + 1])) {
        allergens = lines[i + 1];
        i++;
      }

      items.push({ name, portion, allergens });
    }
    i++;
  }

  return items;
}
