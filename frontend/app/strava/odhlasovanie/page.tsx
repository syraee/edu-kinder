"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CourseKey = "snack_am" | "lunch" | "snack_pm" | "full_day";
type Meals = Record<CourseKey, boolean>;
type Child = { id: string; name: string };

const WEEKDAYS = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok"];
const MONTHS_SK = [
  "Január", "Február", "Marec", "Apríl", "Máj", "Jún",
  "Júl", "August", "September", "Október", "November", "December"
];
const COURSES: { key: CourseKey; label: string }[] = [
  { key: "snack_am", label: "Desiata" },
  { key: "lunch",    label: "Obed"    },
  { key: "snack_pm", label: "Olovrant"},
  { key: "full_day", label: "Celý deň"},
];

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isToday = (d: Date) => {
  const t = new Date();
  return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth() && t.getDate() === d.getDate();
};

function buildWeeks(y: number, m: number) {
  type Cell = { date: Date; outside: boolean };
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);

  const weeks: (Cell | null)[][] = [];
  let week: (Cell | null)[] = [null, null, null, null, null];

  const firstWeekday = ((first.getDay() + 6) % 7) + 1;
  if (firstWeekday > 1 && firstWeekday <= 6) {
    const d = new Date(first);
    d.setDate(d.getDate() - (firstWeekday - 1));
    for (let wd = 1; wd < firstWeekday; wd++) {
      if (wd <= 5) week[wd - 1] = { date: new Date(d), outside: true };
      d.setDate(d.getDate() + 1);
    }
  }
  for (let day = 1; day <= last.getDate(); day++) {
    const d = new Date(y, m, day);
    const wd = ((d.getDay() + 6) % 7) + 1;
    if (wd >= 6) continue;
    week[wd - 1] = { date: d, outside: false };
    if (wd === 5) {
      weeks.push(week);
      week = [null, null, null, null, null];
    }
  }
  if (week.some(Boolean)) {
    const d = new Date(y, m + 1, 1);
    for (let i = 0; i < 5; i++) {
      if (!week[i]) {
        while (true) {
          const wd = ((d.getDay() + 6) % 7) + 1;
          if (wd <= 5) {
            week[i] = { date: new Date(d), outside: true };
            d.setDate(d.getDate() + 1);
            break;
          }
          d.setDate(d.getDate() + 1);
        }
      }
    }
    weeks.push(week);
  }
  return weeks as { date: Date; outside: boolean }[][];
}

const allTrue = (): Meals => ({ snack_am: true, lunch: true, snack_pm: true, full_day: true });
const cloneMeals = (m?: Meals): Meals => (m ? { ...m } : allTrue());

function dayLevel(meals: Meals) {
  const count = Number(meals.snack_am) + Number(meals.lunch) + Number(meals.snack_pm);
  if (count === 0) return "NONE";
  if (count === 3) return "ALL";
  return "SOME";
}

function Attendance() {
  const children: Child[] = [
    { id: "jan", name: "Ján" },
    { id: "eva", name: "Eva" },
  ];

  const now = new Date();
  const [ym, setYM] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [child, setChild] = useState(children[0].id);

  const [data, setData] = useState<Record<string, Record<string, Meals>>>({
    jan: {
      "2025-10-02": { snack_am: true, lunch: true, snack_pm: false, full_day: false },
      "2025-10-03": { snack_am: false, lunch: false, snack_pm: false, full_day: false },
    },
    eva: { "2025-10-03": { snack_am: false, lunch: true, snack_pm: false, full_day: false } },
  });

  const [dialog, setDialog] = useState<{
    open: boolean;
    date: Date | null;
    edit: Record<string, Meals> | null;
  }>({ open: false, date: null, edit: null });

  const openDialog = (d: Date) => {
    const key = keyOf(d);
    const edit: Record<string, Meals> = {};
    for (const c of children) edit[c.id] = cloneMeals(data[c.id]?.[key]);
    setDialog({ open: true, date: d, edit });
  };
  const closeDialog = () => setDialog({ open: false, date: null, edit: null });

  const saveDialog = () => {
    if (!dialog.date || !dialog.edit) return;
    const key = keyOf(dialog.date);
    setData((prev) => {
      const out = { ...prev };
      for (const c of children) out[c.id] = { ...(out[c.id] ?? {}), [key]: cloneMeals(dialog.edit![c.id]) };
      return out;
    });
    closeDialog();
  };

  const onToggle = (cid: string, ck: CourseKey, v: boolean) => {
    if (!dialog.edit) return;
    const next = { ...dialog.edit };
    const cur = { ...next[cid] };
    if (ck === "full_day") {
      cur.full_day = v;
      cur.snack_am = v;
      cur.lunch = v;
      cur.snack_pm = v;
    } else {
      cur[ck] = v;
      cur.full_day = cur.snack_am && cur.lunch && cur.snack_pm;
    }
    next[cid] = cur;
    setDialog({ ...dialog, edit: next });
  };

  const weeks = useMemo(() => buildWeeks(ym.y, ym.m), [ym]);
  const monthLabel = `${MONTHS_SK[ym.m]} ${ym.y}`;
  const prevMonth = () => setYM((p) => (p.m === 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m: p.m - 1 }));
  const nextMonth = () => setYM((p) => (p.m === 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m: p.m + 1 }));

  return (
    <main className="idsk-docs__content attendance">
      <h1 className="govuk-heading-xl">Odhlasovanie</h1>
      <div className="topbar">
        <div className="child-switch">
          {children.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`govuk-button govuk-button--secondary pill ${child === c.id ? "is-active" : ""}`}
              onClick={() => setChild(c.id)}
              aria-pressed={child === c.id}
            >
              <span className="material-icons" aria-hidden>
                person
              </span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        <div className="month-nav">
          <button
            type="button"
            className="govuk-button govuk-button--secondary btn-icon"
            onClick={prevMonth}
            aria-label="Predchádzajúci mesiac"
          >
            ‹
          </button>
          <strong className="month-label">{monthLabel}</strong>
          <button
            type="button"
            className="govuk-button govuk-button--secondary btn-icon"
            onClick={nextMonth}
            aria-label="Ďalší mesiac"
          >
            ›
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="weekday-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="weekday">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="calendar-grid">
        {weeks.flat().map((cell, idx) => {
          if (!cell) return <div key={idx} />;
          const { date, outside } = cell;
          const k = keyOf(date);
          const meals = data[child]?.[k] ?? allTrue();
          const level = dayLevel(meals);

          const classes = [
            "day-card",
            outside ? "is-outside" : "",
            level === "ALL" ? "is-all" : "",
            level === "SOME" ? "is-some" : "",
            level === "NONE" ? "is-none" : "",
            isToday(date) ? "is-today" : "",
          ].join(" ");

          return (
            <button
              key={k}
              type="button"
              className={classes}
              onClick={() => openDialog(date)}
              aria-label={`${date.getDate()}. ${MONTHS_SK[date.getMonth()]} ${date.getFullYear()}`}
            >
              <div className="day-number">{date.getDate()}</div>
              <div className="day-status">
                {level === "NONE" ? "Odhlásený" : level === "ALL" ? "Prihlásený" : "Čiastočne"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dialog */}
      {dialog.open && dialog.date && dialog.edit && (
        <div className="attendance-modal" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
          <div className="modal-backdrop" onClick={closeDialog} />
          <div className="modal-card">
            <div className="modal-header">
              <h2 id="dlg-title" className="govuk-heading-l">
                {`${WEEKDAYS[(dialog.date.getDay() + 6) % 7]}, ${dialog.date.getDate()}. ${
                  MONTHS_SK[dialog.date.getMonth()]
                }`}
              </h2>
              <button type="button" className="btn-icon close" aria-label="Zavrieť" onClick={closeDialog}>
                ×
              </button>
            </div>

            <div className="meal-grid">
              <div className="g-empty" />
              {COURSES.map((c) => (
                <div key={c.key} className="g-head">
                  {c.label}
                </div>
              ))}

              {children.map((c) => {
                const row = dialog.edit![c.id];
                return (
                  <div className="g-row" key={c.id}>
                    <div className="g-name">{c.name}</div>

                    {COURSES.map((course) => {
                      const checked = row[course.key];
                      return (
                        <label key={course.key} className="tick">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => onToggle(c.id, course.key, e.target.checked)}
                          />
                          <span aria-hidden="true" />
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button type="button" className="govuk-button govuk-button--secondary" onClick={closeDialog}>
                Zrušiť
              </button>
              <button type="button" className="govuk-button" onClick={saveDialog}>
                Uložiť
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

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
                        <h3 className="govuk-body-s">
                          <b>Doména gov.sk je oficiálna</b>
                        </h3>
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
                        <h3 className="govuk-body-s">
                          <b>Táto stránka je zabezpečená</b>
                        </h3>
                        <p className="govuk-body-s max-width77-desktop">
                          Buďte pozorní a vždy sa uistite, že zdieľate informácie iba cez zabezpečenú webovú stránku
                          verejnej správy SR. Zabezpečená stránka vždy začína https:// pred názvom domény webového
                          sídla.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="idsk-dropdown__wrapper idsk-secondary-navigation__dropdown" data-pseudolabel="jazykové menu">
                  <button
                    className="govuk-button govuk-button--texted--inverse idsk-secondary-navigation__heading-button idsk-dropdown"
                    aria-label="Rozbaliť jazykové menu"
                    aria-haspopup="listbox"
                  >
                    <span>slovenčina</span>
                    <span className="material-icons" aria-hidden="true">
                      arrow_drop_down
                    </span>
                  </button>
                  <ul className="idsk-dropdown__options idsk-shadow-medium">
                    <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="eng">
                      <a href="#" lang="en">
                        eng
                      </a>
                    </li>
                    <li className="idsk-dropdown__option idsk-pseudolabel__wrapper " data-pseudolabel="slo">
                      <a href="#" lang="sk">
                        slo
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="govuk-predheader govuk-width-container">
            <div className="govuk-header__logo">
              <Link href="/" className="govuk-header__link govuk-header__link--homepage" title="Odkaz na titulnú stránku">
                <img src="/idsk-assets/images/logo_upejesko.jpg" alt="Logo Škôlky s odkazom na titulnú stránku" />
              </Link>
            </div>

            <div className="govuk-header__btns-search">
              <div className="govuk-header__mobile-menu desktop-hidden">
                <button type="button" className="govuk-header__menu-button font-bold govuk-js-header-toggle" aria-controls="navigation" hidden>
                  Menu
                </button>
                <div className="govuk-header__actionPanel mobile desktop-hidden">
                  <button className="govuk-button" title="Notifikácie">
                    <span role="button" className="material-icons" aria-hidden="true">
                      notifications
                    </span>
                  </button>
                  <button className="govuk-button" title="Informácie o portáli">
                    <span role="button" className="material-icons" aria-hidden="true">
                      info
                    </span>
                  </button>
                </div>
              </div>

              <div className="idsk-searchbar__wrapper" role="search">
                <input className="govuk-input" type="search" placeholder="Zadajte hľadaný výraz" title="Zadajte hľadaný výraz" name="search" />
                <button className="govuk-button govuk-button__basic" aria-label="Hľadať">
                  <span className="material-icons" aria-hidden="true">
                    search
                  </span>
                </button>
              </div>
              <div className="govuk-header__actionPanel desktop mobile-hidden">
                <button className="govuk-button" title="Notifikácie">
                  <span role="button" className="material-icons" aria-hidden="true">
                    notifications
                  </span>
                </button>
                <button className="govuk-button" title="Informácie o portáli">
                  <span role="button" className="material-icons" aria-hidden="true">
                    info
                  </span>
                </button>
                <button className="govuk-button govuk-header__profile_button" title="Profil">
                  MM
                </button>
              </div>
            </div>
          </div>

          <nav id="navigation" aria-label="Menu" className="govuk-header__navigation govuk-width-container">
            <dialog id="navigationProfileDialog">
              <div className="govuk-header__profile">
                <div className="govuk-header__profile__header mobile-hidden">
                  <div className="govuk-heading-m">Profil</div>
                  <button className="govuk-button govuk-button--texted govuk-header__profile_close_button">
                    <span className="material-icons">close</span>
                  </button>
                </div>
                <div className="govuk-header__profile__body">
                  <img className="profile" src="https://placehold.co/100x100/072C66/FFFFFF?text=JH" alt="Profile" />
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
                <li className="govuk-header__navigation-item govuk-header__navigation-item--active" aria-current="page">
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
                  <Link className="idsk-docs__link" href="/strava/jedalny-listok" title="Jedálny lístok">
                    Jedálny lístok
                  </Link>
                </li>
                <li className="idsk-docs__item">
                  <Link className="idsk-docs__link is-active" href="/strava/odhlasovanie" title="Odhlasovanie">
                    Odhlasovanie
                  </Link>
                </li>
                <li className="idsk-docs__item">
                  <Link className="idsk-docs__link" href="/strava/platby" title="Platby">
                    Platby
                  </Link>
                </li>
              </ul>
            </aside>

            {/* Calendar */}
            <Attendance />
          </div>
        </div>
      </div>
    </>
  );
}
