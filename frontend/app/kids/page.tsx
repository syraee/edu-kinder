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

  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    groupName: "",
    className: "",
  });
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const openEditModal = (child: Child) => {
    setEditingChild(child);
    setEditForm({
      firstName: child.firstName,
      lastName: child.lastName,
      groupName: child.groupName,
      className: child.className,
    });
  };

  const closeEditModal = () => {
    setEditingChild(null);
    setBanner(null);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = async () => {
    if (!editingChild) return;
    setSaving(true);
    setBanner(null);

    try {
      const res = await fetch(`${API_BASE}/child/${editingChild.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Nepodarilo sa uložiť zmeny.");

      // Aktualizovať lokálny zoznam
      setChildren((prev) =>
        prev.map((c) =>
          c.id === editingChild.id ? { ...c, ...editForm } : c
        )
      );

      setBanner({ type: "success", text: "Zmeny boli uložené." });
      setTimeout(() => closeEditModal(), 1200);
    } catch (err: any) {
      setBanner({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

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
                  <button
                    className="govuk-button govuk-button--warning"
                    type="button"
                    onClick={() => openEditModal(child)}
                  >
                    Upraviť
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 Modal na úpravu dieťaťa */}
      {editingChild && (
        <div
          className="govuk-modal"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="govuk-panel govuk-panel--confirmation"
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "2rem",
              borderRadius: "0.5rem",
              maxWidth: "500px",
              width: "90%",
            }}
          >
            <h2 className="govuk-heading-m">Upraviť údaje dieťaťa</h2>

            <div className="govuk-form-group">
              <label className="govuk-label">Meno</label>
              <input
                type="text"
                name="firstName"
                className="govuk-input"
                value={editForm.firstName}
                onChange={handleEditChange}
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label">Priezvisko</label>
              <input
                type="text"
                name="lastName"
                className="govuk-input"
                value={editForm.lastName}
                onChange={handleEditChange}
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label">Trieda</label>
              <select
                name="groupName"
                className="govuk-select"
                value={editForm.groupName}
                onChange={handleEditChange}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label">Ročník</label>
              <input
                type="text"
                name="className"
                className="govuk-input"
                value={editForm.className}
                onChange={handleEditChange}
              />
            </div>

            {banner && (
              <div
                className={`govuk-notification-banner govuk-!-margin-top-4 ${
                  banner.type === "success"
                    ? "govuk-notification-banner--success"
                    : ""
                }`}
                role="region"
              >
                <div className="govuk-notification-banner__content">
                  <p className="govuk-body">{banner.text}</p>
                </div>
              </div>
            )}

            <div className="govuk-button-group govuk-!-margin-top-4">
              <button
                type="button"
                className="govuk-button"
                onClick={saveChanges}
                disabled={saving}
              >
                {saving ? "Ukladám…" : "Uložiť zmeny"}
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={closeEditModal}
              >
                Zrušiť
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
