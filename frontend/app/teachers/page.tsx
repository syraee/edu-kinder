"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

interface Teacher {
    id: number;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string;
    active: boolean;
    createdAt: string;
    classes: string[];
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeachers() {
            try {
                const res = await fetch(`${API_BASE}/user/teachers`, {
                    credentials: "include",
                });
                const data = await res.json();

                if (data?.success && Array.isArray(data.data)) {
                    setTeachers(data.data);
                } else {
                    console.warn("Neočakávaná odpoveď API:", data);
                }
            } catch (err) {
                console.error("Chyba pri načítaní rodičov:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchTeachers();
    }, []);

    return (
        <>
            <Header />

            <div className="govuk-width-container" style={{ marginTop: "2rem" }}>
                <div className="header-row">
                    <h1 className="govuk-heading-xl">Učitelia</h1>
                    <Link
                        href="/admin-dashboard/add-teacher"
                        className="govuk-button add-parent"
                        role="button"
                        data-module="govuk-button"
                    >
                        Pridať učiteľa
                    </Link>
                </div>

                {loading ? (
                    <p className="govuk-body">Načítavam údaje...</p>
                ) : teachers.length === 0 ? (
                    <p className="govuk-body">Zatiaľ neboli pridaní žiadni rodičia.</p>
                ) : (
                    <div className="parent-table">
                        {/* HLAVIČKA */}
                        <div className="parent-table-header">
                            <div>Meno</div>
                            <div>Priezvisko</div>
                            <div>Telefón</div>
                            <div>E-mail</div>
                            <div>Trieda</div>
                            <div className="actions-col"></div>
                        </div>

                        {/* RIADKY */}
                        {teachers.map((p) => (
                            <div key={p.id} className="parent-row">
                                <div>{p.firstName || "—"}</div>
                                <div>{p.lastName || "—"}</div>
                                <div>{p.phone || "—"}</div>
                                <div className="email-cell">{p.email}</div>
                                <div>
                                    {p.classes && p.classes.length > 0
                                        ? p.classes.join(", ")
                                        : "—"}
                                </div>


                                <div className="actions">
                                    <button
                                        className="menu-btn"
                                        onClick={() =>
                                            setOpenMenu(openMenu === p.id ? null : p.id)
                                        }
                                    >
                                        ⋮
                                    </button>

                                    {openMenu === p.id && (
                                        <div className="dropdown">
                                            <button>Upraviť</button>
                                            <button>Odobrať</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
