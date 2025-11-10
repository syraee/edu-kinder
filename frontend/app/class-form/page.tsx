"use client";

import { useState } from "react";
import Header from "@/app/components/Header";

export default function ClassFormPage() {
  const teachers = [
    { id: 1, name: "Mgr. Jana Nováková" },
    { id: 2, name: "Bc. Lucia Horváthová" },
    { id: 3, name: "Mgr. Petra Kováčová" },
  ];

  const [form, setForm] = useState({
    className: "",
    schoolYear: "",
    teacherId: "",
    groupCount: "",
    room: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Odoslané údaje o triede:", form);
    alert("Trieda bola úspešne vytvorená ✅");
  };

  return (
    <>
      <Header />

      <div className="govuk-width-container" style={{ marginTop: "2rem" }}>
        <h1 className="govuk-heading-xl">Vytvorenie triedy</h1>

        <form className="govuk-form-group" onSubmit={handleSubmit}>
          <div className="form-grid">
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
                required
              >
                <option value="">-- Vyber učiteľku --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="groupCount">
                Počet skupín
              </label>
              <input
                id="groupCount"
                name="groupCount"
                type="number"
                min="1"
                className="govuk-input"
                value={form.groupCount}
                onChange={handleChange}
                required
              />
            </div>

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
