"use client";

import { useState } from "react";
import Header from '@/app/components/Header';
import Link from "next/link";

type Child = {
  id: number;
  name: string;
  age: number;
  class: string;
  group: string;
};

export default function StudentsPage() {
  const [activeClass, setActiveClass] = useState("Všetci");
  const classes = ["Všetci", "Včielky", "Lienky", "Motýliky"];

  const children: Child[] = [
    { id: 1, name: "Adam Novák", age: 5, class: "Včielky", group: "A" },
    { id: 2, name: "Ema Horváthová", age: 6, class: "Včielky", group: "B" },
    { id: 3, name: "Janko Mrkvička", age: 5, class: "Lienky", group: "A" },
    { id: 4, name: "Laura Kováčová", age: 4, class: "Lienky", group: "A" },
    { id: 5, name: "Nina Sládková", age: 6, class: "Motýliky", group: "B" },
  ];

 
  const filtered =
    activeClass === "Všetci"
      ? children
      : children.filter((c) => c.class === activeClass);

  return (
    <>
      <Header />

      <div className="govuk-width-container idsk-students" style={{ marginTop: "2rem" }}>
        <h1 className="govuk-heading-xl">Deti</h1>
        <Link href="/kids-form" className="govuk-button" role="button" data-module="govuk-button">
                Pridať dieťa
            </Link>
        {/* Tabs pre triedy */}
        <div className="idsk-tabs">
          <ul className="idsk-tabs__list">
            {classes.map((cls) => (
              <li
                key={cls}
                className={`idsk-tabs__list-item ${
                  activeClass === cls ? "idsk-tabs__list-item--selected" : ""
                }`}
                onClick={() => setActiveClass(cls)}
              >
                <button className="idsk-tabs__tab">{cls}</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Zoznam deti */}
        <div className="students-grid">
          {filtered.map((child) => (
            <div key={child.id} className="student-card govuk-!-margin-top-4">
              <div className="student-card__header">
                <h2 className="govuk-heading-m">{child.name}</h2>
              </div>
              <div className="student-card__body">
                <p><b>Vek:</b> {child.age} rokov</p>
                <p><b>Trieda:</b> {child.class}</p>
                <p><b>Skupina:</b> {child.group}</p>
              </div>
              <div className="student-card__actions">
                <button className="govuk-button govuk-button--secondary">Detail</button>
                <button className="govuk-button govuk-button--warning">Upraviť</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
