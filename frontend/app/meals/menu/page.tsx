// app/meals/menu/page.tsx
import Header from "@/app/components/Header";
import MenuDisplay from "@/app/components/MenuDisplay";
import { headers } from "next/headers";
import Link from "next/link";

async function getUserSSR() {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const backend = process.env.BACKEND_URL ?? "http://localhost:5000";

    const r = await fetch(`${backend}/api/auth/me`, {
      method: "GET",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (!r.ok) return null;
    const data = await r.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export default async function MealsMenuPage() {
  const user = await getUserSSR();
  const isAuthed = !!user;

  return (
    <>
      <Header />

      <div className="govuk-main-wrapper govuk-width-container idsk-docs">
        <div className="idsk-docs__wrap">
          <span className="idsk-docs__divider" aria-hidden="true"></span>

          <div className="idsk-docs__row">
            <aside className="idsk-docs__sidenav" aria-label="Navigácia sekcií">
              <ul className="idsk-docs__list govuk-list">
                <li className="idsk-docs__item">
                  <Link className="idsk-docs__link is-active" href="/meals/menu">
                    Jedálny lístok
                  </Link>
                </li>

                <li className="idsk-docs__item">
                  {isAuthed ? (
                    <Link className="idsk-docs__link" href="/meals/meal-cancellation">
                      Odhlasovanie
                    </Link>
                  ) : (
                    <span
                      className="idsk-docs__link"
                      role="link"
                      aria-disabled="true"
                      tabIndex={-1}
                      title="Dostupné len po prihlásení"
                      style={{ pointerEvents: "none", color: "#6f777b", cursor: "not-allowed", textDecoration: "none" }}
                    >
                      Odhlasovanie
                    </span>
                  )}
                </li>

                <li className="idsk-docs__item">
                  {isAuthed ? (
                    <Link className="idsk-docs__link" href="/meals/payments">
                      Platby
                    </Link>
                  ) : (
                    <span
                      className="idsk-docs__link"
                      role="link"
                      aria-disabled="true"
                      tabIndex={-1}
                      title="Dostupné len po prihlásení"
                      style={{ pointerEvents: "none", color: "#6f777b", cursor: "not-allowed", textDecoration: "none" }}
                    >
                      Platby
                    </span>
                  )}
                </li>
              </ul>
            </aside>

            <main className="idsk-docs__content">
              <h1 className="govuk-heading-xl">Jedálny lístok</h1>
              <MenuDisplay
                autoFetch={true}
                sourceUrl="https://www.upjs.sk/materska-skola-upejesko/stravovanie/"
              />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
