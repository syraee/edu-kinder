"use client";

import Header from "@/app/components/Header";
import { useRef, useState } from "react";

type State = "default" | "sent" | "error";

const API_BASE = "http://localhost:5000";

export default function PrihlaseniePage() {
  const [state, setState] = useState<State>("default");
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const errSummaryRef = useRef<HTMLDivElement>(null);

  const hasError = !!emailErr;
  const emailErrorId = "email-error";
  const emailHintId = "email-hint";

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();

    if (!trimmed) {
      setEmailErr("Zadajte e-mailovú adresu.");
      setState("error");
      queueMicrotask(() => errSummaryRef.current?.focus());
      return;
    }

    if (!isValidEmail(trimmed)) {
      setEmailErr("Zadajte platnú e-mailovú adresu.");
      setState("error");
      queueMicrotask(() => errSummaryRef.current?.focus());
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/login/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Chyba pri odoslaní.");
      }

      setEmail(trimmed);
      setEmailErr(null);
      setState("sent");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Neznáma chyba";

      setEmailErr(message);
      setState("error");
      queueMicrotask(() => errSummaryRef.current?.focus());
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <div className="login-page">
        {/* Width container a main wrapper nech sú "správne" – nezdvojuj govuk-main-wrapper */}
        <div className="govuk-width-container idsk-docs">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <h1 className="govuk-heading-xl">Prihlásenie</h1>

                <p className="govuk-body-l">
                  Zadajte e-mail a pošleme Vám prihlasovací odkaz (platnosť 15 minút).
                </p>

                {/* ERROR summary */}
                {state === "error" && hasError && (
                  <div
                    ref={errSummaryRef}
                    className="govuk-error-summary"
                    aria-labelledby="error-summary-title"
                    role="alert"
                    tabIndex={-1}
                    data-module="govuk-error-summary"
                  >
                    <h2 className="govuk-error-summary__title" id="error-summary-title">
                      Je potrebné opraviť chybu
                    </h2>

                    <div className="govuk-error-summary__body">
                      <ul className="govuk-list govuk-error-summary__list">
                        <li>
                          <a href="#email">{emailErr}</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* SUCCESS banner */}
                {state === "sent" && (
                  <div
                    className="govuk-notification-banner govuk-notification-banner--success"
                    role="region"
                    aria-labelledby="govuk-notification-banner-title"
                    data-module="govuk-notification-banner"
                  >
                    <div className="govuk-notification-banner__header">
                      <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
                        Úspech
                      </h2>
                    </div>

                    <div className="govuk-notification-banner__content">
                      <p className="govuk-body">
                        Odkaz na prihlásenie sme poslali na <strong>{email || "zadaný e-mail"}</strong>. Platí 15 minút a je jednorazový.
                      </p>
                    </div>
                  </div>
                )}

                {/* FORM – ak nie je sent */}
                {state !== "sent" && (
                  <form noValidate onSubmit={handleSubmit}>
                    <div className={`govuk-form-group ${hasError ? "govuk-form-group--error" : ""}`}>
                      <label className="govuk-label govuk-label--m" htmlFor="email">
                        E-mail
                      </label>

                      {/* (voliteľné) hint */}
                      <div id={emailHintId} className="govuk-hint">
                        Napr. meno.priezvisko@email.com
                      </div>

                      {hasError && (
                        <p id={emailErrorId} className="govuk-error-message">
                          <span className="govuk-visually-hidden">Chyba:</span> {emailErr}
                        </p>
                      )}

                      <input
                        className={`govuk-input govuk-input--width-20 ${hasError ? "govuk-input--error" : ""}`}
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailErr) setEmailErr(null);
                        }}
                        aria-describedby={`${emailHintId}${hasError ? ` ${emailErrorId}` : ""}`}
                        aria-invalid={hasError}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="govuk-button-group">
                      <button
                        type="submit"
                        className="govuk-button"
                        data-module="govuk-button"
                        disabled={loading}
                        aria-busy={loading}
                      >
                        {loading ? "Odosielam..." : "Pošlite mi odkaz"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
