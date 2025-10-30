import Link from "next/link";

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
    {/* Header */}
      <div className="govuk-header__wrapper">
        <header className="govuk-header idsk-shadow-head" data-module="govuk-header">
          <div className="govuk-header__container ">
            <div className="idsk-secondary-navigation govuk-width-container">
              <div className="idsk-secondary-navigation__header">
                <div className="idsk-secondary-navigation__heading">
                  <div className="idsk-secondary-navigation__heading-title">
                    <span className="idsk-secondary-navigation__heading-mobile">SK</span>
                  </div>

                  <div className="idsk-secondary-navigation__body hidden" data-testid="secnav-children">
                    <div className="idsk-secondary-navigation__text">
                      <div>
                        <h3 className="govuk-body-s"><b>Doména gov.sk je oficiálna</b></h3>
                        <p className="govuk-body-s">
                          Toto je oficiálna webová stránka orgánu verejnej moci Slovenskej republiky. Oficiálne stránky
                          využívajú najmä doménu gov.sk.
                          <a
                            className="govuk-link--inverse"
                            href="https://www.slovensko.sk/sk/agendy/agenda/_organy-verejnej-moci"
                            target="_blank"
                          >
                            Odkazy na jednotlivé webové sídla orgánov verejnej moci nájdete na tomto odkaze.
                          </a>
                        </p>
                      </div>
                      <div>
                        <h3 className="govuk-body-s"><b>Táto stránka je zabezpečená</b></h3>
                        <p className="govuk-body-s max-width77-desktop">
                          Buďte pozorní a vždy sa uistite, že zdieľate informácie iba cez zabezpečenú webovú stránku
                          verejnej správy SR. Zabezpečená stránka vždy začína https:// pred názvom domény webového sídla.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="idsk-dropdown__wrapper idsk-secondary-navigation__dropdown"
                  data-pseudolabel="jazykové menu"
                >
                  <button
                    className="govuk-button govuk-button--texted--inverse idsk-secondary-navigation__heading-button idsk-dropdown"
                    aria-label="Rozbaliť jazykové menu"
                    aria-haspopup="listbox"
                  >
                    <span>slovenčina</span>
                    <span className="material-icons" aria-hidden="true">arrow_drop_down</span>
                  </button>
                  <ul className="idsk-dropdown__options idsk-shadow-medium">
                    <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="eng">
                      <a href="#" lang="en">eng</a>
                    </li>
                    <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="slo">
                      <a href="#" lang="sk">slo</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="govuk-predheader govuk-width-container">
            <div className="govuk-header__logo">
              <Link
                href="/"
                className="govuk-header__link govuk-header__link--homepage"
                title="Odkaz na titulnú stránku"
              >
                <img
                  src="/idsk-assets/images/logo_upejesko.jpg"
                  alt="Logo Škôlky s odkazom na titulnú stránku"
                />
              </Link>
            </div>

            <div className="govuk-header__btns-search" >
              <div className="govuk-header__mobile-menu desktop-hidden">
                <button type="button" className="govuk-header__menu-button font-bold govuk-js-header-toggle" aria-controls="navigation" hidden>
                  Menu
                </button>
                <div className="govuk-header__actionPanel mobile desktop-hidden">
                  <button className="govuk-button" title="Notifikácie"><span role="button" className="material-icons" aria-hidden="true">notifications</span></button>
                  <button className="govuk-button" title="Informácie o portáli"><span role="button" className="material-icons" aria-hidden="true">info</span></button>
                </div>
              </div>

              <div className="idsk-searchbar__wrapper" role="search">
                <input className="govuk-input" type="search" placeholder="Zadajte hľadaný výraz" title="Zadajte hľadaný výraz" name="search" />
                <button className="govuk-button govuk-button__basic" aria-label="Hľadať"><span className="material-icons" aria-hidden="true">search</span></button>
              </div>
              <div className="govuk-header__actionPanel desktop mobile-hidden">
                <button className="govuk-button" title="Notifikácie"><span role="button" className="material-icons" aria-hidden="true">notifications</span></button>
                <button className="govuk-button" title="Informácie o portáli"><span role="button" className="material-icons" aria-hidden="true">info</span></button>
                <button className="govuk-button govuk-header__profile_button" title="Profil">MM</button>
              </div>
            </div>
          </div>

          <nav id="navigation" aria-label="Menu" className="govuk-header__navigation govuk-width-container">
            <dialog id="navigationProfileDialog">
              <div className="govuk-header__profile">
                <div className="govuk-header__profile__header mobile-hidden">
                  <div className="govuk-heading-m">Profil</div>
                  <button className="govuk-button govuk-button--texted govuk-header__profile_close_button"><span className="material-icons">close</span></button>
                </div>
                <div className="govuk-header__profile__body">
                  <img className="profile" src="https://placehold.co/100x100/072C66/FFFFFF?text=JH" alt="Profile"/>
                  <h4 className="govuk-heading-l">Janko Hruska</h4>
                  <span>RČ 123456/1234</span>

                  <button className="govuk-button govuk-button__basic">Primárne tlačidlo</button>
                  <button className="govuk-button govuk-button--texted govuk-button--texted__warning">Textové tlačidlo</button>
                </div>
              </div>
            </dialog>
          </nav>

          <nav id="navigation" aria-label="Menu" className="govuk-header__navigation govuk-width-container">
            <span className="text">Menu</span>
            <div className="govuk-header__navigation-list">
              <ul>
                <li
                  className="govuk-header__navigation-item govuk-header__navigation-item--active"
                  aria-current="page"
                >
                  <a className="govuk-header__link" href="/strava/jedalny-listok" title="Strava">
                    Strava
                  </a>
                </li>
                <li className="govuk-header__navigation-item">
                  <a className="govuk-header__link" href="#2" title="Fotogaléria">
                    Fotogaléria
                  </a>
                </li>
                <li className="govuk-header__navigation-item">
                  <a className="govuk-header__link" href="#3" title="Dochádzka">
                    Dochádzka
                  </a>
                </li>
                <li className="govuk-header__navigation-item">
                  <a className="govuk-header__link" href="#4" title="Podujatia">
                    Podujatia
                  </a>
                </li>
                <li className="govuk-header__navigation-item">
                  <a className="govuk-header__link" href="#5" title="Oznamy">
                    Oznamy
                  </a>
                </li>
                <li className="govuk-header__navigation-item">
                  <a className="govuk-header__link" href="/admin-dashboard" title="Registracia">
                    Registracia Uživateľov
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </header>
      </div>

      {/* BODY */}
      <div className="govuk-main-wrapper govuk-width-container idsk-docs">
        <div className="idsk-docs__wrap">
          <span className="idsk-docs__divider" aria-hidden="true"></span>

          <div className="idsk-docs__row">
            <aside className="idsk-docs__sidenav" aria-label="Navigácia sekcií">
              <ul className="idsk-docs__list govuk-list">
                <li className="idsk-docs__item">
                  <Link className="idsk-docs__link" href="/strava/jedalny-listok" title='Jedálny lístok'>
                    Jedálny lístok
                  </Link>
                </li>
                <li className="idsk-docs__item">
                  <Link className="idsk-docs__link" href="/strava/odhlasovanie" title='Odhlasovanie'>
                    Odhlasovanie
                  </Link>
                </li>
                <li className="idsk-docs__item">
                  <Link className="idsk-docs__link is-active" href="/strava/platby" title='Platby'>
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
