import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function roleText(role: unknown): string {
  if (typeof role === "string") return role;
  const r = role as any;
  return (r?.name ?? r?.code ?? r?.type ?? r?.id ?? "").toString();
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const adminOnly      = /^\/admin(\/.*)?$/i.test(pathname);
  const teacherOrAdmin = /^\/(teacher|kids|parents)(\/.*)?$/i.test(pathname);
  const authedOnly =
    /^\/(gallery|dochadzka|podujatia|oznamy)(\/.*)?$/i.test(pathname) ||
    /^\/meals\/(meal-cancellation|payments)$/i.test(pathname);
  const loginPage = /^\/login\/?$/i.test(pathname);

  if (!(adminOnly || teacherOrAdmin || authedOnly || loginPage)) {
    return NextResponse.next();
  }

  const url = new URL("/api/auth/me", req.url);
  const r = await fetch(url.toString(), {
    headers: { cookie: req.headers.get("cookie") || "" },
    cache: "no-store",
  }).catch(() => null);

  const data = r && r.ok ? await r.json() : { user: null };
  const user = data?.user ?? null;
  const isAuthed = !!user;
  const roleKey = roleText(user?.role).toUpperCase();

  if (loginPage && isAuthed) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (authedOnly && !isAuthed) {
    const to = new URL("/login", req.url);
    to.searchParams.set("next", pathname);
    return NextResponse.redirect(to);
  }

  if (teacherOrAdmin) {
    if (!isAuthed) {
      const to = new URL("/login", req.url);
      to.searchParams.set("next", pathname);
      return NextResponse.redirect(to);
    }
    if (!(roleKey === "TEACHER" || roleKey === "ADMIN")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (adminOnly) {
    if (!isAuthed) {
      const to = new URL("/login", req.url);
      to.searchParams.set("next", pathname);
      return NextResponse.redirect(to);
    }
    if (roleKey !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/teacher/:path*",
    "/kids/:path*",
    "/parents/:path*",
    "/gallery/:path*",
    "/dochadzka/:path*",
    "/podujatia/:path*",
    "/oznamy/:path*",
    "/meals/meal-cancellation",
    "/meals/payments",
  ],
};
