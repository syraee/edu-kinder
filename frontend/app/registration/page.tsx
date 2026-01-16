import { Suspense } from "react";
import RegistrationClient from "./RegistrationClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="govuk-body">Načítavam…</div>}>
      <RegistrationClient />
    </Suspense>
  );
}