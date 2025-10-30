"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";

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
    <div className="govuk-header__wrapper">
      <header className="govuk-header idsk-shadow-head" data-module="govuk-header">
        <div className="govuk-header__container ">
          <div className="idsk-secondary-navigation govuk-width-container">
            <div className="idsk-secondary-navigation__header">
              <div className="idsk-secondary-navigation__heading">
                <div className="idsk-secondary-navigation__heading-title">
                  <span className="idsk-secondary-navigation__heading-mobile">SK</span>
                </div>

                <div className="idsk-secondary-navigation__body hidden" data-testid="secnav-children">
                  <div className="idsk-secondary-navigation__text">
                    <div>
                      <h3 className="govuk-body-s"><b>Doména gov.sk je oficiálna</b></h3>
                      <p className="govuk-body-s">
                        Toto je oficiálna webová stránka orgánu verejnej moci Slovenskej republiky. Oficiálne stránky
                        využívajú najmä doménu gov.sk.
                        <a
                          className="govuk-link--inverse"
                          href="https://www.slovensko.sk/sk/agendy/agenda/_organy-verejnej-moci"
                          target="_blank"
                        >
                          Odkazy na jednotlivé webové sídla orgánov verejnej moci nájdete na tomto odkaze.
                        </a>
                      </p>
                    </div>
                    <div>
                      <h3 className="govuk-body-s"><b>Táto stránka je zabezpečená</b></h3>
                      <p className="govuk-body-s max-width77-desktop">
                        Buďte pozorní a vždy sa uistite, že zdieľate informácie iba cez zabezpečenú webovú stránku
                        verejnej správy SR. Zabezpečená stránka vždy začína https:// pred názvom domény webového sídla.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="idsk-dropdown__wrapper idsk-secondary-navigation__dropdown"
                data-pseudolabel="jazykové menu"
              >
                <button
                  className="govuk-button govuk-button--texted--inverse idsk-secondary-navigation__heading-button idsk-dropdown"
                  aria-label="Rozbaliť jazykové menu"
                  aria-haspopup="listbox"
                >
                  <span>slovenčina</span>
                  <span className="material-icons" aria-hidden="true">arrow_drop_down</span>
                </button>
                <ul className="idsk-dropdown__options idsk-shadow-medium">
                  <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="eng">
                    <a href="#" lang="en">eng</a>
                  </li>
                  <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="slo">
                    <a href="#" lang="sk">slo</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="govuk-predheader govuk-width-container">
          <div className="govuk-header__logo">
            <Link
              href="/"
              className="govuk-header__link govuk-header__link--homepage"
              title="Odkaz na titulnú stránku"
            >
              <img
                src="/idsk-assets/images/logo_upejesko.jpg"
                alt="Logo Škôlky s odkazom na titulnú stránku"
              />
            </Link>
          </div>

          <div className="govuk-header__btns-search" >
              <div className="govuk-header__mobile-menu desktop-hidden">
                <button type="button" className="govuk-header__menu-button font-bold govuk-js-header-toggle" aria-controls="navigation" hidden>
                  Menu
                </button>
                <div className="govuk-header__actionPanel mobile desktop-hidden">
                  <button className="govuk-button" title="Notifikácie"><span role="button" className="material-icons" aria-hidden="true">notifications</span></button>
                  <button className="govuk-button" title="Informácie o portáli"><span role="button" className="material-icons" aria-hidden="true">info</span></button>
                </div>
              </div>

              <div className="govuk-header__actionPanel desktop mobile-hidden">
                <button className="govuk-button" title="Notifikácie"><span role="button" className="material-icons" aria-hidden="true">notifications</span></button>
                <button className="govuk-button" title="Informácie o portáli"><span role="button" className="material-icons" aria-hidden="true">info</span></button>
                <button className="govuk-button govuk-header__profile_button" title="Profil">MM</button>
              </div>
            </div>
        </div>

        <nav id="navigation" aria-label="Menu" className="govuk-header__navigation govuk-width-container">
          <span className="text">Menu</span>
          <div className="govuk-header__navigation-list">
            <ul>
              <li className="govuk-header__navigation-item">
                <Link className="govuk-header__link" href="/strava/jedalny-listok" title="Strava">
                  Strava
                </Link>
              </li>
              <li className="govuk-header__navigation-item">
                  <Link className="govuk-header__link" href="/gallery" title="Fotogaléria">
                    Fotogaléria
                  </Link>
                </li>
              <li className="govuk-header__navigation-item">
                <a className="govuk-header__link" href="#3" title="Dochádzka">
                  Dochádzka
                </a>
              </li>
              <li className="govuk-header__navigation-item">
                <a className="govuk-header__link" href="#4" title="Podujatia">
                  Podujatia
                </a>
              </li>
              <li className="govuk-header__navigation-item">
                <a className="govuk-header__link" href="#5" title="Oznamy">
                  Oznamy
                </a>
              </li>
              <li className="govuk-header__navigation-item govuk-header__navigation-item--active">
                <a className="govuk-header__link" href="/admin-dashboard" title="Registracia">
                  Registracia Uživateľov
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    </div>

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
