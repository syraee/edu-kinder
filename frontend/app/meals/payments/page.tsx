"use client";

import Link from "next/link";
import Header from "@/app/components/Header";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

type Tab = "ORDERS" | "PAYMENTS";

type MealStatementStatus = "UNPAID" | "PARTIAL" | "PAID";

type RawMealStatementFromApi = {
    id: number;
    childId: number;
    childName: string;
    month: string;
    plannedDays: number;
    mealsAmount: string | number;
    carryOverIn: string | number;
    totalToPay: string | number;
    carryOverOut: string | number;
    status: MealStatementStatus;
    qrPayload?: string | null;
    paymentDetails?: {
        recipientName: string;
        iban: string;
        vs: string;
        amount: number;
        note: string;
    };
};

type ChildStatements = {
    childId: number;
    childName: string;
    items: {
        id: number;
        month: string;
        plannedDays: number;
        mealsAmount: number;
        carryOverIn: number;
        totalToPay: number;
        carryOverOut: number;
        status: MealStatementStatus;
        qrPayload?: string | null;
        paymentDetails?: {
            recipientName: string;
            iban: string;
            vs: string;
            amount: number;
            note: string;
        };
    }[];
};

type RawMealsPaymentFromApi = {
    id: number;
    childId: number;
    childName: string;
    amount: string | number;
    paidAt: string; // ISO
};

type ChildMealsPayments = {
    childId: number;
    childName: string;
    records: {
        id: number;
        paidAt: string;
        amount: number;
    }[];
};


type QrDetails = {
    title: string;
    iban: string;
    vs: string;
    amount: number;
    note: string;
    qrValue: string;
};

type QrPayload = {
    iban?: string;
    vs?: string;
    amount?: number;
    note?: string;
};

const SK_MONTHS = [
    "Január",
    "Február",
    "Marec",
    "Apríl",
    "Máj",
    "Jún",
    "Júl",
    "August",
    "September",
    "Október",
    "November",
    "December",
];

const formatMonth = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${SK_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const formatMoney = (n: number) =>
    `${n.toLocaleString("sk-SK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}€`;

const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("sk-SK", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(iso));

function statusLabel(status: MealStatementStatus): string {
    switch (status) {
        case "UNPAID":
            return "Neuhradené";
        case "PARTIAL":
            return "Čiastočne uhradené";
        case "PAID":
            return "Uhradené";
        default:
            return status;
    }
}

function statusTagClass(status: MealStatementStatus): string {
    switch (status) {
        case "UNPAID":
            return "govuk-tag--red";
        case "PARTIAL":
            return "govuk-tag--yellow";
        case "PAID":
            return "govuk-tag--green";
        default:
            return "govuk-tag--grey";
    }
}

type QrModalState = {
    open: boolean;
    childName: string;
    qrValue: string;
    details?: {
        recipientName: string;
        iban: string;
        vs: string;
        amount: number;
        note: string;
    };
};

export default function MealsPaymentsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("ORDERS");

    const [statements, setStatements] = useState<ChildStatements[]>([]);
    const [statementsLoading, setStatementsLoading] = useState(false);
    const [statementsError, setStatementsError] = useState<string | null>(null);


    const [mealsPayments, setMealsPayments] = useState<ChildMealsPayments[]>([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [paymentsError, setPaymentsError] = useState<string | null>(null);
    const [qrModal, setQrModal] = useState<QrModalState>({
        open: false,
        childName: "",
        qrValue: "",
        details: undefined,
    });

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setStatementsLoading(true);
                setStatementsError(null);

                const res = await fetch(`${API_BASE}/payment/my-meal-statements`, {
                    method: "GET",
                    credentials: "include",
                });

                const json = await res.json();

                if (!res.ok || !json.success) {
                    throw new Error(json.error || "Nepodarilo sa načítať predpisy.");
                }

                const raw: RawMealStatementFromApi[] = Array.isArray(json.data)
                    ? json.data
                    : [];

                const byChild = new Map<number, ChildStatements>();

                for (const s of raw) {
                    if (!byChild.has(s.childId)) {
                        byChild.set(s.childId, {
                            childId: s.childId,
                            childName: s.childName,
                            items: [],
                        });
                    }
                    const bucket = byChild.get(s.childId)!;
                    bucket.items.push({
                        id: s.id,
                        month: s.month,
                        plannedDays: s.plannedDays,
                        mealsAmount: Number(s.mealsAmount ?? 0),
                        carryOverIn: Number(s.carryOverIn ?? 0),
                        totalToPay: Number(s.totalToPay ?? 0),
                        carryOverOut: Number(s.carryOverOut ?? 0),
                        status: s.status,
                        qrPayload: s.qrPayload ?? undefined,
                        paymentDetails: s.paymentDetails,
                    });
                }


                for (const child of byChild.values()) {
                    child.items.sort((a, b) => {
                        const da = new Date(a.month).getTime();
                        const db = new Date(b.month).getTime();
                        return db - da;
                    });
                }

                if (!alive) return;
                setStatements(Array.from(byChild.values()));
            } catch (err: unknown) {
                console.error("Load meal statements failed:", err);
                if (!alive) return;
                setStatementsError(
                    err instanceof Error
                        ? err.message
                        : "Nepodarilo sa načítať mesačné predpisy za stravu."
                );
            } finally {
                if (alive) setStatementsLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);


    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setPaymentsLoading(true);
                setPaymentsError(null);

                const res = await fetch(`${API_BASE}/payment/my-meals-payments`, {
                    method: "GET",
                    credentials: "include",
                });

                const json = await res.json();

                if (!res.ok || !json.success) {
                    throw new Error(json.error || "Nepodarilo sa načítať platby.");
                }

                const raw: RawMealsPaymentFromApi[] = Array.isArray(json.data)
                    ? json.data
                    : [];


                const byChild = new Map<number, ChildMealsPayments>();

                for (const p of raw) {
                    if (!byChild.has(p.childId)) {
                        byChild.set(p.childId, {
                            childId: p.childId,
                            childName: p.childName,
                            records: [],
                        });
                    }

                    const bucket = byChild.get(p.childId)!;
                    bucket.records.push({
                        id: p.id,
                        paidAt: p.paidAt,
                        amount: Number(p.amount ?? 0),
                    });
                }

                if (!alive) return;
                setMealsPayments(Array.from(byChild.values()));
            } catch (err: unknown) {
                console.error("Load meals payments failed:", err);
                if (!alive) return;
                setPaymentsError(
                    err instanceof Error
                        ? err.message
                        : "Nepodarilo sa načítať platby za stravu."
                );
            } finally {
                if (alive) setPaymentsLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);


    function openQrModal(childName: string, qrPayload: string | null | undefined, details?: QrModalState["details"]): void {
        if (!qrPayload) return;

        setQrModal({
            open: true,
            childName,
            qrValue: qrPayload,
            details,
        });
    }

    function closeQrModal(): void {
        setQrModal({
            open: false,
            childName: "",
            qrValue: "",
        });
    }

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
                                    <Link
                                        className="idsk-docs__link"
                                        href="/meals/menu"
                                        title="Jedálny lístok"
                                    >
                                        Jedálny lístok
                                    </Link>
                                </li>
                                <li className="idsk-docs__item">
                                    <Link
                                        className="idsk-docs__link"
                                        href="/meals/meal-cancellation"
                                        title="Odhlasovanie"
                                    >
                                        Odhlasovanie
                                    </Link>
                                </li>
                                <li className="idsk-docs__item">
                                    <Link
                                        className="idsk-docs__link is-active"
                                        href="/meals/payments"
                                        title="Platby"
                                    >
                                        Platby
                                    </Link>
                                </li>
                            </ul>
                        </aside>

                        <main className="idsk-docs__content payments">
                            <h1 className="govuk-heading-xl">Platby - strava</h1>

                            {/* Tabs */}
                            <div className="idsk-tabs govuk-!-margin-bottom-5">
                                <ul className="idsk-tabs__list">
                                    <li
                                        className={`idsk-tabs__list-item ${
                                            activeTab === "ORDERS"
                                                ? "idsk-tabs__list-item--selected"
                                                : ""
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            className="idsk-tabs__tab"
                                            onClick={() => setActiveTab("ORDERS")}
                                        >
                                            Platobné predpisy
                                        </button>
                                    </li>

                                    <li
                                        className={`idsk-tabs__list-item ${
                                            activeTab === "PAYMENTS"
                                                ? "idsk-tabs__list-item--selected"
                                                : ""
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            className="idsk-tabs__tab"
                                            onClick={() => setActiveTab("PAYMENTS")}
                                        >
                                            Platby
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {activeTab === "ORDERS" && (
                                <>
                                    {statementsError && (
                                        <div className="govuk-error-summary" role="alert">
                                            <h2 className="govuk-error-summary__title">
                                                Nastala chyba
                                            </h2>
                                            <div className="govuk-error-summary__body">
                                                <p className="govuk-body">{statementsError}</p>
                                            </div>
                                        </div>
                                    )}

                                    {statementsLoading ? (
                                        <p>Načítavam...</p>
                                    ) : statements.length === 0 ? (
                                        <p className="govuk-body">
                                            Zatiaľ neevidujeme žiadne predpisy za stravu.
                                        </p>
                                    ) : (
                                        statements.map((child) => (
                                            <section
                                                key={child.childId}
                                                className="govuk-!-margin-bottom-6"
                                            >
                                                <h2 className="govuk-heading-l">{child.childName}</h2>

                                                <table className="govuk-table">
                                                    <thead className="govuk-table__head">
                                                    <tr className="govuk-table__row">
                                                        <th className="govuk-table__header">Mesiac</th>
                                                        <th className="govuk-table__header govuk-table__header--numeric">
                                                            Suma
                                                        </th>
                                                        <th
                                                            className="govuk-table__header">
                                                            Preplatok z<br />minulého mesiaca
                                                        </th>
                                                        <th className="govuk-table__header govuk-table__header--numeric">
                                                            Na úhradu
                                                        </th>
                                                        <th className="govuk-table__header">Status</th>
                                                        <th className="govuk-table__header">
                                                            Platobné údaje
                                                        </th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="govuk-table__body">
                                                    {child.items.map((item) => {
                                                        const tagClass = statusTagClass(item.status);

                                                        return (
                                                            <tr
                                                                className="govuk-table__row"
                                                                key={item.id}
                                                            >
                                                                <td className="govuk-table__cell">
                                    <span className="govuk-heading-s govuk-!-margin-bottom-0">
                                      {formatMonth(item.month)}
                                    </span>
                                                                </td>
                                                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                                                    {formatMoney(item.mealsAmount)}
                                                                </td>
                                                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                                                    {formatMoney(item.carryOverIn)}
                                                                </td>
                                                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                                                    {formatMoney(item.totalToPay)}
                                                                </td>
                                                                <td className="govuk-table__cell">
                                                                    <strong
                                                                        className={`govuk-tag ${tagClass}`}
                                                                    >
                                                                        {statusLabel(item.status)}
                                                                    </strong>
                                                                </td>
                                                                <td className="govuk-table__cell">
                                                                    <button
                                                                        type="button"
                                                                        className="govuk-button btn-payment"
                                                                        onClick={() => openQrModal(child.childName, item.qrPayload,  item.paymentDetails)}
                                                                    >
                                                                        Platobné údaje
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    </tbody>
                                                </table>
                                            </section>
                                        ))
                                    )}
                                </>
                            )}


                            {activeTab === "PAYMENTS" && (
                                <>
                                    <h2 className="govuk-heading-l">Prijaté platby za stravu</h2>

                                    {paymentsError && (
                                        <div className="govuk-error-summary" role="alert">
                                            <h2 className="govuk-error-summary__title">
                                                Nastala chyba
                                            </h2>
                                            <div className="govuk-error-summary__body">
                                                <p className="govuk-body">{paymentsError}</p>
                                            </div>
                                        </div>
                                    )}

                                    {paymentsLoading ? (
                                        <p>Načítavam...</p>
                                    ) : mealsPayments.length === 0 ? (
                                        <p className="govuk-body">
                                            Zatiaľ neevidujeme žiadne platby za stravu.
                                        </p>
                                    ) : (
                                        mealsPayments.map((child) => (
                                            <section
                                                key={child.childId}
                                                className="govuk-!-margin-bottom-6"
                                            >
                                                <h3 className="govuk-heading-m">{child.childName}</h3>

                                                <table className="govuk-table">
                                                    <thead className="govuk-table__head">
                                                    <tr className="govuk-table__row">
                                                        <th className="govuk-table__header">
                                                            Dátum platby
                                                        </th>
                                                        <th className="govuk-table__header govuk-table__header--numeric">
                                                            Suma
                                                        </th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="govuk-table__body">
                                                    {child.records.map((r) => (
                                                        <tr className="govuk-table__row" key={r.id}>
                                                            <td className="govuk-table__cell">
                                                                {formatDate(r.paidAt)}
                                                            </td>
                                                            <td className="govuk-table__cell govuk-table__cell--numeric">
                                                                {formatMoney(r.amount)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </section>
                                        ))
                                    )}
                                </>
                            )}

                            {qrModal.open && (
                                <div className="payment-log-modal-overlay">
                                    <div
                                        className="payment-log-modal"
                                        role="dialog"
                                        aria-modal="true"
                                        aria-labelledby="qr-modal-title"
                                    >
                                        <div className="payment-log-modal__header">
                                            <h2 className="govuk-heading-l" id="qr-modal-title">
                                                Platobné údaje – {qrModal.childName}
                                            </h2>
                                            <button
                                                type="button"
                                                className="govuk-button govuk-button--secondary payment-log-modal__close"
                                                onClick={closeQrModal}
                                            >
                                                Zavrieť
                                            </button>
                                        </div>

                                        <p className="govuk-body">
                                            Naskenujte QR kód vo vašej bankovej aplikácii. Platobné údaje sa vyplnia automaticky.
                                        </p>

                                        <div className="qr-wrapper">
                                            <QRCodeSVG value={qrModal.qrValue} size={220} />
                                        </div>

                                        {qrModal.details && (
                                            <div className="govuk-!-margin-top-4">
                                                <h3 className="govuk-heading-m">Platobné údaje na ručné zadanie</h3>

                                                <dl className="govuk-summary-list">
                                                    <div className="govuk-summary-list__row">
                                                        <dt className="govuk-summary-list__key">Príjemca</dt>
                                                        <dd className="govuk-summary-list__value">
                                                            {qrModal.details.recipientName}
                                                        </dd>
                                                    </div>

                                                    <div className="govuk-summary-list__row">
                                                        <dt className="govuk-summary-list__key">IBAN</dt>
                                                        <dd className="govuk-summary-list__value">
                                                            <code>{qrModal.details.iban}</code>
                                                        </dd>
                                                    </div>

                                                    <div className="govuk-summary-list__row">
                                                        <dt className="govuk-summary-list__key">Suma</dt>
                                                        <dd className="govuk-summary-list__value">
                                                            {formatMoney(qrModal.details.amount)}
                                                        </dd>
                                                    </div>

                                                    <div className="govuk-summary-list__row">
                                                        <dt className="govuk-summary-list__key">Variabilný symbol</dt>
                                                        <dd className="govuk-summary-list__value">
                                                            <code>{qrModal.details.vs}</code>
                                                        </dd>
                                                    </div>

                                                    <div className="govuk-summary-list__row">
                                                        <dt className="govuk-summary-list__key">Správa pre príjemcu</dt>
                                                        <dd className="govuk-summary-list__value">
                                                            {qrModal.details.note}
                                                        </dd>
                                                    </div>
                                                </dl>

                                                <p className="govuk-body-s govuk-!-margin-top-2">
                                                    Ak QR platba vo vašej banke nefunguje (napr. UniCredit môže vyžadovať viac účtov),
                                                    zadajte platbu manuálne podľa údajov vyššie.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}


                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
