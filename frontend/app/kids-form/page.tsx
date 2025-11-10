"use client";

import { useState } from "react";
import Header from "@/app/components/Header";

export default function ChildFormPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    class: "",
    group: "",
    address: "",
    note: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Odoslané údaje:", form);
    alert("Údaje o dieťati boli uložené ✅");
  };

  return (
    <>
      <Header />

      <div className="govuk-width-container" style={{ marginTop: "2rem" }}>
        <h1 className="govuk-heading-xl">Registrácia dieťaťa</h1>

        <form className="govuk-form-group" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="firstName">
                Meno dieťaťa
              </label>
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
              <label className="govuk-label" htmlFor="lastName">
                Priezvisko dieťaťa
              </label>
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
              <label className="govuk-label" htmlFor="birthDate">
                Dátum narodenia
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                className="govuk-input"
                value={form.birthDate}
                onChange={handleChange}
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="class">
                Trieda
              </label>
              <select
                id="class"
                name="class"
                className="govuk-select"
                value={form.class}
                onChange={handleChange}
              >
                <option value="">-- Vyber triedu --</option>
                <option value="Včielky">Včielky</option>
                <option value="Lienky">Lienky</option>
                <option value="Motýliky">Motýliky</option>
              </select>
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="group">
                Skupina
              </label>
              <select
                id="group"
                name="group"
                className="govuk-select"
                value={form.group}
                onChange={handleChange}
              >
                <option value="">-- Vyber skupinu --</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            <div className="govuk-form-group govuk-!-width-full">
              <label className="govuk-label" htmlFor="address">
                Adresa
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className="govuk-input"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <hr className="govuk-section-break govuk-section-break--visible" />

            <div className="govuk-form-group govuk-!-width-full">
              <label className="govuk-label" htmlFor="note">
                Poznámka
              </label>
              <textarea
                id="note"
                name="note"
                className="govuk-textarea"
                rows={4}
                value={form.note}
                onChange={handleChange}
              />
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
