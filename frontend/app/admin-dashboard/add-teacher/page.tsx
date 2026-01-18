"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import {set} from "immutable";
import { API_BASE } from "@/lib/apiBase";
interface AddedTeachers {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
}

export default function InviteTeachersPage() {
    //const [title, setTitle] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [search, setSearch] = useState("");

    const [addedTeachers, setAddedTeachers] = useState<AddedTeachers[]>([]);
    const [error, setError] = useState<string>("");
    const [sending, setSending] = useState(false);
    const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const API_BASE = process.env.BACKEND_URL ?? "http://localhost:5000";

    const normalize = (v: string) => v.trim().toLowerCase();
    const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const pendingCount = useMemo(() => addedTeachers.length, [addedTeachers]);


    async function addEmail(e?: React.FormEvent) {
        if (e) e.preventDefault();
        const candidate = normalize(emailInput);
        setBanner(null);

        if (!firstName.trim() || !lastName.trim()) {
            setError("Zadajte meno aj priezvisko.");
            return;
        }
        if (!phone.trim()) {
            setError("Zadajte telefónne číslo.");
            return;
        }
        if (!candidate || !isValidEmail(candidate)) {
            setError("Zadajte platný e-mail.");
            return;
        }
        if (addedTeachers.some(p => p.email === candidate)) {
            setError("Tento e-mail už je v zozname.");
            return;
        }

        //const fullFirstName = `${title.trim()} ${firstName.trim()}`.trim();
        try {
            const resUser = await fetch(`${API_BASE}/api/user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName,
                    email: candidate,
                    phone,
                    roleId: 2,
                    active: false,
                }),
            });

            const userData = await resUser.json();
            if (!resUser.ok || !userData.success) {
                throw new Error(userData.error || "Nepodarilo sa vytvoriť učiteľa.");
            }
            const userId: number = userData.data.id;

            setAddedTeachers(prev => [
                ...prev,
                {
                    id: userId,
                    email: candidate,
                    firstName: firstName,
                    lastName,
                },
            ]);

            //setTitle("");
            setEmailInput("");
            setFirstName("");
            setLastName("");
            setPhone("");
            setSearch("");
            setError("");
            setBanner({ type: "success", text: "Učiteľ úspešne pridaný do zoznamu" });
        } catch (err) {
            console.error("❌ Chyba pri pridávaní učiteľa:", err);
            setBanner({ type: "error", text: "Nepodarilo sa pridať učiteľa." });
        }
    }

    async function removeTeacher(idx: number) {
        setBanner(null);
        setError("");

        const teacher = addedTeachers[idx];
        if (!teacher) return;

        try {
            const res = await fetch(`${API_BASE}/api/user/${teacher.id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                console.error("Delete failed:", data);
                setBanner({
                    type: "error",
                    text: data.error || "Nepodarilo sa vymazať učiteľa z databázy.",
                });
                return;
            }
            setAddedTeachers((prev) => prev.filter((_, i) => i !== idx));
            setBanner({ type: "success", text: "Učiteľ bol vymazaný z databázy." });
        } catch (err) {
            console.error("❌ Chyba pri mazaní učiteľa:", err);
            setBanner({ type: "error", text: "Nepodarilo sa vymazať učiteľa." });
        }
    }

    async function sendInvites() {
        if (addedTeachers.length === 0) {
            setError("Nie je koho pozvať.");
            return;
        }
        try {
            setSending(true);
            const emails = addedTeachers.map(p => p.email);
            const response = await fetch(`${API_BASE}/api/auth/register/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emails }),
                credentials: "include",
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Nepodarilo sa odoslať pozvánky.");

            setBanner({
                type: "success",
                text: `Pozvánky spracované: ${data.summary.sent} odoslané, ${data.summary.skipped} preskočené, ${data.summary.failed} zlyhali.`,
            });
            setAddedTeachers([]);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Chyba pri odosielaní pozvánok.";
            setBanner({ type: "error", text: message });
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            <Header />
          

            <main className="govuk-main-wrapper auth-center govuk-width-container invite-teachers" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <h1 className="govuk-heading-xl">Pozvanie učiteľov – vytvorenie konta</h1>

                        <form onSubmit={addEmail} className="govuk-!-margin-bottom-6">
                            {/*<div className="govuk-form-group">*/}
                            {/*    <label className="govuk-label">Titul</label>*/}
                            {/*    <input className="govuk-input govuk-!-width-one-quarter"*/}
                            {/*           value={title} onChange={(e) => setTitle(e.target.value)} />*/}
                            {/*</div>*/}
                            <div className="govuk-form-group">
                                <label className="govuk-label">Meno</label>
                                <input className="govuk-input govuk-!-width-one-half"
                                       value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>

                            <div className="govuk-form-group">
                                <label className="govuk-label">Priezvisko</label>
                                <input className="govuk-input govuk-!-width-one-half"
                                       value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>

                            <div className="govuk-form-group">
                                <label className="govuk-label">Telefón</label>
                                <input className="govuk-input govuk-!-width-one-half"
                                       value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+421 900 123 456" />
                            </div>

                            <div className="govuk-form-group">
                                <label className="govuk-label">E-mail</label>
                                <input className="govuk-input govuk-!-width-two-thirds"
                                       value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                                       placeholder="meno.priezvisko@example.com" />
                            </div>


                            <button type="submit" className="govuk-button">Pridať</button>
                        </form>

                        {/* Zoznam pridaných učiteľov */}
                        {pendingCount > 0 && (
                            <>
                                <h2 className="govuk-heading-m">Zoznam pridaných učiteľov ({pendingCount})</h2>
                                <dl className="govuk-summary-list invite-list">
                                    {addedTeachers.map((p, idx) => (
                                        <div className="govuk-summary-list__row" key={p.email}>
                                            <dt className="govuk-summary-list__key">
                                                {p.firstName} {p.lastName} — {p.email}
                                            </dt>
                                            <dd className="govuk-summary-list__actions">
                                                <button type="button" className="govuk-link" onClick={() => removeTeacher(idx)}>
                                                    odstrániť
                                                </button>
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </>
                        )}

                        {/* Odošlanie pozvánok */}
                        <div className="govuk-button-group govuk-!-margin-top-6">
                            <button
                                type="button"
                                onClick={sendInvites}
                                className="govuk-button"
                                disabled={pendingCount === 0 || sending}
                            >
                                {sending ? "Odosielam…" : "Odoslať pozvánky"}
                            </button>
                        </div>

                        {banner && (
                            <div
                                className={`govuk-notification-banner govuk-!-margin-top-6 ${banner.type === "success" ? "govuk-notification-banner--success" : ""}`}
                                role="region"
                            >
                                <div className="govuk-notification-banner__content">
                                    <p className="govuk-body">{banner.text}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
