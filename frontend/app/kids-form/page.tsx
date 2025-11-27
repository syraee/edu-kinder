"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

interface Group {
  id: number;
  name: string;
  class: string;
}

export default function ChildFormPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    groupId: "",
  });

  useEffect(() => {
    async function fetchGroups() {
      try {
        const res = await fetch(`${API_BASE}/group`, { credentials: "include" });
        const data = await res.json();
        if (data?.success) setGroups(data.data);
      } catch (err) {
        console.error("Chyba pri načítaní tried:", err);
      }
    }
    fetchGroups();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.birthDate || !form.groupId) {
      alert("Vyplňte všetky povinné údaje.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/child`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          birthDate: form.birthDate,
          groupId: parseInt(form.groupId, 10),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Dieťa bolo úspešne uložené ✅");
        setForm({ firstName: "", lastName: "", birthDate: "", groupId: "" });
      } else {
        alert("Chyba: " + (data.error || "Nepodarilo sa uložiť dieťa."));
      }
    } catch (err) {
      console.error("Chyba pri ukladaní dieťaťa:", err);
      alert("Nepodarilo sa pripojiť k serveru.");
    }
  };

  return (
    <>
      <Header />

      <div className="govuk-width-container" style={{ marginTop: "2rem" }}>
        <h1 className="govuk-heading-xl">Registrácia dieťaťa</h1>

        <form className="govuk-form-group" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="firstName">Meno dieťaťa</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="govuk-input"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="lastName">Priezvisko dieťaťa</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="govuk-input"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="birthDate">Dátum narodenia</label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                className="govuk-input"
                value={form.birthDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="groupId">Trieda</label>
              <select
                id="groupId"
                name="groupId"
                className="govuk-select"
                value={form.groupId}
                onChange={handleChange}
                required
              >
                <option value="">-- Vyber triedu --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.class})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="govuk-button govuk-!-margin-top-6">
            Uložiť dieťa
          </button>
        </form>
      </div>
    </>
  );
}
