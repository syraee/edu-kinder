"use client";
import {useRef, useState} from "react";
import Link from "next/link";
type State = "default" | "sent" | "error";
export default function PrihlaseniePage() {
    const [state, setState] = useState<State>("default");
    const [email, setEmail] = useState("");
    const [emailErr, setEmailErr] = useState<string | null>(null);
    const errSummaryRef = useRef<HTMLDivElement>(null);

    const hasError = !!emailErr;
    const emailErrorId = "email-error";
    const emailHintId = "email-hint";


    function isValidEmail(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    function handleSubmit(e: React.FormEvent) {
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

        setEmailErr(null);
        setState("sent");
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

                        <div className="govuk-header__btns-search">
                            <div className="govuk-header__mobile-menu desktop-hidden">
                                <button
                                    type="button"
                                    className="govuk-header__menu-button font-bold govuk-js-header-toggle"
                                    aria-controls="navigation" hidden
                                >
                                    Menu
                                </button>
                                <div className="govuk-header__actionPanel mobile desktop-hidden">
                                    <button className="govuk-button" title="Notifikácie">
                                        <span className="material-icons" aria-hidden="true">notifications</span>
                                    </button>
                                    <button type="submit" className="govuk-button govuk-button__basic" data-module="govuk-button">
                                        Primárne tlačidlo
                                    </button>
                                </div>
                            </div>

                            <div className="govuk-header__actionPanel desktop mobile-hidden">
                                <button className="govuk-button" title="Notifikácie">
                                    <span className="material-icons" aria-hidden="true">notifications</span>
                                </button>
                                <Link href="/login" className="govuk-button-prihlasenie govuk-button mobile-hidden" data-module="govuk-button">
                                    Prihlásenie
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>
            </div>


            <div className="govuk-main-wrapper govuk-width-container idsk-docs">
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
                                            <li><a href="#email">{emailErr}</a></li>
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
                                        <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">Úspech</h2>
                                    </div>
                                    <div className="govuk-notification-banner__content">
                                        <p className="govuk-body">
                                            Odkaz na prihlásenie sme poslali na <strong>{email || "zadaný e-mail"}</strong>. Platí 10 minút a je jednorazový.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* FORM – ak nie je sent */}
                            {state !== "sent" && (
                                <form noValidate onSubmit={handleSubmit}>
                                    <div className={`govuk-form-group ${hasError ? "govuk-form-group--error" : ""}`}>
                                        <label className="govuk-label govuk-label--m" htmlFor="email">E-mail</label>

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
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(null); }}
                                            aria-describedby={`${emailHintId}${hasError ? ` ${emailErrorId}` : ""}`}
                                            aria-invalid={hasError}
                                            required
                                        />
                                    </div>

                                    <div className="govuk-button-group">
                                        <button type="submit" className="govuk-button" data-module="govuk-button">
                                            Pošlite mi odkaz
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}