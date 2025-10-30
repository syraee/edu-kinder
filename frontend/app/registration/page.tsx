"use client";
import Link from "next/link";
import { useState } from "react";

type Child = { id: string; firstName: string; lastName: string; birthDate: string };
type FieldError = string | null;

const AGE_MIN = 1;
const AGE_MAX = 8;

function isEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Slovenské čísla: +4219XXXXXXXX alebo 09XXXXXXXX
function normalizePhone(raw: string) {
    const v = raw.replace(/[\s-]+/g, "");
    if (/^09\d{8}$/.test(v)) return "+421" + v.slice(1); // 09.. -> +4219..
    return v;
}
function isSkMobile(v: string) {
    const n = normalizePhone(v);
    return /^\+4219\d{8}$/.test(n);
}

function yearsBetween(d: Date, ref = new Date()) {
    const diff = ref.getTime() - d.getTime();
    return diff / (365.2425 * 24 * 3600 * 1000);
}

export default function Home() {
    // ====== STAV ======
    const [parent, setParent] = useState({ firstName: "", lastName: "", email: "", phone: "" });
    const [children, setChildren] = useState<Child[]>([
        { id: crypto.randomUUID(), firstName: "", lastName: "", birthDate: "" },
    ]);
    const [submitting, setSubmitting] = useState(false);

    // ERRORS
    const [parentErr, setParentErr] = useState<Record<keyof typeof parent, FieldError>>({
        firstName: null, lastName: null, email: null, phone: null,
    });
    const [childErr, setChildErr] = useState<Record<string, { firstName: FieldError; lastName: FieldError; birthDate: FieldError }>>({});

    // ====== HANDLERY ======
    function updateParent<K extends keyof typeof parent>(key: K, value: string) {
        setParent((p) => ({ ...p, [key]: value }));
        setParentErr((e) => ({ ...e, [key]: null }));
    }
    function updateChild(id: string, key: keyof Child, value: string) {
        setChildren((arr) => arr.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
        setChildErr((e) => ({ ...e, [id]: { ...(e[id] || { firstName: null, lastName: null, birthDate: null }), [key]: null } }));
    }
    function addChild() {
        setChildren((arr) => [...arr, { id: crypto.randomUUID(), firstName: "", lastName: "", birthDate: "" }]);
    }
    function removeChild(id: string) {
        setChildren((arr) => (arr.length <= 1 ? arr : arr.filter((c) => c.id !== id)));
        setChildErr((e) => {
            const copy = { ...e }; delete copy[id]; return copy;
        });
    }

    // TRIM na blur
    function trimParent<K extends keyof typeof parent>(key: K) {
        setParent((p) => ({ ...p, [key]: p[key].trim() }));
    }
    function trimChild(id: string, key: keyof Child) {
        setChildren((arr) => arr.map((c) => (c.id === id ? { ...c, [key]: String(c[key]).trim() } : c)));
    }

    // VALIDÁCIA
    function validate(): boolean {
        const pe: typeof parentErr = { firstName: null, lastName: null, email: null, phone: null };
        const ce: typeof childErr = {};

        // rodič
        const fn = parent.firstName.trim();
        const ln = parent.lastName.trim();
        const em = parent.email.trim().toLowerCase();
        const ph = parent.phone.trim();

        if (!fn) pe.firstName = "Zadajte meno.";
        if (!ln) pe.lastName = "Zadajte priezvisko.";
        if (!em || !isEmail(em)) pe.email = "Zadajte platný e-mail.";
        if (!ph || !isSkMobile(ph)) pe.phone = "Zadajte slovenské mobilné číslo (+4219...).";

        // deti
        for (const c of children) {
            const id = c.id;
            const rec = { firstName: null as FieldError, lastName: null as FieldError, birthDate: null as FieldError };
            const cfn = c.firstName.trim();
            const cln = c.lastName.trim();
            const bdStr = c.birthDate.trim();

            if (!cfn) rec.firstName = "Zadajte meno dieťaťa.";
            if (!cln) rec.lastName = "Zadajte priezvisko dieťaťa.";

            if (!bdStr) {
                rec.birthDate = "Zadajte dátum narodenia.";
            } else {
                const bd = new Date(bdStr);
                if (Number.isNaN(bd.getTime())) {
                    rec.birthDate = "Neplatný dátum.";
                } else {
                    const now = new Date();
                    if (bd > now) rec.birthDate = "Dátum nemôže byť v budúcnosti.";
                    const age = yearsBetween(bd, now);
                    if (age < AGE_MIN || age > AGE_MAX) {
                        rec.birthDate = `Vek dieťaťa mimo rozsah ${AGE_MIN}–${AGE_MAX} rokov.`;
                    }
                }
            }
            ce[id] = rec;
        }

        setParentErr(pe);
        setChildErr(ce);

        // ak existuje aspoň 1 chyba
        const parentHas = Object.values(pe).some(Boolean);
        const childHas = Object.values(ce).some((r) => r.firstName || r.lastName || r.birthDate);
        return !(parentHas || childHas);
    }

    async function handleFinish(e: React.FormEvent) {
        e.preventDefault();

        setParent((p) => ({ ...p, firstName: p.firstName.trim(), lastName: p.lastName.trim(), email: p.email.trim(), phone: p.phone.trim() }));
        setChildren((arr) => arr.map((c) => ({ ...c, firstName: c.firstName.trim(), lastName: c.lastName.trim(), birthDate: c.birthDate.trim() })));

        if (!validate()) return;

        try {
            setSubmitting(true);


        } finally {
            setSubmitting(false);
        }
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
                                                    Toto je oficiálna webová stránka orgánu verejnej moci Slovenskej republiky. Oficiálne stránky využívajú najmä doménu gov.sk.
                                                    <a className="govuk-link--inverse" href="https://www.slovensko.sk/sk/agendy/agenda/_organy-verejnej-moci" target="_blank"> Odkazy na jednotlivé webové sídla orgánov verejnej moci nájdete na tomto odkaze. </a>
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="govuk-body-s"><b>Táto stránka je zabezpečená</b></h3>
                                                <p className="govuk-body-s max-width77-desktop">Buďte pozorní a vždy sa uistite, že zdieľate informácie iba cez zabezpečenú webovú stránku verejnej správy SR.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="idsk-dropdown__wrapper idsk-secondary-navigation__dropdown" data-pseudolabel="jazykové menu">
                                    <button className="govuk-button govuk-button--texted--inverse idsk-secondary-navigation__heading-button idsk-dropdown" aria-label="Rozbaliť jazykové menu" aria-haspopup="listbox">
                                        <span>slovenčina</span>
                                        <span className="material-icons" aria-hidden="true">arrow_drop_down</span>
                                    </button>
                                    <ul className="idsk-dropdown__options idsk-shadow-medium">
                                        <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="eng"><a href="#" lang="en">eng</a></li>
                                        <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="slo"><a href="#" lang="sk">slo</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="govuk-predheader govuk-width-container">
                        <div className="govuk-header__logo">
                            <Link href="/" className="govuk-header__link govuk-header__link--homepage" title="Odkaz na titulnú stránku">
                                <img src="/idsk-assets/images/logo_upejesko.jpg" alt="Logo Škôlky s odkazom na titulnú stránku" />
                            </Link>
                        </div>
                    </div>
                </header>
            </div>


            <div className="govuk-width-container">
                <main className="govuk-main-wrapper auth-center" id="main-content" role="main">
                    <div className="auth-form">
                        <h1 className="govuk-heading-xl">Registrácia</h1>

                        <form noValidate onSubmit={handleFinish}>
                            {/* RODIČ */}
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h2 className="govuk-fieldset__heading">Rodič / zákonný zástupca</h2>
                                </legend>

                                <div className={`govuk-form-group ${parentErr.firstName ? "govuk-form-group--error" : ""}`}>
                                    <label className="govuk-label" htmlFor="parent-firstName">Meno</label>
                                    {parentErr.firstName && <p className="govuk-error-message"><span className="govuk-visually-hidden">Chyba:</span> {parentErr.firstName}</p>}
                                    <input
                                        className={`govuk-input govuk-input--width-20 ${parentErr.firstName ? "govuk-input--error" : ""}`}
                                        id="parent-firstName"
                                        type="text"
                                        value={parent.firstName}
                                        onChange={(e) => updateParent("firstName", e.target.value)}
                                        onBlur={() => trimParent("firstName")}
                                        required
                                    />
                                </div>

                                <div className={`govuk-form-group ${parentErr.lastName ? "govuk-form-group--error" : ""}`}>
                                    <label className="govuk-label" htmlFor="parent-lastName">Priezvisko</label>
                                    {parentErr.lastName && <p className="govuk-error-message"><span className="govuk-visually-hidden">Chyba:</span> {parentErr.lastName}</p>}
                                    <input
                                        className={`govuk-input govuk-input--width-20 ${parentErr.lastName ? "govuk-input--error" : ""}`}
                                        id="parent-lastName"
                                        type="text"
                                        value={parent.lastName}
                                        onChange={(e) => updateParent("lastName", e.target.value)}
                                        onBlur={() => trimParent("lastName")}
                                        required
                                    />
                                </div>

                                <div className={`govuk-form-group ${parentErr.email ? "govuk-form-group--error" : ""}`}>
                                    <label className="govuk-label" htmlFor="parent-email">E-mail</label>
                                    {parentErr.email && <p className="govuk-error-message"><span className="govuk-visually-hidden">Chyba:</span> {parentErr.email}</p>}
                                    <input
                                        className={`govuk-input govuk-input--width-20 ${parentErr.email ? "govuk-input--error" : ""}`}
                                        id="parent-email"
                                        type="email"
                                        autoComplete="email"
                                        value={parent.email}
                                        onChange={(e) => updateParent("email", e.target.value)}
                                        onBlur={() => trimParent("email")}
                                        required
                                    />
                                </div>

                                <div className={`govuk-form-group ${parentErr.phone ? "govuk-form-group--error" : ""}`}>
                                    <label className="govuk-label" htmlFor="parent-phone">Telefón</label>
                                    <span className="govuk-hint">Formát: +421 9xx xxx xxx</span>
                                    {parentErr.phone && <p className="govuk-error-message"><span className="govuk-visually-hidden">Chyba:</span> {parentErr.phone}</p>}
                                    <input
                                        className={`govuk-input govuk-input--width-20 ${parentErr.phone ? "govuk-input--error" : ""}`}
                                        id="parent-phone"
                                        type="tel"
                                        inputMode="tel"
                                        value={parent.phone}
                                        onChange={(e) => updateParent("phone", e.target.value)}
                                        onBlur={() => setParent((p) => ({ ...p, phone: normalizePhone(p.phone) }))}
                                        required
                                    />
                                </div>
                            </fieldset>

                            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

                            {/* DETI */}
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h2 className="govuk-fieldset__heading">Dieťa / deti</h2>
                                </legend>

                                {children.map((c, idx) => {
                                    const base = `child-${c.id}`;
                                    const errs = childErr[c.id] || { firstName: null, lastName: null, birthDate: null };
                                    return (
                                        <div key={c.id} className="govuk-inset-text">
                                            <h3 className="govuk-heading-m govuk-!-margin-bottom-2">Dieťa {idx + 1}</h3>

                                            <div className={`govuk-form-group ${errs.firstName ? "govuk-form-group--error" : ""}`}>
                                                <label className="govuk-label" htmlFor={`${base}-firstName`}>Meno</label>
                                                {errs.firstName && <p className="govuk-error-message"><span className="govuk-visually-hidden">Chyba:</span> {errs.firstName}</p>}
                                                <input
                                                    className={`govuk-input govuk-input--width-20 ${errs.firstName ? "govuk-input--error" : ""}`}
                                                    id={`${base}-firstName`}
                                                    type="text"
                                                    value={c.firstName}
                                                    onChange={(e) => updateChild(c.id, "firstName", e.target.value)}
                                                    onBlur={() => trimChild(c.id, "firstName")}
                                                    required
                                                />
                                            </div>

                                            <div className={`govuk-form-group ${errs.lastName ? "govuk-form-group--error" : ""}`}>
                                                <label className="govuk-label" htmlFor={`${base}-lastName`}>Priezvisko</label>
                                                {errs.lastName && <p className="govuk-error-message"><span className="govuk-visually-hidden">Chyba:</span> {errs.lastName}</p>}
                                                <input
                                                    className={`govuk-input govuk-input--width-20 ${errs.lastName ? "govuk-input--error" : ""}`}
                                                    id={`${base}-lastName`}
                                                    type="text"
                                                    value={c.lastName}
                                                    onChange={(e) => updateChild(c.id, "lastName", e.target.value)}
                                                    onBlur={() => trimChild(c.id, "lastName")}
                                                    required
                                                />
                                            </div>

                                            <div className={`govuk-form-group ${errs.birthDate ? "govuk-form-group--error" : ""}`}>
                                                <label className="govuk-label" htmlFor={`${base}-birthDate`}>Dátum narodenia</label>
                                                {errs.birthDate && <p className="govuk-error-message"><span className="govuk-visually-hidden">Chyba:</span> {errs.birthDate}</p>}
                                                <input
                                                    className={`govuk-input govuk-!-width-two-thirds ${errs.birthDate ? "govuk-input--error" : ""}`}
                                                    id={`${base}-birthDate`}
                                                    type="date"
                                                    value={c.birthDate}
                                                    onChange={(e) => updateChild(c.id, "birthDate", e.target.value)}
                                                    onBlur={() => trimChild(c.id, "birthDate")}
                                                    required
                                                />
                                            </div>

                                            {children.length > 1 && (
                                                <div className="govuk-button-group">
                                                    <button type="button" className="govuk-button govuk-button--secondary" onClick={() => removeChild(c.id)}>
                                                        Odstrániť toto dieťa
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                <div className="govuk-button-group">
                                    <button type="button" className="govuk-button govuk-button--secondary" onClick={addChild} data-module="govuk-button">
                                        + Pridať dieťa
                                    </button>
                                </div>
                            </fieldset>

                            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

                            {/* SUBMIT */}
                            <div className="govuk-button-group">
                                <button type="submit" className="govuk-button" data-module="govuk-button" disabled={submitting}>
                                    {submitting ? "Ukladám…" : "Uložiť a dokončiť registráciu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

        </>
    );
}
