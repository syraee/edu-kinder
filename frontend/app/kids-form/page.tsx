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
    parentEmail: "",
    isInternal: false,
  });
  const [submitting, setSubmitting] = useState(false);

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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setForm((prev) => ({ ...prev, isInternal: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.birthDate || !form.groupId) {
      alert("Vyplňte všetky povinné údaje.");
      return;
    }

    if (form.isInternal && !form.parentEmail.trim()) {
      alert("Ak je rodič zamestnanec/študent organizácie, zadajte jeho e-mail.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/child`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          birthDate: form.birthDate,
          groupId: parseInt(form.groupId, 10),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Chyba pri vytváraní dieťaťa:", data);
        alert("Chyba: " + (data.error || "Nepodarilo sa uložiť dieťa."));
        return;
      }

      const createdChild = data.data; 
      const childId = createdChild?.id;

     if (form.parentEmail.trim()) {
        const email = form.parentEmail.trim();

       
        const userRes = await fetch(`${API_BASE}/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email,
            active: false,
            internal: true,
            roleId: 3, 
          }),
        });

        const userData = await userRes.json();

        if (!userRes.ok || !userData.success) {
          console.error("Chyba pri vytváraní rodiča (User):", userData);
          alert(
            "Dieťa bolo uložené, ale nepodarilo sa vytvoriť konto rodiča: " +
              (userData.error || "")
          );
          setSubmitting(false);
          return;
        }

        const userId = userData.data.id;

        if (childId) {
          try {
            await fetch(`${API_BASE}/guardian/assign`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                userId,
                childId,
                relationship: "parent",
              }),
            });
          } catch (err) {
            console.error("Chyba pri priraďovaní rodiča k dieťaťu:", err);
           
          }
        }


        try {
          const inviteRes = await fetch(`${API_BASE}/auth/register/request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ emails: [email] }),
          });

          const inviteData = await inviteRes.json();

          if (!inviteRes.ok) {
            console.error("Chyba pri odosielaní pozvánky:", inviteData);
            alert(
              "Dieťa bolo uložené a konto rodiča vytvorené, ale pozvánku sa nepodarilo odoslať: " +
                (inviteData.error || "")
            );
          } else {
            console.log("Pozvánka odoslaná:", inviteData);
          }
        } catch (err) {
          console.error("Chyba pri volaní /auth/register/request:", err);
          alert(
            "Dieťa bolo uložené a konto rodiča vytvorené, ale pri odosielaní pozvánky nastala chyba."
          );
        }
      }

      alert("Dieťa bolo úspešne uložené ");

      setForm({
        firstName: "",
        lastName: "",
        birthDate: "",
        groupId: "",
        parentEmail: "",
        isInternal: false,
      });
    } catch (err) {
      console.error("Chyba pri ukladaní dieťaťa:", err);
      alert("Nepodarilo sa pripojiť k serveru.");
    } finally {
      setSubmitting(false);
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
                required
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="groupId">
                Trieda
              </label>
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

            {/* E-mail rodiča */}
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="parentEmail">
                E-mail rodiča
              </label>
              <span className="govuk-hint">
                Ak je rodič zamestnanec/študent organizácie, použije sa na vytvorenie konta
                a odoslanie pozvánky.
              </span>
              <input
                id="parentEmail"
                name="parentEmail"
                type="email"
                className="govuk-input"
                value={form.parentEmail}
                onChange={handleChange}
                placeholder="meno.priezvisko@example.com"
              />
            </div>

            {/* Checkbox – interný (zamestnanec/študent) */}
            <div className="govuk-form-group">
              <div className="govuk-checkboxes">
                <div className="govuk-checkboxes__item">
                  <input
                    className="govuk-checkboxes__input"
                    id="isInternal"
                    name="isInternal"
                    type="checkbox"
                    checked={form.isInternal}
                    onChange={handleInternalChange}
                  />
                  <label
                    className="govuk-label govuk-checkboxes__label"
                    htmlFor="isInternal"
                  >
                    Rodič je zamestnanec / študent organizácie
                  </label>
                  <div className="govuk-hint">
                    V databáze sa vytvorí konto rodiča s týmto e-mailom (internal = true,
                    active = false). Rodič si po kliknutí v pozvánke dokončí registráciu.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="govuk-button govuk-!-margin-top-6"
            disabled={submitting}
          >
            {submitting ? "Ukladám…" : "Uložiť dieťa"}
          </button>
        </form>
      </div>
    </>
  );
}
