import MenuDisplay from '@/app/components/MenuDisplay';
import Header from '@/app/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <>
   <Header />

      {/* BODY */}
      <div className="govuk-main-wrapper govuk-width-container idsk-docs">
        <div className="idsk-docs__wrap">
          <span className="idsk-docs__divider" aria-hidden="true"></span>

          <div className="idsk-docs__row">
            <aside className="idsk-docs__sidenav" aria-label="Navigácia sekcií">
              <ul className="idsk-docs__list govuk-list">
                <li className="idsk-docs__item"><a className="idsk-docs__link is-active" href="/meals/menu">Jedálny lístok</a></li>
                <li className="idsk-docs__item"><a className="idsk-docs__link" href="/meals/meal-cancellation">Odhlasovanie</a></li>
                <li className="idsk-docs__item"><a className="idsk-docs__link" href="/meals/payments">Platby</a></li>
              </ul>
            </aside>
            <main className="idsk-docs__content">
              <h1 className="govuk-heading-xl">Jedálny lístok</h1>
              <MenuDisplay pdfUrl="https://www.upjs.sk/app/uploads/sites/26/2025/10/20-24.10.2025.pdf" />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
