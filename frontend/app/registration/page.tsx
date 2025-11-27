"use client";
import Link from "next/link";
import {useEffect, useState} from "react";
import { useSearchParams } from "next/navigation";

type Child = { id: string; firstName: string; lastName: string; birthDate: string };
type FieldError = string | null;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";
function isEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function normalizePhone(raw: string) {
    const v = raw.replace(/[\s-]+/g, "");
    if (/^09\d{8}$/.test(v)) return "+421" + v.slice(1);
    return v;
}
function isSkMobile(v: string) {
    const n = normalizePhone(v);
    return /^\+4219\d{8}$/.test(n);
}


export default function Home() {
    const search = useSearchParams();
    const token = search.get("token") ?? "";
    // ====== STAV ======
    const [parent, setParent] = useState({ firstName: "", lastName: "", email: "", phone: "", role: "" });
    const [children, setChildren] = useState<Child[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [prefillError, setPrefillError] = useState<string | null>(null);

    // ERRORS
    const [parentErr, setParentErr] = useState<Record<keyof typeof parent, FieldError>>({
        firstName: null, lastName: null, email: null, phone: null, role: null,
    });

    interface RawChild {
        id: string | number;
        firstName?: string;
        lastName?: string;
        birthDate?: string;
    }

    useEffect(() => {
        let shouldSetLoadingFalse = true;
        (async () => {
            try {
                if (!token) {
                    setPrefillError("Chýba registračný token v adrese URL.");
                    return;
                }
                const res = await fetch(`${API_BASE}/auth/register/prefill`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                    credentials: "include",
                });

                if (res.status === 409) {
                    shouldSetLoadingFalse = false;
                    const data = await res.json().catch(() => ({}));
                    window.location.href = "/login";
                    return;
                }

                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || data.message || "Nepodarilo sa načítať údaje.");

                setParent({
                    firstName: (data.parent?.firstName ?? "").trim(),
                    lastName : (data.parent?.lastName  ?? "").trim(),
                    email    : (data.parent?.email     ?? "").trim().toLowerCase(),
                    phone    : normalizePhone(data.parent?.phone ?? ""),
                    role: (data.parent?.roleId ?? "").trim(),
                });

                const kids: Child[] = (Array.isArray(data.children) ? data.children : []).map((c: RawChild) => ({
                    id: Number(c.id),
                    firstName: (c.firstName ?? "").trim(),
                    lastName : (c.lastName  ?? "").trim(),
                    birthDate: (c.birthDate ?? "").slice(0, 10),
                }));
                setChildren(kids);
            } catch (e) {
                setPrefillError("Nepodarilo sa načítať údaje.");
            } finally {
                if (shouldSetLoadingFalse) {
                    setLoading(false);
                }
            }
        })();
    }, [token]);

    // ====== HANDLERY ======
    function updateParent<K extends keyof typeof parent>(key: K, value: string) {
        setParent((p) => ({ ...p, [key]: value }));
        setParentErr((e) => ({ ...e, [key]: null }));
    }


    function trimParent<K extends keyof typeof parent>(key: K) {
        setParent((p) => ({ ...p, [key]: p[key].trim() }));
    }


    function validate(): boolean {
        const pe: typeof parentErr = { firstName: null, lastName: null, email: null, phone: null, role: null};


        const fn = parent.firstName.trim();
        const ln = parent.lastName.trim();
        const em = parent.email.trim().toLowerCase();
        const ph = parent.phone.trim();
        const rl = parent.role.trim();

        if (!fn) pe.firstName = "Meno";
        if (!ln) pe.lastName = "Priezvisko";
        if (!em || !isEmail(em)) pe.email = "Email";
        if (!ph || !isSkMobile(ph)) pe.phone = "Telefónne číslo";


        setParentErr(pe);

        const parentHas = Object.values(pe).some(Boolean);
        return !(parentHas);
    }

    async function handleFinish(e: React.FormEvent) {
        e.preventDefault();

        setParent((p) => ({ ...p, firstName: p.firstName.trim(), lastName: p.lastName.trim(), email: p.email.trim(), phone: p.phone.trim() }));

        if (!validate()) return;

        try {
            setSubmitting(true);
            const res = await fetch(`${API_BASE}/auth/register/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    token,
                    parent: {
                        firstName: parent.firstName.trim(),
                        lastName: parent.lastName.trim(),
                        email: parent.email.trim().toLowerCase(),
                        phone: normalizePhone(parent.phone),
                        role: String(parent?.role ?? ""),
                    },

                    childIds: children.map(c => c.id),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || data.message || "Uloženie zlyhalo.");


            window.location.href = "/login";



        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <>
                <div className="govuk-header__wrapper">
                    {/* ... celý tvoj header tak ako máš hore ... */}
                </div>

                <div className="govuk-width-container">
                    <main className="govuk-main-wrapper auth-center" id="main-content" role="main">
                        <div className="auth-form">
                            <h1 className="govuk-heading-xl">Registrácia</h1>
                            <p className="govuk-body">Overujeme váš registračný odkaz…</p>
                        </div>
                    </main>
                </div>
            </>
        );
    }
    const roleId = Number(parent.role);

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
                                    <span className="govuk-hint">E-mail je daný pozvánkou a nedá sa zmeniť.</span>
                                    <input
                                        className={`govuk-input govuk-input--width-20`}
                                        id="parent-email"
                                        type="email"
                                        autoComplete="email"
                                        value={parent.email}
                                        disabled
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
                            {roleId === 3 && (
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h2 className="govuk-fieldset__heading">Dieťa / deti</h2>
                                </legend>

                                {children.map((c, idx) => {
                                    const base = `child-${c.id}`;
                                    return (
                                        <div key={c.id} className="govuk-inset-text">
                                            <h3 className="govuk-heading-m govuk-!-margin-bottom-2">Dieťa {idx + 1}</h3>

                                            <div className={`govuk-form-group`}>
                                                <label className="govuk-label" htmlFor={`${base}-firstName`}>Meno</label>
                                                <input
                                                    className={`govuk-input govuk-input--width-20}`}
                                                    id={`${base}-firstName`}

                                                    value={c.firstName}
                                                    readOnly

                                                />
                                            </div>

                                            <div className={`govuk-form-group`}>
                                                <label className="govuk-label" htmlFor={`${base}-lastName`}>Priezvisko</label>
                                                <input
                                                    className={`govuk-input govuk-input--width-20`}
                                                    id={`${base}-lastName`}
                                                    value={c.lastName}
                                                    readOnly
                                                />
                                            </div>


                                        </div>
                                    );
                                })}

                            </fieldset>)}

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
