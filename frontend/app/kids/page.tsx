"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

type Group = {
  id: number;
  name: string;
  class: string;
  roomName: string;
};

type Child = {
  id: number;
  firstName: string;
  lastName: string;
  groupName: string;
  className: string;
  classYear?: string | null;
};

export default function StudentsPage() {
  const [classes, setClasses] = useState<Group[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeClass, setActiveClass] = useState<string>("Všetci");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [groupsRes, childrenRes] = await Promise.all([
          fetch(`${API_BASE}/group`, { credentials: "include" }),
          fetch(`${API_BASE}/child`, { credentials: "include" }),
        ]);

        const groupsData = await groupsRes.json();
        const childrenData = await childrenRes.json();

        if (groupsData?.success) setClasses(groupsData.data);
        if (childrenData?.success) setChildren(childrenData.data);
      } catch (err) {
        console.error("Chyba pri načítaní dát:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filtered =
    activeClass === "Všetci"
      ? children
      : children.filter((c) => c.groupName === activeClass);

  return (
    <>
      <Header />

      <div className="govuk-width-container idsk-students" style={{ marginTop: "2rem" }}>
        <h1 className="govuk-heading-xl">Deti</h1>

        <div className="actions">
          <Link href="/kids-form" className="govuk-button" role="button" data-module="govuk-button">
            Pridať dieťa
          </Link>
          <Link href="/class-form" className="govuk-button" role="button" data-module="govuk-button">
            Vytvoriť triedu
          </Link>
        </div>

        <div className="idsk-tabs">
          <ul className="idsk-tabs__list">
            <li
              key="Všetci"
              className={`idsk-tabs__list-item ${activeClass === "Všetci" ? "idsk-tabs__list-item--selected" : ""}`}
              onClick={() => setActiveClass("Všetci")}
            >
              <button className="idsk-tabs__tab">Všetci</button>
            </li>
            {classes.map((cls) => (
              <li
                key={cls.id}
                className={`idsk-tabs__list-item ${activeClass === cls.name ? "idsk-tabs__list-item--selected" : ""}`}
                onClick={() => setActiveClass(cls.name)}
              >
                <button className="idsk-tabs__tab">{cls.name}</button>
              </li>
            ))}
          </ul>
        </div>

        {loading ? (
          <p>Načítavam dáta...</p>
        ) : filtered.length === 0 ? (
          <p>Zatiaľ neboli pridané žiadne deti.</p>
        ) : (
          <div className="students-grid">
            {filtered.map((child) => (
              <div key={child.id} className="student-card govuk-!-margin-top-4">
                <div className="student-card__header">
                  <h2 className="govuk-heading-m">
                    {child.firstName} {child.lastName}
                  </h2>
                </div>
                <div className="student-card__body">
                  <p><b>Trieda:</b> {child.groupName}</p>
                  <p><b>Ročník:</b> {child.className}</p>
                </div>
                <div className="student-card__actions">
                  <button className="govuk-button govuk-button--secondary">Detail</button>
                  <button className="govuk-button govuk-button--warning">Upraviť</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
