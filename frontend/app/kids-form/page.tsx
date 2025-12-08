"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import { useToast } from "@/app/components/ToastProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

interface Group {
  id: number;
  name: string;
  class: string;
}

type PendingChild = {
  tempId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  groupId: string;
  groupLabel: string;
  parentEmail: string;
  isInternal: boolean;
};

export default function ChildFormPage() {
  const { showToast } = useToast();

  const [groups, setGroups] = useState<Group[]>([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    groupId: "",
    parentEmail: "",
    isInternal: false,
  });
  const [pendingChildren, setPendingChildren] = useState<PendingChild[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const res = await fetch(`${API_BASE}/group`, { credentials: "include" });
        const data = await res.json();
        if (data?.success) setGroups(data.data);
      } catch (err) {
        console.error("Chyba pri načítaní tried:", err);
        showToast("Nepodarilo sa načítať zoznam tried.", { type: "error" });
      }
    }
    fetchGroups();
  }, [showToast]);

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

  
  const handleAddToList = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.birthDate || !form.groupId) {
      showToast("Vyplňte všetky povinné údaje.", { type: "error" });
      return;
    }

    if (form.isInternal && !form.parentEmail.trim()) {
      showToast(
        "Ak je rodič zamestnanec/študent organizácie, zadajte jeho e-mail.",
        { type: "error" }
      );
      return;
    }

    const group = groups.find((g) => String(g.id) === form.groupId);
    const groupLabel = group ? `${group.name} (${group.class})` : "";

    const newItem: PendingChild = {
      tempId:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now() + Math.random()),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      birthDate: form.birthDate,
      groupId: form.groupId,
      groupLabel,
      parentEmail: form.parentEmail.trim(),
      isInternal: form.isInternal,
    };

    setPendingChildren((prev) => [...prev, newItem]);

    
    setForm((prev) => ({
      ...prev,
      firstName: "",
      lastName: "",
      birthDate: "",
      parentEmail: "",
      
    }));

    showToast("Dieťa bolo pridané do zoznamu. Zatiaľ neuložené v systéme.", {
      type: "info",
    });
  };

  const handleRemovePending = (tempId: string) => {
    setPendingChildren((prev) => prev.filter((c) => c.tempId !== tempId));
  };

  // 2) Odoslanie VŠETKÝCH detí v zozname na server
  const handleSubmitAll = async () => {
    if (!pendingChildren.length) {
      showToast("Nie sú žiadne deti v zozname na uloženie.", { type: "info" });
      return;
    }

    setSubmitting(true);

    const failed: PendingChild[] = [];

    try {
      for (const item of pendingChildren) {
        try {
          // vytvorenie dieťaťa
          const res = await fetch(`${API_BASE}/child`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              firstName: item.firstName,
              lastName: item.lastName,
              birthDate: item.birthDate,
              groupId: parseInt(item.groupId, 10),
            }),
          });

          const data = await res.json();

          if (!res.ok || !data.success) {
            console.error(
              `Chyba pri vytváraní dieťaťa (${item.firstName} ${item.lastName}):`,
              data
            );
            showToast(
              `Dieťa ${item.firstName} ${item.lastName}: ` +
                (data.error || "Nepodarilo sa uložiť dieťa."),
              { type: "error" }
            );
            failed.push(item);
            continue;
          }

          const createdChild = data.data;
          const childId = createdChild?.id;

          // ak je e-mail rodiča, riešime aj konto rodiča
          if (item.parentEmail) {
            const email = item.parentEmail;

            const userRes = await fetch(`${API_BASE}/user`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                email,
                active: false,
                internal: item.isInternal,
                roleId: 3,
              }),
            });

            const userData = await userRes.json();

            if (!userRes.ok || !userData.success) {
              console.error(
                `Chyba pri vytváraní rodiča (User) pre dieťa ${item.firstName} ${item.lastName}:`,
                userData
              );
              showToast(
                `Dieťa ${item.firstName} ${item.lastName} bolo uložené, ale nepodarilo sa vytvoriť konto rodiča: ` +
                  (userData.error || ""),
                { type: "error" }
              );
              // dieťa je už uložené 
            } else {
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
                  console.error(
                    `Chyba pri priraďovaní rodiča k dieťaťu (${item.firstName} ${item.lastName}):`,
                    err
                  );
                  showToast(
                    `Konto rodiča pre dieťa ${item.firstName} ${item.lastName} bolo vytvorené, ale nepodarilo sa ho priradiť k dieťaťu.`,
                    { type: "info" }
                  );
                }
              }

              try {
                const inviteRes = await fetch(
                  `${API_BASE}/auth/register/request`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ emails: [email] }),
                  }
                );

                const inviteData = await inviteRes.json();

                if (!inviteRes.ok) {
                  console.error(
                    `Chyba pri odosielaní pozvánky pre rodiča dieťaťa ${item.firstName} ${item.lastName}:`,
                    inviteData
                  );
                  showToast(
                    `Dieťa ${item.firstName} ${item.lastName} bolo uložené a konto rodiča vytvorené, ale pozvánku sa nepodarilo odoslať: ` +
                      (inviteData.error || ""),
                    { type: "info" }
                  );
                } else {
                  console.log(
                    `Pozvánka odoslaná pre rodiča dieťaťa ${item.firstName} ${item.lastName}:`,
                    inviteData
                  );
                  showToast(
                    `Pozvánka pre rodiča dieťaťa ${item.firstName} ${item.lastName} bola odoslaná.`,
                    { type: "success" }
                  );
                }
              } catch (err) {
                console.error(
                  `Chyba pri volaní /auth/register/request pre dieťa ${item.firstName} ${item.lastName}:`,
                  err
                );
                showToast(
                  `Dieťa ${item.firstName} ${item.lastName} bolo uložené a konto rodiča vytvorené, ale pri odosielaní pozvánky nastala chyba.`,
                  { type: "info" }
                );
              }
            }
          }

          
        } catch (err) {
          console.error(
            `Chyba pri ukladaní dieťaťa ${item.firstName} ${item.lastName}:`,
            err
          );
          showToast(
            `Dieťa ${item.firstName} ${item.lastName}: Nepodarilo sa pripojiť k serveru.`,
            { type: "error" }
          );
          failed.push(item);
        }
      }

      if (failed.length === 0) {
        setPendingChildren([]);
        showToast("Všetky deti v zozname boli odoslané do systému.", {
          type: "success",
        });
      } else if (failed.length < pendingChildren.length) {
        setPendingChildren(failed);
        showToast(
          "Niektoré deti sa nepodarilo uložiť. Ostali v zozname na opätovné odoslanie.",
          { type: "info" }
        );
      } else {
        setPendingChildren(failed);
        showToast(
          "Žiadne dieťa sa nepodarilo uložiť. Skúste to prosím neskôr.",
          { type: "error" }
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <div className="govuk-width-container" style={{ marginTop: "2rem" }}>
        <h1 className="govuk-heading-xl">Registrácia dieťaťa</h1>

        {/* FORMULÁR ktory drzi lokalne deti+rodicov*/}
        <form className="govuk-form-group" onSubmit={handleAddToList}>
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

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="parentEmail">
                E-mail rodiča
              </label>

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
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="govuk-button govuk-!-margin-top-6"
            disabled={submitting}
          >
            Pridať dieťa do zoznamu
          </button>
        </form>

        {/* ZOZNAM PRIPRAVENÝCH DETI*/}
        {pendingChildren.length > 0 && (
          <div className="govuk-!-margin-top-6">
            <h2 className="govuk-heading-m">Zoznam pripravených detí</h2>
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Meno a priezvisko
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Dátum narodenia
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Trieda
                  </th>
                  <th scope="col" className="govuk-table__header">
                    E-mail rodiča
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Interný
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Akcia
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {pendingChildren.map((child) => (
                  <tr className="govuk-table__row" key={child.tempId}>
                    <td className="govuk-table__cell">
                      {child.firstName} {child.lastName}
                    </td>
                    <td className="govuk-table__cell">{child.birthDate}</td>
                    <td className="govuk-table__cell">{child.groupLabel}</td>
                    <td className="govuk-table__cell">
                      {child.parentEmail || "—"}
                    </td>
                    <td className="govuk-table__cell">
                      {child.isInternal ? "Áno" : "Nie"}
                    </td>
                    <td className="govuk-table__cell">
                      <button
                        type="button"
                        className="govuk-link"
                        onClick={() => handleRemovePending(child.tempId)}
                      >
                        Odstrániť
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="govuk-!-margin-top-6 govuk-!-margin-bottom-6">
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            disabled={submitting || pendingChildren.length === 0}
            onClick={handleSubmitAll}
          >
            {submitting
              ? "Odosielam všetky deti…"
              : "Uložiť všetky deti do systému"}
          </button>
        </div>
      </div>
    </>
  );
}
