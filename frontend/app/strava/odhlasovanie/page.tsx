import Link from "next/link";

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
                  <Link className="idsk-docs__link is-active" href="/strava/odhlasovanie" title='Odhlasovanie'>
                    Odhlasovanie
                  </Link>
                </li>
                <li className="idsk-docs__item">
                  <Link className="idsk-docs__link" href="/strava/platby" title='Platby'>
                    Platby
                  </Link>
              </li>
            </ul>
            </aside>
            <main className="idsk-docs__content">
              <h1 className="govuk-heading-xl">Odhlasovanie
              </h1>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
