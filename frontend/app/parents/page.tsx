"use client";

import Header from "@/app/components/Header";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FRONT_API_BASE = process.env.BACKEND_URL ?? "http://localhost:5000";
const API_BASE = `${FRONT_API_BASE}/api`;
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

  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [deleteTarget, setDeleteTarget] = useState<Parent | null>(null);
  const [editTarget, setEditTarget] = useState<Parent | null>(null);
  const [childrenTarget, setChildrenTarget] = useState<Parent | null>(null);

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  useEffect(() => {
    if (!editTarget) return;

    setEditForm({
      firstName: editTarget.firstName ?? "",
      lastName: editTarget.lastName ?? "",
      phone: editTarget.phone ?? "",
      email: editTarget.email ?? "",
    });
  }, [editTarget]);


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


  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const result = parents.filter(
      (p) =>
        (p.firstName && p.firstName.toLowerCase().includes(lower)) ||
        (p.lastName && p.lastName.toLowerCase().includes(lower)) ||
        p.email.toLowerCase().includes(lower) ||
        p.children?.some(
          (c) =>
            c.firstName.toLowerCase().includes(lower) ||
            c.lastName.toLowerCase().includes(lower)
        )
    );
    setFilteredParents(result);
  }, [searchTerm, parents]);


  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (openMenu == null) return;

      const el = rowRefs.current[openMenu];
      if (!el) return;

      if (!el.contains(e.target as Node)) {
        setOpenMenu(null);
      }
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

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      setOpenMenu(null);
      setDeleteTarget(null);
      setEditTarget(null);
      setChildrenTarget(null);
    }
  }


  function sortBy(key: SortKey) {
    const nextAsc = key === sortKey ? !sortAsc : true;

    setSortKey(key);
    setSortAsc(nextAsc);

    const sorted = [...filteredParents].sort((a, b) => {
      const aVal = (a[key] ?? "").toString().toLowerCase();
      const bVal = (b[key] ?? "").toString().toLowerCase();
      return nextAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
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

    <div className="govuk-width-container parents-page" style={{ marginTop: "2rem" }}>
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
          style={{ marginBottom: "2px" }}
        >
          + Pridať rodiča
        </Link>
      </div>

      {loading ? (
        <p className="govuk-body">Načítavam údaje...</p>
      ) : filteredParents.length === 0 ? (
        <p className="govuk-body">Nenašli sa žiadni rodičia.</p>
      ) : (
        <div className="parent-table-wrap">
          <div className="parent-table">
            <div className="parent-table-header">
              <div onClick={() => sortBy("firstName")} style={{ cursor: "pointer" }}>
                Meno {renderSortArrow("firstName")}
              </div>
              <div onClick={() => sortBy("lastName")} style={{ cursor: "pointer" }}>
                Priezvisko {renderSortArrow("lastName")}
              </div>
              <div>Telefón</div>
              <div onClick={() => sortBy("email")} style={{ cursor: "pointer" }}>
                E-mail {renderSortArrow("email")}
              </div>
              <div onClick={() => sortBy("createdAt")} style={{ cursor: "pointer" }}>
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
                <div>{p.active ? new Date(p.createdAt).toLocaleDateString("sk-SK") : ""}</div>

                <div className="children-cell">
                  {p.children && p.children.length > 0 ? (
                    p.children.map((c) => (
                      <span key={c.id} className="child-tag">
                        {c.firstName} {c.lastName}
                      </span>
                    ))
                  ) : (
                    <span className="child-tag">—</span>
                  )}
                </div>

                <div
                  className="actions"
                  ref={(el) => {
                    rowRefs.current[p.id] = el;
                  }}
                  style={{ position: "relative" }}
                >
                  <button
                    className="menu-btn"
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={openMenu === p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu((prev) => (prev === p.id ? null : p.id));
                    }}
                  >
                    ⋮
                  </button>

                  {openMenu === p.id && (
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
                      <button
                        type="button"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(null);
                          setEditTarget(p);
                        }}
                      >
                        Upraviť
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(null);
                          setDeleteTarget(p);
                        }}
                      >
                        Odobrať
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(null);
                          setChildrenTarget(p);
                        }}
                      >
                        Zobraziť dieťa
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

    {/* DELETE MODAL */}
    {deleteTarget && (
      <div
        className="modal-backdrop"
        role="dialog"
        aria-modal="true"
        onClick={() => setDeleteTarget(null)}
      >
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, marginBottom: 0 }}>
              Odstrániť rodiča?
            </h2>

            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}
              aria-label="Zavrieť"
            >
              ✕
            </button>
          </div>

          <p className="govuk-body">
            Naozaj chceš odstrániť rodiča{" "}
            <strong>
              {deleteTarget.firstName ?? "—"} {deleteTarget.lastName ?? ""}
            </strong>{" "}
            ({deleteTarget.email})?
          </p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => setDeleteTarget(null)}
            >
              Zrušiť
            </button>

            <button
              type="button"
              className="govuk-button"
              onClick={() => {
                // TODO: delete + refresh zoznamu
                setDeleteTarget(null);
              }}
            >
              Potvrdiť
            </button>
          </div>
        </div>
      </div>
    )}

    {/* EDIT MODAL */}
    {editTarget && (
      <div
        role="dialog"
        aria-modal="true"
        onClick={() => setEditTarget(null)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          zIndex: 9999,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 560,
            background: "#fff",
            borderRadius: 10,
            padding: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, marginBottom: 0 }}>
              Upraviť rodiča
            </h2>
            <button
              type="button"
              onClick={() => setEditTarget(null)}
              style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}
              aria-label="Zavrieť"
            >
              ✕
            </button>
          </div>

          <p className="govuk-body" style={{ marginTop: 8 }}>
            Účet: <strong>{editTarget.email}</strong>
          </p>

          <div className="govuk-form-group">
            <label className="govuk-label">Meno</label>
            <input
              className="govuk-input"
              value={editForm.firstName}
              onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
            />
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label">Priezvisko</label>
            <input
              className="govuk-input"
              value={editForm.lastName}
              onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
            />
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label">Telefón</label>
            <input
              className="govuk-input"
              value={editForm.phone}
              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label">E-mail</label>
            <input
              className="govuk-input"
              value={editForm.email}
              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => setEditTarget(null)}
            >
              Zrušiť
            </button>

            <button
              type="button"
              className="govuk-button"
              onClick={() => {
                console.log("SAVE parent", editTarget.id, editForm);

                const updated: Parent = {
                  ...editTarget,
                  firstName: editForm.firstName || null,
                  lastName: editForm.lastName || null,
                  phone: editForm.phone || null,
                  email: editForm.email,
                };

                setParents((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                setFilteredParents((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));

                setEditTarget(null);
              }}
            >
              Uložiť
            </button>
          </div>
        </div>
      </div>
    )}

    {/* CHILDREN MODAL */}
    {childrenTarget && (
      <div
        role="dialog"
        aria-modal="true"
        onClick={() => setChildrenTarget(null)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          zIndex: 9999,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 560,
            background: "#fff",
            borderRadius: 10,
            padding: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, marginBottom: 0 }}>
              Deti rodiča
            </h2>

            <button
              type="button"
              onClick={() => setChildrenTarget(null)}
              style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}
              aria-label="Zavrieť"
            >
              ✕
            </button>
          </div>

          <p className="govuk-body" style={{ marginTop: 8 }}>
            Rodič:{" "}
            <strong>
              {childrenTarget.firstName ?? "—"} {childrenTarget.lastName ?? ""}
            </strong>{" "}
            ({childrenTarget.email})
          </p>

          {(childrenTarget.children?.length ?? 0) === 0 ? (
            <p className="govuk-body">Tento rodič nemá priradené žiadne dieťa.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {childrenTarget.children.map((c) => (
                <div
                  key={c.id}
                  style={{
                    border: "1px solid #b1b4b6",
                    borderRadius: 8,
                    padding: "10px 12px",
                    background: "#f8f8f8",
                    minWidth: 160,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {c.firstName} {c.lastName}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>ID: {c.id}</div>

                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    style={{ marginTop: 10, marginBottom: 0, width: "100%" }}
                    onClick={() => {
                      alert(`Dieťa: ${c.firstName} ${c.lastName} (id ${c.id})`);
                    }}
                  >
                    Detail
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => setChildrenTarget(null)}
            >
              Zavrieť
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}