"use client";

import { useState } from "react";
import Header from "@/app/components/Header";

type Announcement = {
  id: number;
  title: string;
  date: string;
  content: string;
};

export default function AnnouncementsPage() {
  const [announcements] = useState<Announcement[]>([
    {
      id: 1,
      title: "Zatvorenie škôlky počas sviatkov",
      date: "24. december 2025",
      content: "Materská škola bude zatvorená od 24. 12. 2025 do 6. 1. 2026 z dôvodu vianočných sviatkov.",
    },
    {
      id: 2,
      title: "Fotografovanie detí",
      date: "15. november 2025",
      content: "Prosíme rodičov, aby priniesli deťom oblečenie na fotografovanie do 13. 11. 2025.",
    },
    {
      id: 3,
      title: "Jesenné tvorivé dielne",
      date: "7. október 2025",
      content: "Pozývame rodičov na spoločné jesenné tvorivé dielne, ktoré sa uskutočnia o 15:30 v triede Včielky.",
    },
  ]);

  return (
    <>
      <Header />
      <div className="govuk-width-container" style={{ marginTop: "2rem" }}>
        <div className="announcements-header">
          <h1 className="govuk-heading-xl">Oznamy</h1>
          <button className="govuk-button" role="button" data-module="govuk-button">
            Pridať oznam
          </button>
        </div>

        <div className="announcements-grid">
          {announcements.map((a) => (
            <div key={a.id} className="announcement-card govuk-!-margin-top-4">
              <div className="announcement-card__header">
                <h2 className="govuk-heading-m">{a.title} - {a.date}</h2>
              </div>
              <p className="govuk-body">{a.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
