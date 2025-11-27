"use client";

import Header from "@/app/components/Header";
import Link from "next/link";

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
        }}
      >
        <h1 className="govuk-heading-xl">Vitajte na webe EduKinder!</h1>
        <p className="govuk-body-l" style={{ maxWidth: "500px" }}>
          Tento portál slúži na jednoduchú správu škôlky — prístup k dochádzke, strave,
          triedam, rodičom a oznamom.
        </p>
      </main>
    </>
  );
}
