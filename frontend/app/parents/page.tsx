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

type SortKey = "firstName" | "lastName" | "email" | "createdAt";

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("firstName");
  const [sortAsc, setSortAsc] = useState(true);

  
//nacitanie rodicov z databazy 
  useEffect(() => {
    async function fetchParents() {
      try {
        const res = await fetch(`${API_BASE}/user/parents`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          setParents(data.data);
          setFilteredParents(data.data);
        }
      } catch (err) {
        console.error("Chyba pri načítaní rodičov:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchParents();
  }, []);

  // Filtrovanie zoznamu podla vyhladavania v searchBare
  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const result = parents.filter(
      (p) =>
        (p.firstName && p.firstName.toLowerCase().includes(lower)) ||
        (p.lastName && p.lastName.toLowerCase().includes(lower)) ||
        p.email.toLowerCase().includes(lower) ||
        p.children.some(
          (c) =>
            c.firstName.toLowerCase().includes(lower) ||
            c.lastName.toLowerCase().includes(lower)
        )
    );
    setFilteredParents(result);
  }, [searchTerm, parents]);

// Sortovanie stlpcov
  function sortBy(key: SortKey) {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
    const sorted = [...filteredParents].sort((a, b) => {
      const aVal = a[key] ? a[key]!.toString().toLowerCase() : "";
      const bVal = b[key] ? b[key]!.toString().toLowerCase() : "";
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    setFilteredParents(sorted);
  }

  function renderSortArrow(key: SortKey) {
    if (sortKey !== key) return "";
    return sortAsc ? "↑" : "↓";
  }

  return (
    <>
      <Header />
      <div className="govuk-width-container" style={{ marginTop: "2rem" }}>
        <h1 className="govuk-heading-xl" style={{ marginBottom: "1rem" }}>
          Rodičia
        </h1>

        <div
          className="searchbar-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <input
            type="text"
            placeholder="Vyhľadať podľa mena, e-mailu alebo dieťaťa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="govuk-input"
            style={{
              flex: "1",
              minWidth: "280px",
              maxWidth: "600px",
              height: "40px",
            }}
          />

          <Link
            href="/admin-dashboard"
            className="govuk-button add-parent"
            role="button"
            data-module="govuk-button"
            style={{
              marginBottom: "2px",
            }}
          >
            + Pridať rodiča
          </Link>
        </div>


        {loading ? (
          <p className="govuk-body">Načítavam údaje...</p>
        ) : filteredParents.length === 0 ? (
          <p className="govuk-body">Nenašli sa žiadni rodičia.</p>
        ) : (
          <div className="parent-table">
            <div className="parent-table-header">
              <div
                onClick={() => sortBy("firstName")}
                style={{ cursor: "pointer" }}
              >
                Meno {renderSortArrow("firstName")}
              </div>
              <div
                onClick={() => sortBy("lastName")}
                style={{ cursor: "pointer" }}
              >
                Priezvisko {renderSortArrow("lastName")}
              </div>
              <div>Telefón</div>
              <div
                onClick={() => sortBy("email")}
                style={{ cursor: "pointer" }}
              >
                E-mail {renderSortArrow("email")}
              </div>
              <div
                onClick={() => sortBy("createdAt")}
                style={{ cursor: "pointer" }}
              >
                Registrácia {renderSortArrow("createdAt")}
              </div>
              <div>Deti</div>
              <div className="actions-col"></div>
            </div>

            {filteredParents.map((p) => (
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
                      <button>Odobrať</button>
                      <button>Pridať dieťa</button>
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