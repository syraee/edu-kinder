"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import Header from '@/app/components/Header';

export default function InviteParentsPage() {

  const [emailInput, setEmailInput] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const API_BASE = "http://localhost:5000/api";

  const mockChildren = [
    { id: "1", name: "Adam Novák" },
    { id: "2", name: "Ema Horváthová" },
    { id: "3", name: "Janko Mrkvička" },
  ];

  const normalize = (v: string) => v.trim().toLowerCase();
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const pendingCount = useMemo(() => emails.length, [emails]);

  function addEmail(raw?: string) {
    const candidate = normalize(raw ?? emailInput);
    setBanner(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Zadajte meno aj priezvisko.");
      return;
    }
    if (!phone.trim()) {
      setError("Zadajte telefónne číslo.");
      return;
    }
    if (!candidate) {
      setError("Zadajte e-mail.");
      return;
    }
    if (!isValidEmail(candidate)) {
      setError("Zadajte platný e-mail v tvare meno@domena.sk.");
      return;
    }
    if (emails.includes(candidate)) {
      setError("Tento e-mail už je v zozname.");
      return;
    }
    if (emails.length >= 50) {
      setError("Maximálny počet e-mailov na jedno odoslanie je 50.");
      return;
    }
    if (selectedChildren.length === 0) {
      setError("Vyberte aspoň jedno dieťa.");
      return;
    }

    setEmails((prev) => [...prev, candidate]);
    setEmailInput("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setSelectedChildren([]);
    setError("");
  }

  function removeEmail(idx: number) {
    setEmails((prev) => prev.filter((_, i) => i !== idx));
    setBanner(null);
  }

  function clearAll() {
    setEmails([]);
    setBanner(null);
  }

  async function sendInvites() {
    setError("");
    setBanner(null);

    if (emails.length === 0) {
      setError("Pridajte aspoň jeden e-mail.");
      return;
    }

    try {
      setSending(true);

      const response = await fetch(API_BASE + "/auth/register/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
        credentials: "include", // 👈 prenesie cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nepodarilo sa odoslať pozvánky.");
      }

      setBanner({
        type: "success",
        text: `Pozvánky spracované: ${data.summary.sent} odoslané, ${data.summary.skipped} preskočené, ${data.summary.failed} zlyhali.`,
      });

      console.log("Detaily:", data.details);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message :
          typeof err === "string" ? err :
            "Nepodarilo sa odoslať pozvánky.";
      setBanner({ type: "error", text: message });
    } finally {
      setSending(false);
    }
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    addEmail();
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
            <p className="govuk-body">
              Zadajte údaje rodiča a kliknite na <b>Pridať</b>. Môžete pridať viacero rodičov a následne stlačiť <b>Odoslať pozvánky</b>.
            </p>

            {banner && (
              <div
                className={`govuk-notification-banner ${banner.type === "success" ? "govuk-notification-banner--success" : ""}`}
                role="region"
                aria-labelledby="govuk-notification-banner-title"
                data-module="govuk-notification-banner"
              >
                <div className="govuk-notification-banner__header">
                  <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
                    {banner.type === "success" ? "Úspech" : "Stav"}
                  </h2>
                </div>
                <div className="govuk-notification-banner__content">
                  <p className="govuk-body">{banner.text}</p>
                </div>
              </div>
            )}

            <form noValidate onSubmit={handleAddSubmit} className="govuk-!-margin-bottom-6">
              {/* Meno */}
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="firstName">Meno</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="govuk-input govuk-!-width-one-half"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              {/* Priezvisko */}
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="lastName">Priezvisko</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="govuk-input govuk-!-width-one-half"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              {/* Telefón */}
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="phone">Telefón</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="govuk-input govuk-!-width-one-half"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+421 900 123 456"
                />
              </div>

              {/* E-mail */}
              <div className={`govuk-form-group ${error ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="parent-email">E-mail rodiča</label>
                <div id="parent-email-hint" className="govuk-hint">Napr. meno.priezvisko@example.com</div>
                {error && (
                  <p id="parent-email-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Chyba:</span> {error}
                  </p>
                )}
                <input
                  id="parent-email"
                  name="parent-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="govuk-input govuk-!-width-two-thirds"
                  aria-describedby={error ? "parent-email-hint parent-email-error" : "parent-email-hint"}
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); if (error) setError(""); }}
                  placeholder="meno.priezvisko@example.com"
                />
              </div>

              {/* Výber detí */}
              <div className="govuk-form-group">
                <label className="govuk-label">Priradiť dieťa</label>
                <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                  {mockChildren.map((child) => (
                    <div className="govuk-checkboxes__item" key={child.id}>
                      <input
                        className="govuk-checkboxes__input"
                        id={`child-${child.id}`}
                        type="checkbox"
                        value={child.id}
                        checked={selectedChildren.includes(child.id)}
                        onChange={() => toggleChild(child.id)}
                      />
                      <label className="govuk-label govuk-checkboxes__label" htmlFor={`child-${child.id}`}>
                        {child.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="govuk-button" data-module="govuk-button">Pridať</button>
            </form>

            {pendingCount > 0 && (
              <>
                <h2 className="govuk-heading-m">Zoznam pozvánok ({pendingCount})</h2>
                <dl className="govuk-summary-list invite-list">
                  {emails.map((em, idx) => (
                    <div className="govuk-summary-list__row" key={em}>
                      <dt className="govuk-summary-list__key">{em}</dt>
                      <dd className="govuk-summary-list__actions">
                        <button type="button" className="govuk-link invite-remove" onClick={() => removeEmail(idx)}>
                          odstrániť<span className="govuk-visually-hidden"> {em}</span>
                        </button>
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            <div className="govuk-button-group">
              <button
                type="button"
                onClick={sendInvites}
                className="govuk-button"
                data-module="govuk-button"
                disabled={pendingCount === 0 || sending}
              >
                {sending ? "Odosielam…" : "Odoslať pozvánky"}
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={clearAll}
                disabled={pendingCount === 0 || sending}
              >
                Vymazať všetko
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
