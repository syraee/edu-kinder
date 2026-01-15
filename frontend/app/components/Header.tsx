/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: number; firstName: string, lastName: string, email: string; role: unknown } | null;
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

  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

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
    return () => { alive = false; };
  }, []);

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", { method: "GET", credentials: "include", cache: "no-store" });
    } finally {
      setUser(null);
      router.replace("/");
      router.refresh();
    }
  }

  const roleText =
    typeof (user as any)?.role === "string"
      ? (user as any).role
      : (user as any)?.role?.name ??
        (user as any)?.role?.code ??
        (user as any)?.role?.type ??
        (user as any)?.role?.id ??
        "";

  const isAuthed = !!user;
  const roleKey = String(roleText || "").toUpperCase();
  const isTeacherOrAdmin = roleKey === "TEACHER" || roleKey === "ADMIN";
  const isAdmin = roleKey === "ADMIN";

  return (
    <div className="govuk-header__wrapper">
      <header className="govuk-header idsk-shadow-head" data-module="govuk-header">
        <div className="govuk-header__container">
          <div className="idsk-secondary-navigation govuk-width-container">
            <div className="idsk-secondary-navigation__header">
              <div className="idsk-secondary-navigation__heading">
                <div className="idsk-secondary-navigation__heading-title"></div>
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
          <div className="govuk-header__btns-search">
            <div className="govuk-header__actionPanel desktop mobile-hidden">
              {loading ? null : !isAuthed ? (
                <Link
                  href="/login"
                        className="govuk-button-prihlasenie govuk-button mobile-hidden"
                  data-module="govuk-button"
                >
                  Prihlásenie
                </Link>
              ) : (
                <>
                  <span className="govuk-body-s" style={{ marginRight: 12 }}>
                    Prihlásený: <b>{[user?.firstName, user?.lastName].filter(Boolean).join(" ")}</b>
                      {roleKey && (
                          <>
                              {" "}(<span style={{ fontWeight: 600 }}>{roleLabelSK(roleKey)}</span>)
                          </>
                      )}
                  </span>

                    <Link
                        href="/chat"
                        className="header-icon-btn"
                        title="Chat"
                        aria-label="Chat"
                        style={{ marginRight: 12, display: "inline-flex", alignItems: "center" }}
                    >
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

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="govuk-button-prihlasenie govuk-button mobile-hidden"
                    data-module="govuk-button"
                  >
                    Odhlásiť sa
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <nav id="navigation" aria-label="Menu" className="govuk-header__navigation govuk-width-container">
          <span className="text">Menu</span>
          <div className="govuk-header__navigation-list">
            <ul>
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
                  {/*<li className="govuk-header__navigation-item">
                    <Link className="govuk-header__link" href="/events" title="Podujatia">
                      Podujatia
                    </Link>
                  </li>
                  <li className="govuk-header__navigation-item">
                    <Link className="govuk-header__link" href="/announcement" title="Oznamy">
                      Oznamy
                    </Link>
                  </li>*/}
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
                        <Link className="govuk-header__link" href="/payment-management/payment-input-meals" title="Platby">
                            Platby
                        </Link>
                    </li>
                </>
              )}
                {isAdmin && (
                    <>
                        <li className="govuk-header__navigation-item">
                            <Link className="govuk-header__link" href="/teachers" title="Učitelia">
                                Učitelia
                            </Link>
                        </li>
                    </>
                )}

            </ul>
          </div>
        </nav>
      </header>
    </div>
  );
}