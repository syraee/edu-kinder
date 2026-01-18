"use client";

import Header from "@/app/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";

const FRONT_API_BASE = process.env.BACKEND_URL ?? "http://localhost:5000";
const API_BASE = `${FRONT_API_BASE}/api`;

type UserSummary = {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
};

type PaymentSnapshot = {
    breakfastFee?: number | null;
    lunchFee?: number | null;
    snackFee?: number | null;
    tuitionFee?: number | null;
    tuitionFeeExt?: number | null;
    mealsIban?: string | null;
    tuitionIban?: string | null;
    mealsVarSym?: string | null;
    tuitionVarSym?: string | null;
    validFrom?: string | null;
    validTo?: string | null;
};

type ChangeLogEntry = {
    id: number;
    changedAt: string;
    userId: number;
    user: UserSummary;
    oldValues: string;
    newValues: string;
    description: string;
};

type ParsedChangeLogEntry = ChangeLogEntry & {
    oldParsed: PaymentSnapshot;
    newParsed: PaymentSnapshot;
};

const FIELD_ORDER: { key: keyof PaymentSnapshot; label: string }[] = [
    { key: "breakfastFee", label: "Raňajky" },
    { key: "lunchFee", label: "Obed" },
    { key: "snackFee", label: "Olovrant" },
    { key: "tuitionFee", label: "Školné – interný" },
    { key: "tuitionFeeExt", label: "Školné – externý" },
    { key: "mealsIban", label: "IBAN – stravné" },
    { key: "mealsVarSym", label: "Variabilný symbol – stravné" },
    { key: "tuitionIban", label: "IBAN – školné" },
    { key: "tuitionVarSym", label: "Variabilný symbol – školné" },
    { key: "validFrom", label: "Platné od" },
    { key: "validTo", label: "Platné do" },
];

function formatDateTime(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("sk-SK");
}

function formatDateOnly(iso?: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("sk-SK");
}

function formatMoney(v?: number | null) {
    if (v === null || v === undefined) return "";
    return v.toLocaleString("sk-SK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + " €";
}

function isFieldChanged(
    entry: ParsedChangeLogEntry,
    key: keyof PaymentSnapshot
): boolean {
    const oldVal = valueToDisplay(key, entry.oldParsed[key]);
    const newVal = valueToDisplay(key, entry.newParsed[key]);
    return oldVal !== newVal;
}

function valueToDisplay<K extends keyof PaymentSnapshot>(
    key: K,
    value: PaymentSnapshot[K] | null | undefined
): string {
    if (value === undefined || value === null) return "";
    if (key === "validFrom" || key === "validTo") {
        return formatDateOnly(String(value));
    }
    if (
        key === "breakfastFee" ||
        key === "lunchFee" ||
        key === "snackFee" ||
        key === "tuitionFee" ||
        key === "tuitionFeeExt"
    ) {
        const num = typeof value === "number" ? value : Number(value);
        if (Number.isNaN(num)) return String(value);
        return formatMoney(num);
    }
    return String(value);
}

export default function ChangeLogPage() {
    const [logs, setLogs] = useState<ParsedChangeLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selected, setSelected] = useState<ParsedChangeLogEntry | null>(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(
                    `${API_BASE}/payment/change-logs`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const json = await res.json();

                if (!res.ok || !json.success) {
                    throw new Error(json.error || "Nepodarilo sa načítať logy.");
                }

                const rawLogs: ChangeLogEntry[] = json.data;

                const parsed: ParsedChangeLogEntry[] = rawLogs.map((l) => {
                    let oldParsed: PaymentSnapshot = {};
                    let newParsed: PaymentSnapshot = {};

                    try {
                        oldParsed = JSON.parse(l.oldValues || "{}");
                    } catch {
                        oldParsed = {};
                    }

                    try {
                        newParsed = JSON.parse(l.newValues || "{}");
                    } catch {
                        newParsed = {};
                    }

                    return {
                        ...l,
                        oldParsed,
                        newParsed,
                    };
                });

                if (!alive) return;
                setLogs(parsed);
            } catch (err: unknown) {
                console.error("Load logs failed:", err);
                if (!alive) return;
                setError(
                    err instanceof Error
                        ? err.message
                        : "Nepodarilo sa načítať logy zmien."
                );
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    function countChangedFields(entry: ParsedChangeLogEntry): number {
        return FIELD_ORDER.filter((f) => {
            const oldVal = entry.oldParsed[f.key];
            const newVal = entry.newParsed[f.key];
            return String(oldVal ?? "") !== String(newVal ?? "");
        }).length;
    }

    return (
        <>
            <Header />
            <div className="govuk-main-wrapper govuk-width-container idsk-docs">
                <div className="idsk-docs__wrap">
                    <span className="idsk-docs__divider" aria-hidden="true"></span>

                    <div className="idsk-docs__row">
                        <aside
                            className="idsk-docs__sidenav"
                            aria-label="Navigácia sekcií"
                        >
                            <ul className="idsk-docs__list govuk-list">
                                <li className="idsk-docs__item">
                                    <Link
                                        className="idsk-docs__link"
                                        href="/payment-management/payment-input-meals"
                                        title="Zápis platieb"
                                    >
                                        Zápis platieb - stravné
                                    </Link>
                                </li>

                                <li className="idsk-docs__item">
                                    <Link
                                        className="idsk-docs__link"
                                        href="/payment-management/payment-input-tuition"
                                        title="Zápis platieb"
                                    >
                                        Zápis platieb - školné
                                    </Link>
                                </li>

                                <li className="idsk-docs__item">
                                    <Link
                                        className="idsk-docs__link"
                                        href="/payment-management/month-modify"
                                        title="Fixné hodnoty"
                                    >
                                        Fixné hodnoty za obedy/školné
                                    </Link>
                                </li>

                                <li className="idsk-docs__item">
                                    <Link
                                        className="idsk-docs__link is-active"
                                        href="/payment-management/overview"
                                        title="Prehľad"
                                    >
                                        História zmien
                                    </Link>
                                </li>
                            </ul>

                        </aside>
                        <main className="idsk-docs__content payments">
                            <h1 className="govuk-heading-xl">História zmien</h1>

                            {error && (
                                <div className="govuk-error-summary" role="alert">
                                    <h2 className="govuk-error-summary__title">
                                        Nastala chyba
                                    </h2>
                                    <div className="govuk-error-summary__body">
                                        <p className="govuk-body">{error}</p>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <p>Načítavam...</p>
                            ) : logs.length === 0 ? (
                                <p className="govuk-body">
                                    Zatiaľ neexistujú žiadne záznamy o zmenách.
                                </p>
                            ) : (
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                        <tr className="govuk-table__row">
                                            <th className="govuk-table__header">Dátum a čas</th>
                                            <th className="govuk-table__header">Používateľ</th>
                                            <th className="govuk-table__header">Popis</th>
                                            <th className="govuk-table__header">
                                                Počet zmien
                                            </th>
                                            <th className="govuk-table__header">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                        {logs.map((log) => {
                                            const fullName =
                                                (log.user.firstName ?? "") +
                                                (log.user.lastName ? ` ${log.user.lastName}` : "");
                                            const changedCount = countChangedFields(log);

                                            return (
                                                <tr className="govuk-table__row" key={log.id}>
                                                    <td className="govuk-table__cell">
                                                        {formatDateTime(log.changedAt)}
                                                    </td>
                                                    <td className="govuk-table__cell">
                                                        {fullName || log.user.email}
                                                    </td>
                                                    <td className="govuk-table__cell">
                                                        {log.description}
                                                    </td>
                                                    <td className="govuk-table__cell">
                                                        {changedCount} položiek
                                                    </td>
                                                    <td className="govuk-table__cell">
                                                        <button
                                                            type="button"
                                                            className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                                                            onClick={() => setSelected(log)}
                                                        >
                                                            Detail
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </main>
                    </div>
                </div>
            </div>

            {selected && (
                <div className="payment-log-modal-overlay">
                    <div
                        className="payment-log-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="payment-log-modal-title"
                    >
                        <div className="payment-log-modal__header">
                            <h2
                                className="govuk-heading-l"
                                id="payment-log-modal-title"
                            >
                                Detail zmeny
                            </h2>
                            <button
                                type="button"
                                className="govuk-button govuk-button--secondary payment-log-modal__close"
                                onClick={() => setSelected(null)}
                            >
                                Zavrieť
                            </button>
                        </div>

                        <p className="govuk-body">
                            <strong>Používateľ: </strong>
                            {(selected.user.firstName ?? "") +
                                (selected.user.lastName
                                    ? ` ${selected.user.lastName}`
                                    : "")}
                            {selected.user.email
                                ? ` (${selected.user.email})`
                                : ""}
                            <br />
                            <strong>Dátum a čas: </strong>
                            {formatDateTime(selected.changedAt)}
                            <br />
                            <strong>Popis: </strong>
                            {selected.description}
                        </p>

                        <div className="govuk-grid-row govuk-!-margin-top-4">
                            <div className="govuk-grid-column-one-half">
                                <h3 className="govuk-heading-m">Pred zmenou</h3>
                                <dl className="govuk-summary-list">
                                    {FIELD_ORDER.map(({ key, label }) => {
                                        const val = valueToDisplay(key, selected.oldParsed[key]);
                                        const changed = isFieldChanged(selected, key);

                                        return (
                                            <div
                                                className={
                                                    "govuk-summary-list__row" +
                                                    (changed ? " payment-log-row--changed" : "")
                                                }
                                                key={key}
                                            >
                                                <dt className="govuk-summary-list__key">{label}</dt>
                                                <dd className="govuk-summary-list__value">
                                                    {val || <span className="govuk-hint">–</span>}
                                                </dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </div>

                            <div className="govuk-grid-column-one-half">
                                <h3 className="govuk-heading-m">Po zmene</h3>
                                <dl className="govuk-summary-list">
                                    {FIELD_ORDER.map(({ key, label }) => {
                                        const val = valueToDisplay(key, selected.newParsed[key]);
                                        const changed = isFieldChanged(selected, key);

                                        return (
                                            <div
                                                className={
                                                    "govuk-summary-list__row" +
                                                    (changed ? " payment-log-row--changed" : "")
                                                }
                                                key={key}
                                            >
                                                <dt className="govuk-summary-list__key">{label}</dt>
                                                <dd className="govuk-summary-list__value">
                                                    <span
                                                        className={
                                                            changed ? "payment-log-value--changed" : undefined
                                                        }
                                                    >
                                                        {val || <span className="govuk-hint">–</span>}
                                                    </span>
                                                </dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
