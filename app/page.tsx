export default function Home() {
  return (
<div className="govuk-header__wrapper">
  <header className="govuk-header idsk-shadow-head" data-module="govuk-header">
    <div className="govuk-header__container ">
      <div className="idsk-secondary-navigation govuk-width-container">
        <div className="idsk-secondary-navigation__header">
          <div className="idsk-secondary-navigation__heading">
            <div className="idsk-secondary-navigation__heading-title">
              <span className="idsk-secondary-navigation__heading-mobile">SK</span>
              <span className="idsk-secondary-navigation__heading-desktop">Oficiálna stránka</span>

              <button
                className="govuk-button govuk-button--texted--inverse idsk-secondary-navigation__heading-button"
                aria-expanded="false"
                aria-label="Oficiálna stránka verejnej správy"
              >
                <span className="idsk-secondary-navigation__heading-mobile">e-Gov</span>
                <span className="idsk-secondary-navigation__heading-desktop"><b>verejnej správy</b></span>
                <span className="material-icons">arrow_drop_down</span>
              </button>
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
        <a
          href="/"
          className="govuk-header__link govuk-header__link--homepage"
          title="Odkaz na titulnú stránku"
        >
          <img
            src="/idsk-assets/images/logo-moje.png"
            alt="Logo Škôlky s odkazom na titulnú stránku"
          />
        </a>
      </div>

      <div className="govuk-header__btns-search">
        <div className="govuk-header__mobile-menu desktop-hidden">
          <button
            type="button"
            className="govuk-header__menu-button font-bold govuk-js-header-toggle"
            aria-controls="navigation"
            hidden
          >
            Menu
          </button>
        </div>

        <div className="idsk-searchbar__wrapper" role="search">
          <input
            className="govuk-input"
            type="search"
            placeholder="Zadajte hľadaný výraz"
            title="Zadajte hľadaný výraz"
            name="search"
          />
          <button className="govuk-button govuk-button__basic" aria-label="Hľadať">
            <span className="material-icons" aria-hidden="true">search</span>
          </button>
        </div>

        <button className="govuk-button govuk-button__basic mobile-hidden">Prihlásiť</button>
        <button className="govuk-button govuk-button__basic mobile-hidden">Registrovať</button>
      </div>
    </div>

    <nav id="navigation" aria-label="Menu" className="govuk-header__navigation govuk-width-container">
      <span className="text">Menu</span>

      <div className="govuk-header__navigation-list">
        <ul>
          <li
            className="govuk-header__navigation-item govuk-header__navigation-item--active"
            aria-current="page"
          >
            <a className="govuk-header__link" href="#1" title="67 ">
              Strava
            </a>
          </li>

          <li className="govuk-header__navigation-item">
            <a className="govuk-header__link" href="#2" title="67 ">
              Fotogaléria
            </a>
          </li>

          <li className="govuk-header__navigation-item">
            <a className="govuk-header__link" href="#3" title="67 ">
              Dochádzka
            </a>
          </li>

          <li className="govuk-header__navigation-item">
            <a className="govuk-header__link" href="#4" title="67 ">
              Podujatia
            </a>
          </li>

          <li className="govuk-header__navigation-item">
            <a className="govuk-header__link" href="#5" title="67 ">
              Oznamy
            </a>
          </li>

          <li className="govuk-header__navigation-item">
            <div className="idsk-dropdown__wrapper jano" data-pseudolabel="položky">
              <a
                role="button"
                href="#"
                className="govuk-button govuk-button--texted idsk-dropdown"
                aria-label="Rozbaliť položky"
                aria-haspopup="listbox"
              >
                <span>Rozbaľovacia sekcia al la la</span>
                <span className="material-icons" aria-hidden="true">keyboard_arrow_down</span>
              </a>
              <ul className="idsk-dropdown__options idsk-shadow-medium">
                <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="Podsekcia 1">
                  <a href="#" lang="sk">Podsekcia 1</a>
                </li>
                <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="Podsekcia 2">
                  <a href="#" lang="sk">Podsekcia 2</a>
                </li>
                <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="Podsekcia 3">
                  <a href="#" lang="sk">Podsekcia 3</a>
                </li>
              </ul>
            </div>
          </li>

          <li className="govuk-header__navigation-item govuk-header__navigation-item--active">
            <div className="idsk-dropdown__wrapper jano2" data-pseudolabel="položky">
              <a
                role="button"
                href="#"
                className="govuk-button govuk-button--texted idsk-dropdown"
                aria-label="Rozbaliť položky"
                aria-haspopup="listbox"
              >
                <span>Rozbaľovacia sekcia</span>
                <span className="material-icons" aria-hidden="true">keyboard_arrow_down</span>
              </a>
              <ul className="idsk-dropdown__options idsk-shadow-medium">
                <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="Podsekcia 1">
                  <a href="#" lang="sk">Podsekcia 1</a>
                </li>
                <li
                  className="idsk-dropdown__option idsk-pseudolabel__wrapper active"
                  data-pseudolabel="Podsekcia 2"
                >
                  <a href="#" lang="sk">Podsekcia 2</a>
                </li>
                <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="Podsekcia 3">
                  <a href="#" lang="sk">Podsekcia 3</a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      <div className="btnWrapper desktop-hidden">
        <button className="govuk-button govuk-button__basic">Tlačidlo1</button>
        <button className="govuk-button govuk-button__basic">Tlačidlo2</button>
      </div>
    </nav>
  </header>
</div>

        
  )
}
