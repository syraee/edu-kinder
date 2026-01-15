"use client";

import Link from "next/link";
import Header from "@/app/components/Header";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Role = "ADMIN" | "TEACHER" | "PARENT" | string;

const FRONT_API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000";
const API_BASE = `${FRONT_API_BASE}/api`;


type Tab = "ORDERS" | "PAYMENTS" | "MANAGE";

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

function getSchoolYearStart(d: Date): number {
    const y = d.getFullYear();
    const m = d.getMonth();
    return m >= 8 ? y : y - 1;
}

function schoolYearLabelFromDate(d: Date): string {
    const start = getSchoolYearStart(d);
    return `${start}/${start + 1}`;
}

function schoolYearLabelFromIso(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Neznámy";
    return schoolYearLabelFromDate(d);
}


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
    const now = new Date();
    const [manageYear, setManageYear] = useState<number>(now.getFullYear());
    const [manageMonth, setManageMonth] = useState<number>(now.getMonth() + 1);
    const [manageLoading, setManageLoading] = useState(false);
    const [manageMsg, setManageMsg] = useState<string | null>(null);
    const [manageErr, setManageErr] = useState<string | null>(null);

    const [mealsPayments, setMealsPayments] = useState<ChildMealsPayments[]>([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [paymentsError, setPaymentsError] = useState<string | null>(null);
    const [qrModal, setQrModal] = useState<QrModalState>({
        open: false,
        childName: "",
        qrValue: "",
        details: undefined,
    });

    const [role, setRole] = useState<Role | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const r = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
                const j = await r.json();
                if (!alive) return;
                setRole(j?.user?.role ?? null);
            } catch {
                if (!alive) return;
                setRole(null);
            }
        })();
        return () => { alive = false; };
    }, []);
    const roleKey = String(role ?? "").toUpperCase();
    const isTeacherOrAdmin = roleKey === "TEACHER" || roleKey === "ADMIN";

    const [syIndex, setSyIndex] = useState(0);

    const schoolYears = (() => {
        const set = new Set<string>();


        for (const child of statements) {
            for (const it of child.items) {
                set.add(schoolYearLabelFromIso(it.month));
            }
        }


        for (const child of mealsPayments) {
            for (const r of child.records) {
                set.add(schoolYearLabelFromIso(r.paidAt));
            }
        }

        return Array.from(set).sort((a, b) => b.localeCompare(a));
    })();

    useEffect(() => {
        if (schoolYears.length > 0) setSyIndex(0);
    }, [statements, mealsPayments]);

    const activeSY = schoolYears[syIndex] ?? null;





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

    function getErrorMessage(e: unknown): string {
        if (e instanceof Error) return e.message;
        if (typeof e === "string") return e;
        return "Nastala neočakávaná chyba.";
    }

    async function generateStatements() {
        setManageErr(null);
        setManageMsg(null);
        setManageLoading(true);

        try {
            const res = await fetch(`${API_BASE}/payment/generate-meals-statements`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year: manageYear, month: manageMonth }),
            });

            const json: unknown = await res.json().catch(() => null);


            const ok =
                typeof json === "object" &&
                json !== null &&
                "success" in json &&
                (json as { success: unknown }).success === true;

            if (!res.ok || !ok) {
                const err =
                    typeof json === "object" &&
                    json !== null &&
                    "error" in json &&
                    typeof (json as { error: unknown }).error === "string"
                        ? (json as { error: string }).error
                        : "Generovanie zlyhalo.";
                throw new Error(err);
            }

            setManageMsg("Predpisy boli vygenerované.");
            window.location.reload();
        } catch (e: unknown) {
            setManageErr(getErrorMessage(e));
        } finally {
            setManageLoading(false);
        }
    }

    async function closeMonth() {
        setManageErr(null);
        setManageMsg(null);
        setManageLoading(true);

        try {
            const res = await fetch(`${API_BASE}/payment/close-meals-month`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year: manageYear, month: manageMonth }),
            });

            const json: unknown = await res.json().catch(() => null);

            const ok =
                typeof json === "object" &&
                json !== null &&
                "success" in json &&
                (json as { success: unknown }).success === true;

            if (!res.ok || !ok) {
                const err =
                    typeof json === "object" &&
                    json !== null &&
                    "error" in json &&
                    typeof (json as { error: unknown }).error === "string"
                        ? (json as { error: string }).error
                        : "Uzatvorenie zlyhalo.";
                throw new Error(err);
            }

            setManageMsg("Mesiac bol uzatvorený (prepočty preplatkov hotové).");
            window.location.reload();
        } catch (e: unknown) {
            setManageErr(getErrorMessage(e));
        } finally {
            setManageLoading(false);
        }
    }




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

                                    {isTeacherOrAdmin && (
                                        <li className={`idsk-tabs__list-item ${activeTab === "MANAGE" ? "idsk-tabs__list-item--selected" : ""}`}>
                                            <button type="button" className="idsk-tabs__tab" onClick={() => setActiveTab("MANAGE")}>
                                                Správa
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {activeSY && (activeTab === "ORDERS" || activeTab === "PAYMENTS") && (
                                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                                <div className="month-nav">

                                    <button
                                        type="button"
                                        className="govuk-button govuk-button--secondary btn-icon"
                                        onClick={() => setSyIndex((i) => Math.max(i - 1, 0))}

                                    >
                                        ‹
                                    </button>

                                    <strong className="month-label">{activeSY}</strong>

                                    <button
                                        type="button"
                                        className="govuk-button govuk-button--secondary btn-icon"
                                        onClick={() => setSyIndex((i) => Math.min(i + 1, schoolYears.length - 1))}

                                    >
                                        ›
                                    </button>
                                </div>
                                </div>
                            )}


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
                                                    {child.items
                                                        .filter((item) => !activeSY || schoolYearLabelFromIso(item.month) === activeSY)
                                                        .map((item) => {
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
                                                    {child.records
                                                        .filter((r) => !activeSY || schoolYearLabelFromIso(r.paidAt) === activeSY)
                                                        .map((r) => (
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

                            {activeTab === "MANAGE" && isTeacherOrAdmin && (
                                <>
                                    <h2 className="govuk-heading-l">Generovanie a uzatvorenie mesiacov</h2>

                                    {manageErr && (
                                        <div className="govuk-error-summary" role="alert">
                                            <h2 className="govuk-error-summary__title">Nastala chyba</h2>
                                            <div className="govuk-error-summary__body">
                                                <p className="govuk-body">{manageErr}</p>
                                            </div>
                                        </div>
                                    )}

                                    {manageMsg && <p className="govuk-body"><b>{manageMsg}</b></p>}

                                    <div className="govuk-form-group" style={{ maxWidth: 520 }}>
                                        <label className="govuk-label" htmlFor="mYear">Rok</label>
                                        <input
                                            id="mYear"
                                            type="number"
                                            className="govuk-input govuk-!-width-one-third"
                                            value={manageYear}
                                            onChange={(e) => setManageYear(Number(e.target.value))}
                                        />

                                        <label className="govuk-label" htmlFor="mMonth" style={{ marginTop: 12 }}>Mesiac</label>
                                        <select
                                            id="mMonth"
                                            className="govuk-select"
                                            value={manageMonth}
                                            onChange={(e) => setManageMonth(Number(e.target.value))}
                                        >
                                            {SK_MONTHS.map((name, idx) => (
                                                <option key={name} value={idx + 1}>{name}</option>
                                            ))}
                                        </select>

                                        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                                            <button
                                                type="button"
                                                className="govuk-button"
                                                onClick={generateStatements}
                                                disabled={manageLoading}
                                            >
                                                Generovať predpisy
                                            </button>

                                            <button
                                                type="button"
                                                className="govuk-button govuk-button--secondary"
                                                onClick={closeMonth}
                                                disabled={manageLoading}
                                            >
                                                Uzatvoriť mesiac
                                            </button>
                                        </div>

                                    </div>
                                </>
                            )}



                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
