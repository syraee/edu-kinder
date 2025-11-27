import { NextResponse } from "next/server";
import { headers } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET(request: Request) {
  try {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: { cookie: (await headers()).get("cookie") || "" },
      credentials: "include",
      cache: "no-store",
    });
  } catch {}

  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set({
    name: "accessToken",
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return res;
}
