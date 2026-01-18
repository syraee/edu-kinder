"use client";

import Header from "@/app/components/Header";

export default function HomePage() {
    return (
        <>
            <Header />

            <main
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "70vh",
                    flexDirection: "column",
                    textAlign: "center",
                    padding: "24px 16px",
                    gap: "16px",
                }}

            >
                {/* Banner / fotka */}
                <b></b>
                <b></b>
                <div style={{ width: "100%", maxWidth: "1100px" }}>
                    <img
                        src="/upejesko-banner.jpg"
                        alt="Materská škola UpeješKo"
                        style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "12px",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                            display: "block",
                        }}
                    />
                </div>
                <b></b>
                <b></b>
                <h1 className="govuk-heading-xl" style={{ marginTop: "8px" }}>
                    Vitajte!
                </h1>

                <p className="govuk-body-l" style={{ maxWidth: "650px", margin: 0 }}>
                    Tento portál slúži na jednoduchú správu škôlky — prístup k dochádzke, strave,
                    triedam, rodičom a oznamom.
                </p>



                {/* Text pod tým */}
                <p className="govuk-body" style={{ maxWidth: "650px", margin: 0 }}>
                    Tento web bol vytvorený v systéme <strong>EduKinder</strong> pre Materskú školu{" "}
                    <strong>UpeješKo</strong>.
                </p>
            </main>
        </>
    );
}