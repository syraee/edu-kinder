"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: unknown;
} | null;

function roleLabelSK(roleKey: string): string {
  switch (roleKey) {
    case "ADMIN":
      return "Administrátor";
    case "TEACHER":
      return "Učiteľ";
    case "PARENT":
      return "Rodič";
    default:
      return roleKey ? roleKey : "";
  }
}


export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const data = r.ok ? await r.json() : { user: null };
        if (alive) setUser(data?.user ?? null);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // zavri mobile menu po zmene stránky
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      setUser(null);
      setNavOpen(false);
      router.replace("/");
      router.refresh();
    }
  }

  const roleText = useMemo(() => {
    return typeof (user as any)?.role === "string"
      ? (user as any).role
      : (user as any)?.role?.name ??
      (user as any)?.role?.code ??
      (user as any)?.role?.type ??
      (user as any)?.role?.id ??
      "";
  }, [user]);

  const isAuthed = !!user;
  const roleKey = String(roleText || "").toUpperCase();
  const isTeacherOrAdmin = roleKey === "TEACHER" || roleKey === "ADMIN";
  const isAdmin = roleKey === "ADMIN";

  return (
    <div className="govuk-header__wrapper">
      <header className="govuk-header idsk-shadow-head header-root" data-module="govuk-header">
        {/* horný secondary bar */}
        <div className="govuk-header__container">
          <div className="idsk-secondary-navigation govuk-width-container">
            <div className="idsk-secondary-navigation__header">
              <div className="idsk-secondary-navigation__heading">
                <div className="idsk-secondary-navigation__heading-title" />
              </div>
            </div>
          </div>
        </div>

        {/*  logo + desktop actions + hamburger (mobile) */}
        <div className="govuk-predheader govuk-width-container header-top">
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

          {/* desktop actions */}
          <div className="govuk-header__btns-search header-actions desktop mobile-hidden">
            <div className="govuk-header__actionPanel">
              {loading ? null : !isAuthed ? (
                <Link
                  href="/login"
                  className="govuk-button-prihlasenie govuk-button"
                  data-module="govuk-button"
                >
                  Prihlásenie
                </Link>
              ) : (
                <>
                  <span className="govuk-body-s" style={{ marginRight: 12 }}>
                    Prihlásený:{" "}
                    <b>{[user?.firstName, user?.lastName].filter(Boolean).join(" ")}</b>
                    {roleKey && (
                      <>
                        {" "}
                        (<span style={{ fontWeight: 600 }}>{roleLabelSK(roleKey)}</span>)
                      </>
                    )}
                  </span>

                  <Link href="/chat" className="header-chat-icon" aria-label="Chat" title="Chat">
                    <svg
                      className="header-chat-icon__svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M20 14c0 1.1-.9 2-2 2H9l-4 4V6c0-1.1.9-2 2-2h11c1.1 0 2 .9 2 2v8z"
                        stroke="var(--chat-icon-color)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>


                  <button
                    type="button"
                    onClick={handleLogout}
                    className="govuk-button-prihlasenie govuk-button"
                    data-module="govuk-button"
                  >
                    Odhlásiť sa
                  </button>
                </>
              )}
            </div>
          </div>

         
          <button
            type="button"
            className="header-hamburger"
            aria-controls="navigation"
            aria-expanded={navOpen ? "true" : "false"}
            aria-label={navOpen ? "Zavrieť menu" : "Otvoriť menu"}
            onClick={() => setNavOpen((v) => !v)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        
        <div className="govuk-width-container header-navwrap">
          <nav
            id="navigation"
            aria-label="Menu"
            className={[
              "govuk-header__navigation",
              navOpen ? "govuk-header__navigation--open header-nav-open" : "",
            ].join(" ")}
          >
            <ul className="govuk-header__navigation-list">
              <li className="govuk-header__navigation-item">
                <Link className="govuk-header__link" href="/meals/menu" title="Strava">
                  Strava
                </Link>
              </li>

              {isAuthed && (
                <>
                  <li className="govuk-header__navigation-item">
                    <Link className="govuk-header__link" href="/gallery" title="Fotogaléria">
                      Fotogaléria
                    </Link>
                  </li>
                  <li className="govuk-header__navigation-item">
                    <Link className="govuk-header__link" href="/attendance" title="Dochádzka">
                      Dochádzka
                    </Link>
                  </li>
                </>
              )}

              {isTeacherOrAdmin && (
                <>
                  <li className="govuk-header__navigation-item">
                    <Link className="govuk-header__link" href="/kids" title="Deti">
                      Triedy
                    </Link>
                  </li>
                  <li className="govuk-header__navigation-item">
                    <Link className="govuk-header__link" href="/parents" title="Rodičia">
                      Rodičia
                    </Link>
                  </li>
                  <li className="govuk-header__navigation-item">
                    <Link
                      className="govuk-header__link"
                      href="/payment-management/payment-input-meals"
                      title="Platby"
                    >
                      Platby
                    </Link>
                  </li>
                </>
              )}

              {isAdmin && (
                <li className="govuk-header__navigation-item">
                  <Link className="govuk-header__link" href="/teachers" title="Učitelia">
                    Učitelia
                  </Link>
                </li>
              )}

              {/* mobile-only actions v menu */}
              {!loading && (
                <li className="govuk-header__navigation-item header-mobile-only">
                  {isAuthed ? (
                    <div className="header-mobile-card">
                      <div className="header-mobile-userline">
                        Prihlásený:{" "}
                        <b>{[user?.firstName, user?.lastName].filter(Boolean).join(" ")}</b>
                        {roleKey && (
                          <>
                            {" "}
                            (<span className="header-mobile-role">{roleLabelSK(roleKey)}</span>)
                          </>
                        )}
                      </div>

                      <div className="header-mobile-actions2">
                        <Link href="/chat" className="header-chat-icon" aria-label="Chat" title="Chat">
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M20 14c0 1.1-.9 2-2 2H9l-4 4V6c0-1.1.9-2 2-2h11c1.1 0 2 .9 2 2v8z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>

                        <button type="button" onClick={handleLogout} className="header-logout-btn">
                          Odhlásiť sa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="header-mobile-card">
                      <Link href="/login" className="header-mobile-cta">
                        Prihlásenie
                      </Link>
                    </div>
                  )}
                </li>
              )}

            </ul>
          </nav>
        </div>
      </header>

      <style jsx global>{`

  .header-hamburger {
    display: none;
  }

  
  .header-mobile-only {
    display: none;
  }

 
  @media (max-width: 48em) {
    /* Top row: logo left, hamburger right */
    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

   
    .header-hamburger {
      display: inline-flex;
      margin-left: auto;
      width: 44px;
      height: 44px;
      border-radius: 10px;
      border: 2px solid #ffdd00;
      background: #ffffff;
      color: #072c66;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .header-hamburger:focus {
      outline: 3px solid #ffdd00;
      outline-offset: 2px;
    }

  
    .header-actions {
      display: none !important;
    }

  
    .header-navwrap {
      position: relative;
    }

 
    .govuk-header__navigation {
      display: none;
    }

 
    .govuk-header__navigation.header-nav-open,
    .govuk-header__navigation.govuk-header__navigation--open {
      display: block;
      background: #ffffff;
      border-top: 1px solid #d8dde0;
      padding: 8px 0;
    }


    .govuk-header__navigation-list {
      margin: 0;
      padding: 0;
    }

    .govuk-header__navigation-item {
      margin: 0;
    }


    .govuk-header__navigation .govuk-header__link {
      color: #0b0c0c;
      display: block;
      padding: 10px 0;
      font-size: 17px;
      line-height: 1.25;
      text-decoration: none;
    }
    .govuk-header__navigation .govuk-header__link:hover {
      text-decoration: underline;
    }

  
    .header-mobile-only {
      display: block;
      border-top: 1px solid #d8dde0;
      margin-top: 10px;
      padding-top: 12px;
    }

    .header-mobile-card {
      background: #f3f2f1;
      border: 1px solid #d8dde0;
      border-radius: 10px;
      padding: 12px;
    }

    .header-mobile-userline {
      margin: 0;
      font-size: 13px;
      line-height: 1.35;
      color: #0b0c0c;
    }

    .header-mobile-role {
      font-weight: 700;
    }

    /* login CTA v karte */
    .header-mobile-cta {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 42px;
      border-radius: 10px;
      background: #072c66;
      color: #fff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
    }
    .header-mobile-cta:focus {
      outline: 3px solid #ffdd00;
      outline-offset: 2px;
    }

    
  .header-mobile-actions2 {
  display: grid;
  grid-template-columns: 44px 1fr;
  grid-auto-rows: 44px;    
  gap: 10px;
  margin-top: 10px;
  align-items: center;
}

.header-chat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid #99b3d0;
  background: #ffffff;

  /* flex je tu najspoľahlivejší */
  display: flex;
  align-items: center;
  justify-content: center;

  text-decoration: none;
  line-height: 0;
  padding: 0;
}



.header-chat-icon svg {
  display: block;
}

.header-chat-icon svg path {
  stroke: #072c66 !important;
}

@media (max-width: 48em) {
  a.header-chat-icon {
    padding: 10px 5px;
  }
}


    .header-chat-icon:focus {
      outline: 3px solid #ffdd00;
      outline-offset: 2px;
    }

    .header-logout-btn {
      height: 44px;
      border-radius: 10px;
      border: 0;
      background: #072c66;
      color: #ffffff;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
    }
    .header-logout-btn:hover {
      filter: brightness(0.95);
    }
    .header-logout-btn:focus {
      outline: 3px solid #ffdd00;
      outline-offset: 2px;
    }
  }
`}</style>

    </div>
  );
}
