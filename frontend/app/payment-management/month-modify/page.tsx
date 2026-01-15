"use client";

import Header from "@/app/components/Header";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

type RawPaymentSettings = {
    id?: number;
    breakfastFee?: string | number;
    lunchFee?: string | number;
    snackFee?: string | number;
    tuitionFee?: string | number;
    tuitionFeeExt?: string | number;
    mealsIban?: string;
    tuitionIban?: string;
    mealsVarSym?: string;
    tuitionVarSym?: string;
    validFrom?: string;
    validTo?: string | null;
    createdAt?: string;
};


type PaymentSettings = {
    breakfastFee: number;
    lunchFee: number;
    snackFee: number;
    tuitionFee: number;
    tuitionFeeExt: number;
    mealsIban: string;
    tuitionIban: string;
    mealsVarSym: string;
    tuitionVarSym: string;
    validFrom: string;
    validTo: string;
    createdAt: string;
};

const INITIAL_SETTINGS: PaymentSettings = {
    breakfastFee: 2.4,
    lunchFee: 3.1,
    snackFee: 2.2,
    tuitionFee: 100,
    tuitionFeeExt: 150,
    mealsIban: "SKXX XXXX XXXX XXXX XXXX XXXX",
    tuitionIban: "SKXX XXXX XXXX XXXX XXXX XXXX",
    mealsVarSym: "XXXX",
    tuitionVarSym: "XXXX",
    validFrom: "2025-09-01",
    validTo: "2025-12-31",
    createdAt: "2025-11-27",
};

function formatMoney(v: number) {
    return v.toLocaleString("sk-SK", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("sk-SK");
}


export default function PaymentSettingsPage() {
    const [settings, setSettings] = useState<PaymentSettings>(INITIAL_SETTINGS);
    const [form, setForm] = useState<PaymentSettings>(INITIAL_SETTINGS);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const locked = !editMode;

    function update<K extends keyof PaymentSettings>(
        key: K,
        value: PaymentSettings[K]
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleEdit() {
        setForm(settings);
        setEditMode(true);
    }

    function handleCancel() {
        setForm(settings);
        setEditMode(false);
    }

    async function handleSave() {
        const nowIso = new Date().toISOString().slice(0, 10);

        setSettings({
            ...form,
            createdAt: nowIso,
        });
        setEditMode(false);

        try {
            const res = await fetch(`${API_BASE}/payment/edit-payment-settings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    newSettings: {
                        breakfastFee: form.breakfastFee,
                        lunchFee: form.lunchFee,
                        snackFee: form.snackFee,
                        tuitionFee: form.tuitionFee,
                        tuitionFeeExt: form.tuitionFeeExt,
                        mealsIban: form.mealsIban,
                        tuitionIban: form.tuitionIban,
                        mealsVarSym: form.mealsVarSym,
                        tuitionVarSym: form.tuitionVarSym,
                        validFrom: form.validFrom,
                        validTo: form.validTo,
                    },
                }),
            });

            const json = await res.json();
            if (res.ok && json.success) {
                alert("Nastavenia boli úspešne uložené.");
            } else {
                throw new Error(json.error || "Nastala chyba pri ukladaní.");
            }
        } catch (err) {
            console.error("Chyba pri ukladaní:", err);
            alert("Nastala chyba pri ukladaní nastavení.");
        }
    }

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setLoadError(null);

                const res = await fetch(`${API_BASE}/payment/payment-settings`, {
                    method: "GET",
                    credentials: "include",
                });

                const json = (await res.json().catch(() => ({}))) as {
                    success?: boolean;
                    data?: RawPaymentSettings;
                    error?: string;
                };

                if (!res.ok || !json.success || !json.data) {
                    throw new Error(json.error || "Nepodarilo sa načítať nastavenia.");
                }

                const d: RawPaymentSettings = json.data;

                const normalized: PaymentSettings = {
                    breakfastFee: Number(d.breakfastFee ?? 0),
                    lunchFee: Number(d.lunchFee ?? 0),
                    snackFee: Number(d.snackFee ?? 0),
                    tuitionFee: Number(d.tuitionFee ?? 0),
                    tuitionFeeExt: Number(d.tuitionFeeExt ?? 0),
                    mealsIban: d.mealsIban ?? "",
                    tuitionIban: d.tuitionIban ?? "",
                    mealsVarSym: d.mealsVarSym ?? "",
                    tuitionVarSym: d.tuitionVarSym ?? "",
                    validFrom: (d.validFrom ?? "2025-09-01").slice(0, 10),
                    validTo: (d.validTo ?? "2099-12-31").slice(0, 10),
                    createdAt:
                        (d.createdAt ?? new Date().toISOString()).slice(0, 10),
                };

                if (!alive) return;
                setSettings(normalized);
                setForm(normalized);
            } catch (err: unknown) {
                console.error("Load payment-settings failed:", err);
                if (!alive) return;

                const message =
                    err instanceof Error
                        ? err.message
                        : "Nepodarilo sa načítať nastavenia platieb.";

                setLoadError(message);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    return (
        <>
            <Header />
            <div className="govuk-main-wrapper govuk-width-container idsk-docs">
                <div className="idsk-docs__wrap">
                    <span className="idsk-docs__divider" aria-hidden="true"></span>

                    <div className="idsk-docs__row">

                        <aside className="idsk-docs__sidenav" aria-label="Navigácia sekcií">
                            <ul className="idsk-docs__list govuk-list">
                                <li className="idsk-docs__item">
                                    <Link className="idsk-docs__link" href="/payment-management/payment-input-meals" title="Zápis platieb">
                                        Zápis platieb - stravné
                                    </Link>
                                </li>
                                <Link
                                    className="idsk-docs__link"
                                    href="/payment-management/payment-input-tuition"
                                    title="Zápis platieb"
                                >
                                    Zápis platieb - školné
                                </Link>
                                <li className="idsk-docs__item">
                                    <Link className="idsk-docs__link is-active" href="/payment-management/month-modify" title='Platby'>
                                        Fixné hodnoty za obedy/školné
                                    </Link>
                                </li>
                                <li className="idsk-docs__item">
                                    <Link className="idsk-docs__link" href="/payment-management/overview" title='Odhlasovanie'>
                                        História zmien
                                    </Link>
                                </li>

                            </ul>
                        </aside>
                        <main className="idsk-docs__content payments">

                <h1 className="govuk-heading-xl">Hodnoty</h1>

                {loadError && (
                    <div className="govuk-error-summary" role="alert">
                        <h2 className="govuk-error-summary__title">
                            Nastala chyba
                        </h2>
                        <div className="govuk-error-summary__body">
                            <p className="govuk-body">{loadError}</p>
                        </div>
                    </div>
                )}

                <div className="govuk-grid-row govuk-!-margin-bottom-6">
                    <div className="govuk-grid-column-one-half">
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor="valid-from">
                                Platné od
                            </label>
                            {editMode ? (
                                <input
                                    id="valid-from"
                                    type="date"
                                    className="govuk-input govuk-!-width-two-thirds"
                                    value={form.validFrom}
                                    onChange={(e) => update("validFrom", e.target.value)}
                                />
                            ) : (
                                <p className="govuk-body govuk-!-margin-bottom-0">
                                    <strong>{formatDate(settings.validFrom)}</strong>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="govuk-grid-column-one-half">
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor="valid-to">
                                Platné do
                            </label>
                            {editMode ? (
                                <input
                                    id="valid-to"
                                    type="date"
                                    className="govuk-input govuk-!-width-two-thirds"
                                    value={form.validTo}
                                    onChange={(e) => update("validTo", e.target.value)}
                                />
                            ) : (
                                <p className="govuk-body govuk-!-margin-bottom-0">
                                    <strong>{formatDate(settings.validTo)}</strong>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-half">
                        <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                            Stravné
                        </h2>

                        <div className="payment-settings__box govuk-!-padding-3 govuk-!-margin-bottom-6">
                            <div className="payment-settings__row">
                                <span className="payment-settings__label">Raňajky</span>
                                {editMode ? (
                                    <input
                                        className="govuk-input govuk-!-width-one-third"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.breakfastFee}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "") return;
                                            const num = Number(raw.replace(",", "."));
                                            if (!Number.isNaN(num)) update("breakfastFee", num);
                                        }}
                                    />
                                ) : (
                                    <span className="payment-settings__value">
                    {formatMoney(settings.breakfastFee)}
                  </span>
                                )}
                            </div>

                            <div className="payment-settings__row">
                                <span className="payment-settings__label">Obed</span>
                                {editMode ? (
                                    <input
                                        className="govuk-input govuk-!-width-one-third"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.lunchFee}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "") return;
                                            const num = Number(raw.replace(",", "."));
                                            if (!Number.isNaN(num)) update("lunchFee", num);
                                        }}
                                    />
                                ) : (
                                    <span className="payment-settings__value">
                    {formatMoney(settings.lunchFee)}
                  </span>
                                )}
                            </div>

                            <div className="payment-settings__row">
                                <span className="payment-settings__label">Olovrant</span>
                                {editMode ? (
                                    <input
                                        className="govuk-input govuk-!-width-one-third"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.snackFee}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "") return;
                                            const num = Number(raw.replace(",", "."));
                                            if (!Number.isNaN(num)) update("snackFee", num);
                                        }}
                                    />
                                ) : (
                                    <span className="payment-settings__value">
                    {formatMoney(settings.snackFee)}
                  </span>
                                )}
                            </div>

                            <div className="govuk-!-margin-top-5" />
                            <div className="payment-settings__row">
                                <span className="payment-settings__label">IBAN</span>
                                {editMode ? (
                                    <input
                                        className="govuk-input govuk-!-width-two-thirds"
                                        type="text"
                                        value={form.mealsIban}
                                        onChange={(e) => update("mealsIban", e.target.value)}
                                    />
                                ) : (
                                    <span className="payment-settings__value">
                    <code>{settings.mealsIban}</code>
                  </span>
                                )}
                            </div>

                            <div className="payment-settings__row">
                <span className="payment-settings__label">
                  Variabilný symbol
                </span>
                                {editMode ? (
                                    <input
                                        className="govuk-input govuk-!-width-one-third"
                                        type="text"
                                        value={form.mealsVarSym}
                                        onChange={(e) => update("mealsVarSym", e.target.value)}
                                    />
                                ) : (
                                    <span className="payment-settings__value">
                    {settings.mealsVarSym}
                  </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Školné */}
                    <div className="govuk-grid-column-one-half">
                        <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                            Školné
                        </h2>

                        <div className="payment-settings__box govuk-!-padding-3 govuk-!-margin-bottom-6">
                            <div className="payment-settings__row">
                <span className="payment-settings__label">
                  Školné – interný
                </span>
                                {editMode ? (
                                    <input
                                        className="govuk-input govuk-!-width-one-third"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.tuitionFee}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "") return;
                                            const num = Number(raw.replace(",", "."));
                                            if (!Number.isNaN(num)) update("tuitionFee", num);
                                        }}
                                    />
                                ) : (
                                    <span className="payment-settings__value">
                    {formatMoney(settings.tuitionFee)}
                  </span>
                                )}
                            </div>

                            <div className="payment-settings__row">
                <span className="payment-settings__label">
                  Školné – externý
                </span>
                                {editMode ? (
                                    <input
                                        className="govuk-input govuk-!-width-one-third"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.tuitionFeeExt}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "") return;
                                            const num = Number(raw.replace(",", "."));
                                            if (!Number.isNaN(num)) update("tuitionFeeExt", num);
                                        }}
                                    />
                                ) : (
                                    <span className="payment-settings__value">
                    {formatMoney(settings.tuitionFeeExt)}
                  </span>
                                )}
                            </div>

                            <div className="govuk-!-margin-top-5" />

                            <div className="payment-settings__row">
                                <span className="payment-settings__label">IBAN</span>
                                {editMode ? (
                                    <input
                                        className="govuk-input govuk-!-width-two-thirds"
                                        type="text"
                                        value={form.tuitionIban}
                                        onChange={(e) => update("tuitionIban", e.target.value)}
                                    />
                                ) : (
                                    <span className="payment-settings__value">
                    <code>{settings.tuitionIban}</code>
                  </span>
                                )}
                            </div>

                            <div className="payment-settings__row">
                <span className="payment-settings__label">
                  Variabilný symbol
                </span>
                                {editMode ? (
                                    <input
                                        className="govuk-input govuk-!-width-one-third"
                                        type="text"
                                        value={form.tuitionVarSym}
                                        onChange={(e) =>
                                            update("tuitionVarSym", e.target.value)
                                        }
                                    />
                                ) : (
                                    <span className="payment-settings__value">
                    {settings.tuitionVarSym}
                  </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="govuk-grid-row govuk-!-margin-top-4">
                    <div className="govuk-grid-column-one-half">
                        <p className="govuk-body">
                            <span className="govuk-hint">Vytvorené</span>
                            <br />
                            <strong>{formatDate(settings.createdAt)}</strong>
                        </p>
                    </div>
                    <div className="govuk-grid-column-one-half govuk-!-text-align-right">
                        {!editMode ? (
                            <button
                                type="button"
                                className="govuk-button"
                                onClick={handleEdit}
                                disabled={loading}
                            >
                                Upraviť
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="govuk-button"
                                    onClick={handleSave}
                                >
                                    Uložiť
                                </button>
                                <button
                                    type="button"
                                    className="govuk-button govuk-button--secondary govuk-!-margin-left-2"
                                    onClick={handleCancel}
                                >
                                    Zrušiť
                                </button>
                            </>
                        )}
                    </div>
                </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
