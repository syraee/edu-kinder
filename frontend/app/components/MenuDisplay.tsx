"use client";
import { useEffect, useState } from "react";
import type { MenuData, DayMenu, MealSection } from "../api/menu/route";

interface MenuDisplayProps {
  pdfUrl: string;
}

export default function MenuDisplay({ pdfUrl }: MenuDisplayProps) {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/menu?url=${encodeURIComponent(pdfUrl)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch menu");
        }

        setMenuData(data);
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError(err instanceof Error ? err.message : "Failed to load menu");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [pdfUrl]);

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
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="govuk-link"
              >
                Otvoriť pôvodný PDF súbor
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-display">
      {/* Menu Table */}
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

      {/* Footer Information */}
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
          {/* Date cell - only show on first row */}
          {rowIndex === 0 && (
            <td rowSpan={maxRows} className="menu-date-cell">
              <div className="menu-date-content">
                <strong>{day.dayName}</strong>
                <div>{day.date}</div>
                <small>{day.energyValues}</small>
              </div>
            </td>
          )}

          {/* Breakfast */}
          <td className="menu-dish-cell">
            {day.breakfast.items[rowIndex]?.name || ""}
          </td>
          <td className="menu-portion-cell">
            {day.breakfast.items[rowIndex]?.portion || ""}
          </td>
          <td className="menu-allergen-cell">
            {day.breakfast.items[rowIndex]?.allergens || ""}
          </td>

          {/* Lunch */}
          <td className="menu-dish-cell">
            {day.lunch.items[rowIndex]?.name || ""}
          </td>
          <td className="menu-portion-cell">
            {day.lunch.items[rowIndex]?.portion || ""}
          </td>
          <td className="menu-allergen-cell">
            {day.lunch.items[rowIndex]?.allergens || ""}
          </td>

          {/* Snack */}
          <td className="menu-dish-cell">
            {day.snack.items[rowIndex]?.name || ""}
          </td>
          <td className="menu-portion-cell">
            {day.snack.items[rowIndex]?.portion || ""}
          </td>
          <td className="menu-allergen-cell">
            {day.snack.items[rowIndex]?.allergens || ""}
          </td>
        </tr>
      ))}
    </>
  );
}
