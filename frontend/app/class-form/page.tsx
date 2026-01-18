"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";

const API_BASE = process.env.BACKEND_URL ?? "http://localhost:5000";

interface Teacher {
  id: number;
  firstName: string | null;
  lastName: string | null;
}

export default function ClassFormPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState({
    className: "",
    schoolYear: "",
    teacherId: "",
    groupLetter: "",
    room: "",
  });

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch(`${API_BASE}/api/user/teachers`, { credentials: "include" });
        const data = await res.json();
        if (data?.success) setTeachers(data.data);
      } catch (err) {
        console.error("Chyba pri načítaní učiteliek:", err);
      }
    }
    fetchTeachers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.className || !form.schoolYear || !form.room) {
      alert("Vyplňte všetky povinné údaje.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.className,
          classLetter: form.groupLetter || "A",
          classYear: new Date(form.schoolYear.split("/")[0] + "-09-01"), // napr. "2024/2025" → "2024-09-01"
          teacherId: form.teacherId ? parseInt(form.teacherId, 10) : null,
          roomName: form.room,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Trieda bola úspešne vytvorená");
        setForm({
          className: "",
          schoolYear: "",
          teacherId: "",
          groupLetter: "",
          room: "",
        });
      } else {
        alert("❌ " + (data.error || "Nepodarilo sa uložiť triedu."));
      }
    } catch (err) {
      console.error("Chyba pri vytváraní triedy:", err);
      alert("Server momentálne nedostupný.");
    }
  };

  return (
    <>
      <Header />

      <div className="govuk-width-container" style={{ marginTop: "2rem" }}>
        <h1 className="govuk-heading-xl">Vytvorenie triedy</h1>

        <form className="govuk-form-group" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Názov triedy */}
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="className">
                Názov triedy
              </label>
              <input
                id="className"
                name="className"
                type="text"
                className="govuk-input"
                value={form.className}
                onChange={handleChange}
                required
              />
            </div>

            {/* Školský rok */}
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="schoolYear">
                Školský rok
              </label>
              <input
                id="schoolYear"
                name="schoolYear"
                type="text"
                placeholder="napr. 2024/2025"
                className="govuk-input"
                value={form.schoolYear}
                onChange={handleChange}
                required
              />
            </div>

            {/* Triedna učiteľka */}
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="teacherId">
                Triedna učiteľka
              </label>
              <select
                id="teacherId"
                name="teacherId"
                className="govuk-select"
                value={form.teacherId}
                onChange={handleChange}
              >
                <option value="">-- Vyber učiteľku --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Označenie skupiny */}
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="groupLetter">
                Označenie skupiny (napr. A, B, C)
              </label>
              <input
                id="groupLetter"
                name="groupLetter"
                type="text"
                className="govuk-input"
                value={form.groupLetter}
                onChange={handleChange}
              />
            </div>

            {/* Miestnosť */}
            <div className="govuk-form-group govuk-!-width-full">
              <label className="govuk-label" htmlFor="room">
                Miestnosť
              </label>
              <input
                id="room"
                name="room"
                type="text"
                placeholder="napr. B102"
                className="govuk-input"
                value={form.room}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="govuk-button govuk-!-margin-top-6">
            Uložiť triedu
          </button>
        </form>
      </div>
    </>
  );
}
