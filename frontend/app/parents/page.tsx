"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import Link from "next/link";

export default function ParentsPage() {
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const parents = [
    {
      id: 1,
      firstName: "Ján",
      lastName: "Novák",
      phone: "+421 905 123 456",
      email: "jan.novak@example.com",
      registrationDate: "2025-10-16",
      child: "Adam Novák",
    },
    {
      id: 2,
      firstName: "Lucia",
      lastName: "Horváthová",
      phone: "+421 944 789 111",
      email: "lucia.horvathova@example.com",
      registrationDate: "",
      child: "Ema Horváthová",
    },
    {
      id: 3,
      firstName: "Marek",
      lastName: "Mrkvička",
      phone: "+421 903 222 555",
      email: "marek.mrkvicka@example.com",
      registrationDate: "2025-09-25",
      child: ["Adam Novák", "Ema Nováková"],
    },
  ];

  return (
    <>
      <Header />

      

      <div className="govuk-width-container" style={{ marginTop: "2rem" }}>
        <h1 className="govuk-heading-xl">Rodičia</h1>
            <Link href="/admin-dashboard" className="govuk-button" role="button" data-module="govuk-button">
                Pridať rodiča
            </Link>

        <div className="parent-table">
          <div className="parent-table-header">
            <div>Meno</div>
            <div>Priezvisko</div>
            <div>Telefón</div>
            <div>E-mail</div>
            <div>Registrácia</div>
            <div>Deti</div>
            <div className="actions-col"></div>
          </div>

          {parents.map((p) => (
            <div key={p.id} className="parent-row">
              <div>{p.firstName}</div>
              <div>{p.lastName}</div>
              <div>{p.phone}</div>
              <div className="email-cell">{p.email}</div>
              <div>
                {p.registrationDate
                  ? new Date(p.registrationDate).toLocaleDateString("sk-SK")
                  : ""}
              </div>

              <div className="children-cell">
                {Array.isArray(p.child) ? (
                  p.child.map((c, i) => (
                    <span key={i} className="child-tag">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="child-tag">{p.child}</span>
                )}
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
                    <button>Pridať e-mail</button>
                    <button>Odobrať</button>
                    <button>Zobraziť dieťa</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
