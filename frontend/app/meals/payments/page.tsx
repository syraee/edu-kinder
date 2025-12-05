"use client";

import Link from "next/link";
import Header from "@/app/components/Header";
import {useEffect, useState } from "react";

type PaymentStatus = "UNPAID" | "PAID" | "CANCELED";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

type ChildPaymentItem = {
    id: string;
    month: string;
    amount: number;
    overpayment: number;
    days: number;
    status: PaymentStatus;
    invoiceUrl?: string;
};

type ChildFromApi = {
    id: number;
    firstName: string | null;
    lastName: string | null;
};

type ChildPayments = {
    childId: number;
    childName: string;
    items: ChildPaymentItem[];
};

type PaymentRecord = {
    id: string;
    date: string;
    amount: number;
};

type ChildPaymentHistory = {
    childId: number;
    childName: string;
    records: PaymentRecord[];
};

type RawPaymentFromApi = {
    id: number;
    amount: string | number;
    feeType: "SKOLNE" | "STRAVA";
    paidAt: string;
};

type MealsPaymentRow = {
    id: number;
    amount: number;
    paidAt: string;
};

type Tab = "ORDERS" | "PAYMENTS";

const DEMO_MONTH_ITEMS: ChildPaymentItem[] = [
    {
        id: "2025-11",
        month: "2025-11-01",
        amount: 64.6,
        overpayment: 64.6,
        days: 18,
        status: "UNPAID",
        invoiceUrl: "#",
    },
    {
        id: "2025-10",
        month: "2025-10-01",
        amount: 64.6,
        overpayment: 64.6,
        days: 18,
        status: "PAID",
        invoiceUrl: "#",
    },
    {
        id: "2025-09",
        month: "2025-09-01",
        amount: 64.6,
        overpayment: 64.6,
        days: 18,
        status: "PAID",
        invoiceUrl: "#",
    },
    {
        id: "2025-08",
        month: "2025-08-01",
        amount: 0.0,
        overpayment: 0.0,
        days: 0,
        status: "CANCELED",
    },
];

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
    return `${SK_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const formatMoney = (n: number) =>
    `${n.toLocaleString("sk-SK", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}€`;

const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("sk-SK", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(iso));



export default function MealsPaymentsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("ORDERS");
    const [mealsPayments, setMealsPayments] = useState<MealsPaymentRow[]>([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [paymentsError, setPaymentsError] = useState<string | null>(null);
    const [childrenPayments, setChildrenPayments] = useState<ChildPayments[]>([]);
    const [childrenLoading, setChildrenLoading] = useState(false);
    const [childrenError, setChildrenError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setPaymentsLoading(true);
                setPaymentsError(null);

                const res = await fetch(
                    `${API_BASE}/payment/my-meals-payments`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const json = await res.json();

                if (!res.ok || !json.success) {
                    throw new Error(json.error || "Nepodarilo sa načítať platby.");
                }

                const raw: RawPaymentFromApi[] = Array.isArray(json.data)
                    ? json.data
                    : [];

                const mapped: MealsPaymentRow[] = raw.map((p) => ({
                    id: p.id,
                    amount: Number(p.amount ?? 0),
                    paidAt: p.paidAt,
                }));

                if (!alive) return;
                setMealsPayments(mapped);
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

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setChildrenLoading(true);
                setChildrenError(null);

                const res = await fetch(`${API_BASE}/child/mine`, {
                    method: "GET",
                    credentials: "include",
                });

                const json = await res.json();

                if (!res.ok || !json.success) {
                    throw new Error(json.error || "Nepodarilo sa načítať deti.");
                }

                const apiChildren: ChildFromApi[] = Array.isArray(json.data)
                    ? json.data
                    : [];

                const mapped: ChildPayments[] = apiChildren.map((c) => {
                    const fullName = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Dieťa";
                    return {
                        childId: c.id,
                        childName: fullName,
                        items: DEMO_MONTH_ITEMS.map((item) => ({
                            ...item,
                            id: `${c.id}-${item.id}`,
                        })),
                    };
                });

                if (!alive) return;
                setChildrenPayments(mapped);
            } catch (err: unknown) {
                console.error("Load children for meals payments failed:", err);
                if (!alive) return;
                setChildrenError(
                    err instanceof Error
                        ? err.message
                        : "Nepodarilo sa načítať deti."
                );
            } finally {
                if (alive) setChildrenLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    return (
        <>
            <Header/>

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
                                    {childrenPayments.map((child) => (
                                        <section
                                            key={child.childId}
                                            className="govuk-!-margin-bottom-6"
                                        >
                                            <h2 className="govuk-heading-l">{child.childName}</h2>

                                            {childrenError && (
                                                <div className="govuk-error-summary" role="alert">
                                                    <h2 className="govuk-error-summary__title">
                                                        Nastala chyba
                                                    </h2>
                                                    <div className="govuk-error-summary__body">
                                                        <p className="govuk-body">{childrenError}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {childrenLoading ? (
                                                <p>Načítavam...</p>
                                            ) : child.items.length === 0 ? (
                                                <p className="govuk-body">
                                                    Zatiaľ nemáte pre toto dieťa vytvorený platobný predpis.
                                                </p>
                                            ) : (
                                                <table className="govuk-table">
                                                    <thead className="govuk-table__head">
                                                    <tr className="govuk-table__row">
                                                        <th scope="col" className="govuk-table__header">
                                                            Mesiac
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="govuk-table__header govuk-table__header--numeric"
                                                        >
                                                            Suma
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="govuk-table__header govuk-table__header--numeric"
                                                        >
                                                            Preplatok
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="govuk-table__header govuk-table__header--numeric"
                                                        >
                                                            Počet dní
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="govuk-table__header"
                                                        >
                                                            Status
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="govuk-table__header"
                                                        ></th>
                                                        <th
                                                            scope="col"
                                                            className="govuk-table__header"
                                                        ></th>
                                                    </tr>
                                                    </thead>

                                                    <tbody className="govuk-table__body">
                                                    {child.items.map((p) => {
                                                        const tagClass =
                                                            p.status === "UNPAID"
                                                                ? "govuk-tag--red"
                                                                : p.status === "PAID"
                                                                    ? "govuk-tag--green"
                                                                    : "govuk-tag--grey";

                                                        const statusLabel =
                                                            p.status === "UNPAID"
                                                                ? "Neuhra­dené"
                                                                : p.status === "PAID"
                                                                    ? "Uhradené"
                                                                    : "Zrušené";

                                                        const disablePay = p.status !== "UNPAID";

                                                        return (
                                                            <tr className="govuk-table__row" key={p.id}>
                                                                <td className="govuk-table__cell">
                                        <span className="govuk-heading-s govuk-!-margin-bottom-0">
                                            {formatMonth(p.month)}
                                        </span>
                                                                </td>

                                                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                                                    {formatMoney(p.amount)}
                                                                </td>

                                                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                                                    {formatMoney(p.overpayment)}
                                                                </td>

                                                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                                                    {p.days}
                                                                </td>

                                                                <td className="govuk-table__cell">
                                                                    <strong
                                                                        className={`govuk-tag ${tagClass}`}
                                                                    >
                                                                        {statusLabel}
                                                                    </strong>
                                                                </td>

                                                                <td className="govuk-table__cell">
                                                                    {disablePay ? (
                                                                        <span
                                                                            className="govuk-button btn-payment is-disabled"
                                                                            role="button"
                                                                            aria-disabled="true"
                                                                        >
                                                Platobné údaje
                                            </span>
                                                                    ) : (
                                                                        <a
                                                                            className="govuk-button btn-payment"
                                                                            role="button"
                                                                            href="#"
                                                                        >
                                                                            Platobné údaje
                                                                        </a>
                                                                    )}
                                                                </td>

                                                                <td className="govuk-table__cell">
                                                                    <button
                                                                        className="govuk-button govuk-button--secondary btn-icon"
                                                                        aria-label={`Stiahnuť doklad za ${formatMonth(
                                                                            p.month
                                                                        )}`}
                                                                        disabled={!p.invoiceUrl}
                                                                    >
                                            <span
                                                className="material-icons"
                                                aria-hidden="true"
                                            >
                                                download
                                            </span>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    </tbody>
                                                </table>
                                            )}
                                        </section>
                                    ))}
                                </>
                            )}

                            {activeTab === "PAYMENTS" && (
                                <section className="govuk-!-margin-bottom-6">
                                    <h2 className="govuk-heading-l">
                                        Prijaté platby za stravu
                                    </h2>

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
                                        <table className="govuk-table">
                                            <thead className="govuk-table__head">
                                            <tr className="govuk-table__row">
                                                <th
                                                    scope="col"
                                                    className="govuk-table__header"
                                                >
                                                    Dátum platby
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="govuk-table__header govuk-table__header--numeric"
                                                >
                                                    Suma
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="govuk-table__body">
                                            {mealsPayments.map((p) => (
                                                <tr className="govuk-table__row" key={p.id}>
                                                    <td className="govuk-table__cell">
                                                        {formatDate(p.paidAt)}
                                                    </td>
                                                    <td className="govuk-table__cell govuk-table__cell--numeric">
                                                        {formatMoney(p.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    )}
                                </section>
                            )}

                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
