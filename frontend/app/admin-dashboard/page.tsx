"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import Header from '@/app/components/Header';

export default function InviteParentsPage() {

  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const normalize = (v: string) => v.trim().toLowerCase();
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const pendingCount = useMemo(() => emails.length, [emails]);

  function addEmail(raw?: string) {
    const candidate = normalize(raw ?? emailInput);
    setBanner(null);

    if (!candidate) {
      setError("Zadajte e‑mail.");
      return;
    }
    if (!isValidEmail(candidate)) {
      setError("Zadajte platný e‑mail v tvare meno@domena.sk.");
      return;
    }
    if (emails.includes(candidate)) {
      setError("Tento e‑mail už je v zozname.");
      return;
    }
    if (emails.length >= 50) {
      setError("Maximálny počet e‑mailov na jedno odoslanie je 50.");
      return;
    }

    setEmails((prev) => [...prev, candidate]);
    setEmailInput("");
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
      setError("Pridajte aspoň jeden e‑mail.");
      return;
    }

    try {
      setSending(true);

      setBanner({ type: "success", text: `Pozvánky boli odoslané (${emails.length}).` });

      setEmails([]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : typeof err === "string" ? err : "Nepodarilo sa odoslať pozvánky.";
      setBanner({ type: "error", text: message });
    } finally {
      setSending(false);
    }
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    addEmail();
  }

  return (
  <>
   <Header />

    <main className="govuk-main-wrapper govuk-width-container" id="main-content" role="main">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Pozvanie rodičov – vytvorenie konta</h1>
          <p className="govuk-body">Zadajte e-mail rodiča a kliknite na <b>Pridať</b>. Môžete pridať viacero e-mailov a následne stlačiť <b>Odoslať pozvánky</b>.</p>

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
            <button type="submit" className="govuk-button" data-module="govuk-button">Pridať</button>
          </form>

          {pendingCount > 0 && (
            <>
              <h2 className="govuk-heading-m">Zoznam pozvánok ({pendingCount})</h2>
              <dl className="govuk-summary-list invite-list">
                {emails.map((em, idx) => (
                  <div className="govuk-summary-list__row" key={em}>
                    <dt className="govuk-summary-list__key">
                      {em}
                    </dt>
                    
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

          <details className="govuk-details govuk-!-margin-top-6" data-module="govuk-details">
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">Ako funguje pozývanie?</span>
            </summary>
            <div className="govuk-details__text">
              Systém odošle rodičom e-maily s unikátnym odkazom na registráciu. Po vyplnení registračného formulára sa konto aktivuje.
            </div>
          </details>
        </div>
      </div>
    </main>
  </>
);
}
