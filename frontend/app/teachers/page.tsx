"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Link from "next/link";

const FRONT_API_BASE = process.env.BACKEND_URL ?? "http://localhost:5000";
const API_BASE = `${FRONT_API_BASE}/api`;

interface Teacher {
  id: number;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string;
  active: boolean;
  createdAt: string;
  classes: string[];
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch(`${API_BASE}/user/teachers`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data?.success && Array.isArray(data.data)) {
          setTeachers(data.data);
        } else {
          console.warn("Neočakávaná odpoveď API:", data);
        }
      } catch (err) {
        console.error("Chyba pri načítaní učiteľov:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeachers();
  }, []);


  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (openMenu == null) return;
      const menuEl = document.getElementById(`teacher-row-${openMenu}`);
      if (!menuEl) return;
      if (!menuEl.contains(e.target as Node)) setOpenMenu(null);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  return (
  <>
    <Header />

    <div className="govuk-width-container teachers-page" style={{ marginTop: "2rem" }}>
      <div className="header-row">
        <h1 className="govuk-heading-xl">Učitelia</h1>

        <Link
          href="/admin-dashboard/add-teacher"
          className="govuk-button add-parent"
          role="button"
          data-module="govuk-button"
        >
          Pridať učiteľa
        </Link>
      </div>

      {loading ? (
        <p className="govuk-body">Načítavam údaje...</p>
      ) : teachers.length === 0 ? (
        <p className="govuk-body">Zatiaľ neboli pridaní žiadni učitelia.</p>
      ) : (
      
        <div className="parent-table-wrap">
          <div className="parent-table">
            {/* HLAVIČKA */}
            <div className="parent-table-header">
              <div>Meno</div>
              <div>Priezvisko</div>
              <div>Telefón</div>
              <div>E-mail</div>
              <div>Trieda</div>
              <div className="actions-col"></div>
            </div>

            {/* RIADKY */}
            {teachers.map((t) => (
              <div key={t.id} className="parent-row">
                <div>{t.firstName || "—"}</div>
                <div>{t.lastName || "—"}</div>
                <div>{t.phone || "—"}</div>
                <div className="email-cell">{t.email}</div>
                <div>{t.classes && t.classes.length > 0 ? t.classes.join(", ") : "—"}</div>

                <div className="actions" style={{ position: "relative" }}>
                  <button
                    className="menu-btn"
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openMenu === t.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu((prev) => (prev === t.id ? null : t.id));
                    }}
                  >
                    ⋮
                  </button>

                  {openMenu === t.id && (
                    <div
                      className="dropdown"
                      role="menu"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        right: 0,
                        zIndex: 1000,
                        minWidth: 160,
                      }}
                    >
                      <button type="button" role="menuitem">
                        Upraviť
                      </button>
                      <button type="button" role="menuitem">
                        Odobrať
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </>
);

}
