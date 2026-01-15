"use client";

import Header from "@/app/components/Header";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

type Child = {
    id: string;
    firstName: string;
    lastName: string;
};

type Payment = {
    feeType: string;
    amount: number;
    parentId: string;
    paidAt: string;
};

export default function PaymentSettingsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [children, setChildren] = useState<Child[]>([]);
    const [filteredChildren, setFilteredChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string | "">("");
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_BASE}/child`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    setChildren(data.data);
                } else {
                    setError(data.error || "Nepodarilo sa načítať deti.");
                }
            } catch (e) {
                console.error(e);
                setError("Chyba pri načítavaní detí.");
            } finally {
                setLoading(false);
            }
        };

        fetchChildren();
    }, []);



    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const filtered = children.filter(
            (c) =>
                (c.firstName && c.firstName.toLowerCase().includes(lower)) ||
                (c.lastName && c.lastName.toLowerCase().includes(lower))
        );
        setFilteredChildren(filtered);
    }, [searchTerm, children]);

    const handleSelectChild = (child: Child) => {
        setSelectedChild(child);
        setSearchTerm(`${child.firstName} ${child.lastName}`);
    };

    const handleSavePayment = async () => {
        setError(null);

        if (!selectedChild || !paymentAmount || !paymentDate) {
            setError("Vyplňte dieťa, sumu aj dátum platby.");
            return;
        }

        const amountNumber = Number(paymentAmount);
        if (Number.isNaN(amountNumber) || amountNumber <= 0) {
            setError("Zadajte platnú sumu väčšiu ako 0.");
            return;
        }

        const paymentData = {
            amount: amountNumber,
            childId: selectedChild.id,
            feeType: "STRAVA",
            paidAt: paymentDate,
        };

        try {
            const res = await fetch(`${API_BASE}/payment/add-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(paymentData),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || data.success === false) {
                throw new Error(data.error || data.message || "Nastala chyba pri uložení platby.");
            }

            alert("Platba bola úspešne zaznamenaná.");

            setSelectedChild(null);
            setSearchTerm("");
            setPaymentAmount("");
            setPaymentDate(new Date().toISOString().slice(0, 10));
        } catch (e) {
            console.error(e);
            setError(
                e instanceof Error
                    ? e.message
                    : "Nastala chyba pri ukladaní platby."
            );
        }
    };


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
                                    <Link className="idsk-docs__link is-active" href="/payment-management/payment-input-meals" title="Zápis platieb">
                                        Zápis platieb - stravné
                                    </Link>
                                </li>
                                <li className="idsk-docs__item">
                                    <Link className="idsk-docs__link" href="/payment-management/payment-input-tuition" title="Zápis platieb">
                                        Zápis platieb - školné
                                    </Link>
                                </li>
                                <li className="idsk-docs__item">
                                    <Link className="idsk-docs__link" href="/payment-management/month-modify" title="Fixné hodnoty">
                                        Fixné hodnoty za obedy/školné
                                    </Link>
                                </li>
                                <li className="idsk-docs__item">
                                    <Link className="idsk-docs__link" href="/payment-management/overview" title="Prehľad">
                                        História zmien
                                    </Link>
                                </li>

                            </ul>
                        </aside>

                        <main className="idsk-docs__content payments">
                            <h1 className="govuk-heading-xl">Zápis platieb - stravné</h1>


                            <div className="govuk-form-group">
                                <label className="govuk-label" htmlFor="parent-search">
                                    Vyhľadajte dieťa
                                </label>
                                <input
                                    className="govuk-input govuk-!-width-one-third"
                                    id="parent-search"
                                    type="text"
                                    placeholder="Zadajte meno alebo e-mail"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {loading && <p>Načítavam...</p>}
                                {error && <p className="govuk-error-message">{error}</p>}
                                {searchTerm && filteredChildren.length > 0 && (
                                    <div className="parent-suggestions">
                                        <ul className="govuk-list">
                                            {filteredChildren.map((child) => (
                                                <li key={child.id}>
                                                    <button
                                                        type="button"
                                                        className="govuk-link"
                                                        onClick={() => handleSelectChild(child)}
                                                    >
                                                        {child.firstName} {child.lastName}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {selectedChild && (
                                <div className="govuk-form-group">
                                    <h3 className="govuk-heading-m">
                                        Dieťa vybrané: {selectedChild.firstName}{" "}
                                        {selectedChild.lastName}
                                    </h3>

                                    <div className="govuk-form-group">
                                        <label
                                            className="govuk-label"
                                            htmlFor="payment-amount"
                                        >
                                            Zadajte sumu platby
                                        </label>
                                        <input
                                            className="govuk-input govuk-!-width-one-third"
                                            id="payment-amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="govuk-form-group">
                                        <label
                                            className="govuk-label"
                                            htmlFor="payment-date"
                                        >
                                            Dátum platby
                                        </label>
                                        <input
                                            className="govuk-input govuk-!-width-one-third"
                                            id="payment-date"
                                            type="date"
                                            value={paymentDate}
                                            onChange={(e) => setPaymentDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className="govuk-button"
                                        onClick={handleSavePayment}
                                    >
                                        Uložiť platbu
                                    </button>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
