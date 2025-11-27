"use client";
import { useEffect, useState } from "react";
import type { MenuData, DayMenu, MealItem } from "../api/menu/types";

interface MenuDisplayProps {
  autoFetch?: boolean;
  sourceUrl?: string;
}

export default function MenuDisplay({
  autoFetch = false,
  sourceUrl,
}: MenuDisplayProps) {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPdfInfo, setSelectedPdfInfo] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = sourceUrl
          ? `/api/menu?source=${encodeURIComponent(sourceUrl)}`
          : `/api/menu`;
        const response = await fetch(url, { cache: "no-store" });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch menu");
        }

        setMenuData(data);

        if (data.selectedPdf) {
          setSelectedPdfInfo(data.selectedPdf.label);
        }
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError(err instanceof Error ? err.message : "Failed to load menu");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [autoFetch, sourceUrl]);

  if (loading) {
    return (
      <div className="menu-loading">
        <div className="govuk-body">
          <span className="material-icons" style={{ verticalAlign: "middle" }}>
            hourglass_empty
          </span>{" "}
          Načítavam jedálny lístok...
        </div>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="menu-error">
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">
            Nepodarilo sa načítať jedálny lístok
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error || "Neznáma chyba"}</p>
            <p className="govuk-body">
              {menuData?.pdfUrl && (
                <a
                  href={menuData.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="govuk-link"
                >
                  Otvoriť pôvodný PDF súbor
                </a>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-display">
      {selectedPdfInfo && (
        <div className="govuk-notification-banner" role="region">
          <div className="govuk-notification-banner__content">
            <p className="govuk-body">
              <span
                className="material-icons"
                style={{ verticalAlign: "middle", fontSize: "1.2em" }}
              >
                calendar_today
              </span>{" "}
              Zobrazený jedálny lístok: <strong>{selectedPdfInfo}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Tabuľka jedálneho lístka */}
      <div className="menu-table-container">
        <table className="menu-table">
          <thead>
            <tr>
              <th>Dátum</th>
              <th>Desiata</th>
              <th>HM</th>
              <th>AL</th>
              <th>Obed</th>
              <th>HM</th>
              <th>AL</th>
              <th>Olovrant</th>
              <th>HM</th>
              <th>AL</th>
            </tr>
          </thead>
          <tbody>
            {menuData.days.map((day, index) => (
              <DayRow key={index} day={day} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pätička s informáciami */}
      {menuData.allergenLegend && (
        <div className="menu-footer">
          <div className="govuk-inset-text">
            <strong>ALERGÉNY:</strong> {menuData.allergenLegend}
          </div>
        </div>
      )}
    </div>
  );
}

function MealCell({ item }: { item?: MealItem }) {
  return (
    <>
      <td className="menu-dish-cell">{item?.name || ""}</td>
      <td className="menu-portion-cell">{item?.portion || ""}</td>
      <td className="menu-allergen-cell">{item?.allergens || ""}</td>
    </>
  );
}

function DayRow({ day }: { day: DayMenu }) {
  const maxRows = Math.max(
    day.breakfast.items.length,
    day.lunch.items.length,
    day.snack.items.length,
    1
  );

  return (
    <>
      {Array.from({ length: maxRows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {rowIndex === 0 && (
            <td rowSpan={maxRows} className="menu-date-cell">
              <div className="menu-date-content">
                <strong>{day.dayName}</strong>
                <div>{day.date}</div>
                <small>{day.energyValues}</small>
              </div>
            </td>
          )}

          <MealCell item={day.breakfast.items[rowIndex]} />
          <MealCell item={day.lunch.items[rowIndex]} />
          <MealCell item={day.snack.items[rowIndex]} />
        </tr>
      ))}
    </>
  );
}
