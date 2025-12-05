"use client";

import Header from "@/app/components/Header";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

type Parent = {
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
    const [parents, setParents] = useState<Parent[]>([]);
    const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number | "">("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchParents = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/child`);
                const data = await response.json();
                if (data.success) {
                    setParents(data.data);
                } else {
                    setError("Nepodarilo sa načítať rodičov.");
                }
            } catch (e) {
                setError("Chyba pri načítavaní rodičov.");
            } finally {
                setLoading(false);
            }
        };

        fetchParents();
    }, []);



    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const filtered = parents.filter(
            (p) =>
                (p.firstName && p.firstName.toLowerCase().includes(lower)) ||
                (p.lastName && p.lastName.toLowerCase().includes(lower))
        );
        setFilteredParents(filtered);
    }, [searchTerm, parents]);

    const handleSelectParent = (parent:Parent) => {
        setSelectedParent(parent);
        setSearchTerm(`${parent.firstName} ${parent.lastName}`);
    };

    const handleSavePayment = async () => {
        if (!selectedParent || paymentAmount === "") {
            setError("Vyplňte všetky polia.");
            return;
        }

        const paymentData = {
            amount: Number(paymentAmount),
            parentId: selectedParent.id,
            feeType: "STRAVNE",
            paidAt: new Date().toISOString(),
        };

        try {
            const res = await fetch(`${API_BASE}/payment/add-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentData),
            });

            const data = await res.json();
            if (res.ok) {
                alert("Platba bola úspešne zaznamenaná.");
                setSearchTerm("");
                setPaymentAmount("");
                setSelectedParent(null);
            } else {
                setError(data.message || "Nastala chyba pri uložení platby.");
            }
        } catch (e) {
            setError("Nastala chyba pri ukladaní platby.");
        }
    };

    async function deletePaymentFromApi(id: number) {
        if (!confirm(`Naozaj chceš zmazať platbu s ID ${id}?`)) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/payment/payments/${id}`, {
                method: "DELETE",
                credentials: "include", // kvôli cookies / authenticate
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok || json.success === false) {
                throw new Error(json.error || "Mazanie zlyhalo");
            }

            alert("Platba bola vymazaná.");

        } catch (err) {
            console.error("Chyba pri mazaní platby:", err);
            alert("Nepodarilo sa vymazať platbu.");
        }
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
                                {searchTerm && filteredParents.length > 0 && (
                                    <div className="parent-suggestions">
                                        <ul className="govuk-list">
                                            {filteredParents.map((parent) => (
                                                <li key={parent.id}>
                                                    <button
                                                        type="button"
                                                        className="govuk-link"
                                                        onClick={() => handleSelectParent(parent)}
                                                    >
                                                        {parent.firstName} {parent.lastName}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {selectedParent && (
                                <div className="govuk-form-group">
                                    <h3>Dieťa vybrané: {selectedParent.firstName} {selectedParent.lastName}</h3>
                                    <label className="govuk-label" htmlFor="payment-amount">
                                        Zadajte sumu platby
                                    </label>
                                    <div className="payment-amount-row">
                                    <input
                                        className="govuk-input govuk-!-width-one-third"
                                        id="payment-amount"
                                        type="number"
                                        step="0.01"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                    />
                                    <button
                                        type="button"
                                        className="govuk-button"
                                        onClick={handleSavePayment}
                                    >
                                        Uložiť platbu
                                    </button>
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
