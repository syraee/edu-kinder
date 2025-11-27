"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

type GroupTeacher = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

type Group = {
  id: number;
  name: string;
  class: string;
  roomName: string;
  classYear: string; // ISO dátum z API
  classTeacher?: GroupTeacher | null;
};

type Child = {
  id: number;
  firstName: string;
  lastName: string;
  groupName: string;
  className: string;
  classYear?: string | null;
};

type Teacher = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export default function StudentsPage() {
  const [classes, setClasses] = useState<Group[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [activeClass, setActiveClass] = useState<string>("Všetci");
  const [loading, setLoading] = useState(true);

  // modal – dieťa
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    groupName: "",
    className: "",
  });
  const [saving, setSaving] = useState(false);

  // modal – trieda
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: "",
    classLetter: "",
    roomName: "",
    classYear: "", // napr. "2024"
  });
  const [savingGroup, setSavingGroup] = useState(false);

  // učiteľka v modale – výber + search
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [teacherSearch, setTeacherSearch] = useState<string>("");

  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [groupsRes, childrenRes, teachersRes] = await Promise.all([
          fetch(`${API_BASE}/group`, { credentials: "include" }),
          fetch(`${API_BASE}/child`, { credentials: "include" }),
          fetch(`${API_BASE}/user/teachers`, { credentials: "include" }),
        ]);

        const groupsData = await groupsRes.json();
        const childrenData = await childrenRes.json();
        const teachersData = await teachersRes.json();

        if (groupsData?.success) setClasses(groupsData.data);
        if (childrenData?.success) setChildren(childrenData.data);
        if (teachersData?.success) setTeachers(teachersData.data);
      } catch (err) {
        console.error("Chyba pri načítaní dát:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // filtrovanie detí podľa aktívnej triedy
  const filtered =
    activeClass === "Všetci"
      ? children
      : children.filter((c) => c.groupName === activeClass);

  // nájdi objekt aktívnej triedy pre header (učiteľka, miestnosť, rok)
  const activeGroup =
    activeClass === "Všetci"
      ? null
      : classes.find((cls) => cls.name === activeClass) ?? null;

  // helper na text školského roka
  const formatSchoolYear = (classYear?: string) => {
    if (!classYear) return "Neuvedený";
    const d = new Date(classYear);
    if (isNaN(d.getTime())) return classYear;
    const y = d.getFullYear();
    return `${y}/${y + 1}`;
  };

  // ===== Modal – dieťa =====
  const openEditModal = (child: Child) => {
    setEditingChild(child);
    setBanner(null);
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

      // Aktualizovať lokálny zoznam detí
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

  // ===== Modal – trieda =====

  const openGroupModal = () => {
    if (!activeGroup) return;
    setBanner(null);
    setEditingGroup(activeGroup);

    const year = activeGroup.classYear
      ? new Date(activeGroup.classYear).getFullYear().toString()
      : "";

    setGroupForm({
      name: activeGroup.name,
      classLetter: activeGroup.class,
      roomName: activeGroup.roomName ?? "",
      classYear: year,
    });

    if (activeGroup.classTeacher) {
      setSelectedTeacherId(activeGroup.classTeacher.id);
      const fullName = `${activeGroup.classTeacher.firstName ?? ""} ${
        activeGroup.classTeacher.lastName ?? ""
      }`.trim();
      setTeacherSearch(fullName || activeGroup.classTeacher.email || "");
    } else {
      setSelectedTeacherId(null);
      setTeacherSearch("");
    }
  };

  const closeGroupModal = () => {
    setEditingGroup(null);
    setBanner(null);
    setTeacherSearch("");
    setSelectedTeacherId(null);
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGroupForm((prev) => ({ ...prev, [name]: value }));
  };

  // učiteľka – search input
  const handleTeacherSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setTeacherSearch(value);
    if (value === "") {
      // vymazali meno → odstránime priradenú učiteľku
      setSelectedTeacherId(null);
    }
  };

  const handleSelectTeacher = (teacher: Teacher) => {
    setSelectedTeacherId(teacher.id);
    const fullName = `${teacher.firstName ?? ""} ${
      teacher.lastName ?? ""
    }`.trim();
    setTeacherSearch(fullName || teacher.email);
  };

  // filtrovaný zoznam učiteliek podľa textu
  const teacherSearchLower = teacherSearch.toLowerCase();
  const filteredTeachers = teachers
    .filter((t) => {
      const fullName = `${t.firstName ?? ""} ${t.lastName ?? ""} ${
        t.email ?? ""
      }`.toLowerCase();
      return teacherSearchLower === ""
        ? true
        : fullName.includes(teacherSearchLower);
    })
    .slice(0, 8); // aby tam nebol kilometrový zoznam

  const saveGroupChanges = async () => {
    if (!editingGroup) return;
    setSavingGroup(true);
    setBanner(null);

    try {
      const body = {
        ...groupForm,
        teacherId: selectedTeacherId, // môže byť null
      };

      const res = await fetch(`${API_BASE}/group/${editingGroup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Nepodarilo sa upraviť triedu.");
      }

      const updated: Group = data.data;

      // aktualizuj lokálne triedy
      setClasses((prev) =>
        prev.map((g) =>
          g.id === editingGroup.id ? updated : g
        )
      );

      setBanner({ type: "success", text: "Trieda bola upravená." });
      setTimeout(() => closeGroupModal(), 1200);
    } catch (err: any) {
      setBanner({ type: "error", text: err.message });
    } finally {
      setSavingGroup(false);
    }
  };

  return (
    <>
      <Header />

      <div className="govuk-width-container idsk-students" style={{ marginTop: "2rem" }}>
        <h1 className="govuk-heading-xl">Prehľad tried a detí</h1>

        <div className="actions">
          <Link
            href="/kids-form"
            className="govuk-button"
            role="button"
            data-module="govuk-button"
          >
            Pridať dieťa
          </Link>
          <Link
            href="/class-form"
            className="govuk-button"
            role="button"
            data-module="govuk-button"
          >
            Vytvoriť triedu
          </Link>
        </div>

        {/* Tabs – triedy */}
        <div className="idsk-tabs">
          <ul className="idsk-tabs__list">
            <li
              key="Všetci"
              className={`idsk-tabs__list-item ${
                activeClass === "Všetci" ? "idsk-tabs__list-item--selected" : ""
              }`}
              onClick={() => setActiveClass("Všetci")}
            >
              <button className="idsk-tabs__tab">Všetci</button>
            </li>
            {classes.map((cls) => (
              <li
                key={cls.id}
                className={`idsk-tabs__list-item ${
                  activeClass === cls.name ? "idsk-tabs__list-item--selected" : ""
                }`}
                onClick={() => setActiveClass(cls.name)}
              >
                <button className="idsk-tabs__tab">{cls.name}</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Panel s informáciami o triede – iba ak nie je „Všetci“ */}
        {activeGroup && (
          <div className="govuk-!-margin-top-4 govuk-!-margin-bottom-4">
            <div
              className="govuk-panel"
              style={{
                border: "1px solid #636363ff",
                backgroundColor: "#f8f8f8ff",
                color: "black",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1.5rem",
              }}
            >
              <div>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
                  Trieda {activeGroup.name}
                </h2>

                <p className="govuk-body-s govuk-!-margin-bottom-1">
                  <b>Učiteľka:</b>{" "}
                  {activeGroup.classTeacher
                    ? (
                        `${activeGroup.classTeacher.firstName ?? ""} ${
                          activeGroup.classTeacher.lastName ?? ""
                        }`.trim() || activeGroup.classTeacher.email
                      )
                    : "Nepriradená"}
                </p>
                <p className="govuk-body-s govuk-!-margin-bottom-1">
                  <b>Miestnosť:</b> {activeGroup.roomName || "Neuvedená"}
                </p>
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  <b>Školský rok:</b> {formatSchoolYear(activeGroup.classYear)}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={openGroupModal}
                >
                  Upraviť triedu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Zoznam detí */}
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
                  <p>
                    <b>Trieda:</b> {child.groupName}
                  </p>
                  <p>
                    <b>Ročník:</b> {child.className}
                  </p>
                </div>
                <div className="student-card__actions">
                  <button className="govuk-button govuk-button--secondary">
                    Detail
                  </button>
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

      {/* Modal na úpravu dieťaťa */}
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

            {banner && !editingGroup && (
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

      {/* Modal na úpravu triedy */}
      {editingGroup && (
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
              maxWidth: "550px",
              width: "90%",
            }}
          >
            <h2 className="govuk-heading-m">Upraviť triedu</h2>

            <div className="govuk-form-group">
              <label className="govuk-label">Názov triedy</label>
              <input
                type="text"
                name="name"
                className="govuk-input"
                value={groupForm.name}
                onChange={handleGroupChange}
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label">Označenie (písmeno)</label>
              <input
                type="text"
                name="classLetter"
                className="govuk-input"
                value={groupForm.classLetter}
                onChange={handleGroupChange}
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label">Miestnosť</label>
              <input
                type="text"
                name="roomName"
                className="govuk-input"
                value={groupForm.roomName}
                onChange={handleGroupChange}
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label">Školský rok (rok začiatku)</label>
              <input
                type="number"
                name="classYear"
                className="govuk-input"
                value={groupForm.classYear}
                onChange={handleGroupChange}
              />
            </div>

            {/* Výber učiteľky */}
            <div className="govuk-form-group">
              <label className="govuk-label">Triedna učiteľka</label>
              <input
                type="text"
                className="govuk-input"
                placeholder="Začnite písať meno alebo e-mail"
                value={teacherSearch}
                onChange={handleTeacherSearchChange}
              />
              <div className="govuk-hint">
                Vyberte z ponuky nižšie alebo nechajte prázdne, ak trieda nemá pridelenú učiteľku.
              </div>

              {teacherSearch !== "" && filteredTeachers.length === 0 && (
                <p className="govuk-hint govuk-!-margin-top-1">
                  Nenašla sa žiadna učiteľka.
                </p>
              )}

              {filteredTeachers.length > 0 && (
                <ul
                  className="govuk-list govuk-!-margin-top-2"
                  style={{
                    maxHeight: "160px",
                    overflowY: "auto",
                    border: "1px solid #dcdcdc",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.25rem",
                  }}
                >
                  {filteredTeachers.map((t) => {
                    const fullName = `${t.firstName ?? ""} ${
                      t.lastName ?? ""
                    }`.trim();
                    const label = fullName || t.email;
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          className="govuk-link"
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: 0,
                          }}
                          onClick={() => handleSelectTeacher(t)}
                        >
                          {label}{" "}
                          <span className="govuk-hint govuk-!-display-inline">
                            ({t.email})
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {selectedTeacherId !== null && (
                <p className="govuk-hint govuk-!-margin-top-2">
                  Vybraná učiteľka:{" "}
                  <b>
                    {
                      (() => {
                        const t = teachers.find((tt) => tt.id === selectedTeacherId);
                        const full = `${t?.firstName ?? ""} ${
                          t?.lastName ?? ""
                        }`.trim();
                        return full || t?.email || "neznáma";
                      })()
                    }
                  </b>
                </p>
              )}
            </div>

            {banner && editingGroup && (
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
                onClick={saveGroupChanges}
                disabled={savingGroup}
              >
                {savingGroup ? "Ukladám…" : "Uložiť zmeny"}
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={closeGroupModal}
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
