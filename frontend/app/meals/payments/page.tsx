import Link from "next/link";
import Header from '@/app/components/Header';
type PaymentStatus = 'UNPAID' | 'PAID' | 'CANCELED';

type Payment = {
  id: string;
  month: string;
  amount: number;
  days: number;
  status: PaymentStatus;
  invoiceUrl?: string;
};

const SK_MONTHS = [
  'Január','Február','Marec','Apríl','Máj','Jún',
  'Júl','August','September','Október','November','December'
];

const formatMonth = (iso: string) => {
  const d = new Date(iso);
  return `${SK_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
const formatMoney = (n: number) =>
  `${n.toLocaleString('sk-SK', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}€`;

const payments: Payment[] = [
  { id: '2025-11', month: '2025-11-01', amount: 64.6, days: 18, status: 'UNPAID',   invoiceUrl: '#' },
  { id: '2025-10', month: '2025-10-01', amount: 64.6, days: 18, status: 'PAID',     invoiceUrl: '#' },
  { id: '2025-09', month: '2025-09-01', amount: 64.6, days: 18, status: 'PAID',     invoiceUrl: '#' },
  { id: '2025-08', month: '2025-08-01', amount: 0.0,  days: 0,  status: 'CANCELED' },
];



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
                <li className="idsk-docs__item">
                  <Link className="idsk-docs__link" href="/meals/menu" title='Jedálny lístok'>
                    Jedálny lístok
                  </Link>
                </li>
                <li className="idsk-docs__item">
                  <Link className="idsk-docs__link" href="/meals/meal-cancellation" title='Odhlasovanie'>
                    Odhlasovanie
                  </Link>
                </li>
                <li className="idsk-docs__item">
                  <Link className="idsk-docs__link is-active" href="/meals/payments" title='Platby'>
                    Platby
                  </Link>
              </li>
            </ul>
            </aside>
            <main className="idsk-docs__content payments">
            <h1 className="govuk-heading-xl">Platby</h1>

            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Mesiac</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Suma</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Počet dní</th>
                  <th scope="col" className="govuk-table__header">Status</th>
                  <th scope="col" className="govuk-table__header"> </th>
                  <th scope="col" className="govuk-table__header"> </th>
                </tr>
              </thead>

              <tbody className="govuk-table__body">
                {payments.map((p) => {
                  const tagClass =
                    p.status === 'UNPAID'   ? 'govuk-tag--red'  :
                    p.status === 'PAID'     ? 'govuk-tag--green':
                                              'govuk-tag--grey';

                  const statusLabel =
                    p.status === 'UNPAID'   ? 'Neuhra­dené' :
                    p.status === 'PAID'     ? 'Uhradené'   : 'Zrušené';

                  const disablePay = p.status !== 'UNPAID';

                  return (
                    <tr className="govuk-table__row" key={p.id}>
                      <td className="govuk-table__cell">
                        <span className="govuk-heading-s govuk-!-margin-bottom-0">
                          {formatMonth(p.month)}
                        </span>
                      </td>

                      <td className="govuk-table__cell govuk-table__cell--numeric">
                        {formatMoney(p.amount)}
                      </td>

                      <td className="govuk-table__cell govuk-table__cell--numeric">
                        {p.days}
                      </td>

                      <td className="govuk-table__cell">
                        <strong className={`govuk-tag ${tagClass}`}>{statusLabel}</strong>
                      </td>

                      <td className="govuk-table__cell">
                        {disablePay ? (
                          <span
                            className="govuk-button btn-payment is-disabled"
                            role="button"
                            aria-disabled="true"
                          >
                            Platobné údaje
                          </span>
                        ) : (
                          <a
                            className="govuk-button btn-payment"
                            role="button"
                            href="#"
                          >
                            Platobné údaje
                          </a>
                        )}
                      </td>
                      <td className="govuk-table__cell">
                        <button
                          className="govuk-button govuk-button--secondary btn-icon"
                          aria-label={`Stiahnuť doklad za ${formatMonth(p.month)}`}
                          disabled={!p.invoiceUrl}
                        >
                          <span className="material-icons" aria-hidden="true">download</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="govuk-!-margin-top-6">
              <button className="govuk-button next" type="button">Načítať ďalšie</button>
            </div>
          </main>
          </div>
        </div>
      </div>
    </>
  );
}
