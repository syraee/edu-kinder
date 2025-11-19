"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
}

interface AddedParent {
  email: string;
  firstName: string;
  lastName: string;
  children: string[];
}

export default function InviteParentsPage() {
  const [emailInput, setEmailInput] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  const [addedParents, setAddedParents] = useState<AddedParent[]>([]);
  const [error, setError] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

  // 🔹 Načítanie detí z databázy
  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch(`${API_BASE}/child`, { credentials: "include" });
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          setChildren(data.data);
        }
      } catch (err) {
        console.error("Chyba pri načítaní detí:", err);
      }
    }
    fetchChildren();
  }, []);

  const normalize = (v: string) => v.trim().toLowerCase();
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const pendingCount = useMemo(() => addedParents.length, [addedParents]);

  const filteredChildren = children.filter((c) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  async function addEmail(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const candidate = normalize(emailInput);
    setBanner(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Zadajte meno aj priezvisko.");
      return;
    }
    if (!phone.trim()) {
      setError("Zadajte telefónne číslo.");
      return;
    }
    if (!candidate || !isValidEmail(candidate)) {
      setError("Zadajte platný e-mail.");
      return;
    }
    if (addedParents.some(p => p.email === candidate)) {
      setError("Tento e-mail už je v zozname.");
      return;
    }
    if (selectedChildren.length === 0) {
      setError("Vyberte aspoň jedno dieťa.");
      return;
    }

    try {
      // 1️⃣ Vytvorenie rodiča
      const resUser = await fetch(`${API_BASE}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: candidate,
          phone,
          roleId: 3,
          active: false,
        }),
      });

      const userData = await resUser.json();
      if (!resUser.ok || !userData.success) {
        throw new Error(userData.error || "Nepodarilo sa vytvoriť rodiča.");
      }

      const userId = userData.data.id;

      // 2️⃣ Priradenie detí
      for (const childId of selectedChildren) {
        await fetch(`${API_BASE}/guardian/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            childId,
            relationship: "parent",
          }),
        });
      }

      // 3️⃣ Pridanie do zoznamu
      const childNames = children
        .filter(c => selectedChildren.includes(String(c.id)))
        .map(c => `${c.firstName} ${c.lastName}`);

      setAddedParents(prev => [...prev, {
        email: candidate,
        firstName,
        lastName,
        children: childNames,
      }]);

      // 4️⃣ Reset formulára
      setEmailInput("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setSelectedChildren([]);
      setSearch("");
      setError("");
      setBanner({ type: "success", text: "Rodič úspešne pridaný do databázy a priradené deti." });
    } catch (err) {
      console.error("❌ Chyba pri pridávaní rodiča:", err);
      setBanner({ type: "error", text: "Nepodarilo sa pridať rodiča." });
    }
  }

  function removeParent(idx: number) {
    setAddedParents((prev) => prev.filter((_, i) => i !== idx));
  }

  async function sendInvites() {
    if (addedParents.length === 0) {
      setError("Nie je koho pozvať.");
      return;
    }
    try {
      setSending(true);
      const emails = addedParents.map(p => p.email);
      const response = await fetch(`${API_BASE}/auth/register/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Nepodarilo sa odoslať pozvánky.");

      setBanner({
        type: "success",
        text: `Pozvánky spracované: ${data.summary.sent} odoslané, ${data.summary.skipped} preskočené, ${data.summary.failed} zlyhali.`,
      });
      setAddedParents([]);
    } catch (err: any) {
      setBanner({ type: "error", text: err.message || "Chyba pri odosielaní pozvánok." });
    } finally {
      setSending(false);
    }
  }

  function toggleChild(id: string) {
    setSelectedChildren((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  return (
    <>
      <Header />
      <main className="govuk-main-wrapper govuk-width-container" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Pozvanie rodičov – vytvorenie konta</h1>

            <form onSubmit={addEmail} className="govuk-!-margin-bottom-6">
              <div className="govuk-form-group">
                <label className="govuk-label">Meno</label>
                <input className="govuk-input govuk-!-width-one-half"
                  value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label">Priezvisko</label>
                <input className="govuk-input govuk-!-width-one-half"
                  value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label">Telefón</label>
                <input className="govuk-input govuk-!-width-one-half"
                  value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+421 900 123 456" />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label">E-mail rodiča</label>
                <input className="govuk-input govuk-!-width-two-thirds"
                  value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="meno.priezvisko@example.com" />
              </div>

              {/* Výber detí */}
              <div className="govuk-form-group">
                <label className="govuk-label">Priradiť dieťa</label>
                <input
                  type="text"
                  className="govuk-input govuk-!-width-two-thirds"
                  placeholder="Vyhľadať dieťa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="govuk-checkboxes govuk-!-margin-top-2">
                  {filteredChildren.slice(0, 3).map((child) => (
                    <div className="govuk-checkboxes__item" key={child.id}>
                      <input
                        className="govuk-checkboxes__input"
                        id={`child-${child.id}`}
                        type="checkbox"
                        checked={selectedChildren.includes(String(child.id))}
                        onChange={() => toggleChild(String(child.id))}
                      />
                      <label className="govuk-label govuk-checkboxes__label" htmlFor={`child-${child.id}`}>
                        {child.firstName} {child.lastName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="govuk-button">Pridať</button>
            </form>

            {/* Zoznam pridaných rodičov */}
            {pendingCount > 0 && (
              <>
                <h2 className="govuk-heading-m">Zoznam pridaných rodičov ({pendingCount})</h2>
                <dl className="govuk-summary-list invite-list">
                  {addedParents.map((p, idx) => (
                    <div className="govuk-summary-list__row" key={p.email}>
                      <dt className="govuk-summary-list__key">
                        {p.firstName} {p.lastName} — {p.email}
                        <br />
                        <small className="govuk-hint">
                          Deti: {p.children.join(", ")}
                        </small>
                      </dt>
                      <dd className="govuk-summary-list__actions">
                        <button type="button" className="govuk-link" onClick={() => removeParent(idx)}>
                          odstrániť
                        </button>
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {/* Odošlanie pozvánok */}
            <div className="govuk-button-group govuk-!-margin-top-6">
              <button
                type="button"
                onClick={sendInvites}
                className="govuk-button"
                disabled={pendingCount === 0 || sending}
              >
                {sending ? "Odosielam…" : "Odoslať pozvánky"}
              </button>
            </div>

            {banner && (
              <div
                className={`govuk-notification-banner govuk-!-margin-top-6 ${banner.type === "success" ? "govuk-notification-banner--success" : ""}`}
                role="region"
              >
                <div className="govuk-notification-banner__content">
                  <p className="govuk-body">{banner.text}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
