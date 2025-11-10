
import Link from "next/link";
import Header from '@/app/components/Header';


export default function Home() {
  return (
    <>
   
   <Header />

      {/* BODY */}
      <div className="govuk-main-wrapper govuk-width-container idsk-docs">
        <div className="idsk-docs__wrap">

          <div className="idsk-docs__row">
            <main className="idsk-docs__content">
              <h1 className="govuk-heading-xl">Hlavná obrazovka
              </h1>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
