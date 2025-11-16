"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

interface Child {
  id: number;
  firstName: string;
  lastName: string;
}

interface Parent {
  id: number;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string;
  active: boolean;
  createdAt: string;
  children: Child[];
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // načítanie rodičov s ich deťmi
  useEffect(() => {
    async function fetchParents() {
      try {
        const res = await fetch(`${API_BASE}/user/parents`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data?.success && Array.isArray(data.data)) {
          setParents(data.data);
        } else {
          console.warn("Neočakávaná odpoveď API:", data);
        }
      } catch (err) {
        console.error("Chyba pri načítaní rodičov:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchParents();
  }, []);

  return (
    <>
      <Header />

      <div className="govuk-width-container" style={{ marginTop: "2rem" }}>
        <div className="header-row">
          <h1 className="govuk-heading-xl">Rodičia</h1>
          <Link
            href="/admin-dashboard"
            className="govuk-button add-parent"
            role="button"
            data-module="govuk-button"
          >
            Pridať rodiča
          </Link>
        </div>

        {loading ? (
          <p className="govuk-body">Načítavam údaje...</p>
        ) : parents.length === 0 ? (
          <p className="govuk-body">Zatiaľ neboli pridaní žiadni rodičia.</p>
        ) : (
          <div className="parent-table">
            {/* HLAVIČKA */}
            <div className="parent-table-header">
              <div>Meno</div>
              <div>Priezvisko</div>
              <div>Telefón</div>
              <div>E-mail</div>
              <div>Registrácia</div>
              <div>Deti</div>
              <div className="actions-col"></div>
            </div>

            {/* RIADKY */}
            {parents.map((p) => (
              <div key={p.id} className="parent-row">
                <div>{p.firstName || "—"}</div>
                <div>{p.lastName || "—"}</div>
                <div>{p.phone || "—"}</div>
                <div className="email-cell">{p.email}</div>
                <div>
                  {p.active
                    ? new Date(p.createdAt).toLocaleDateString("sk-SK")
                    : ""}
                </div>

                <div className="children-cell">
                  {p.children && p.children.length > 0 ? (
                    p.children.map((c, i) => (
                      <span key={i} className="child-tag">
                        {c.firstName} {c.lastName}
                      </span>
                    ))
                  ) : (
                    <span className="child-tag">—</span>
                  )}
                </div>

                <div className="actions">
                  <button
                    className="menu-btn"
                    onClick={() =>
                      setOpenMenu(openMenu === p.id ? null : p.id)
                    }
                  >
                    ⋮
                  </button>

                  {openMenu === p.id && (
                    <div className="dropdown">
                      <button>Upraviť</button>
                      <button>Pridať e-mail</button>
                      <button>Odobrať</button>
                      <button>Zobraziť dieťa</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
 </>
  );
}
