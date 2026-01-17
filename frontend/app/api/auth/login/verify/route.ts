import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // zavolaj backend verify (Render) - ten nastaví cookies v headers
  const r = await fetch(`${BACKEND_URL}/api/auth/login/verify?token=${encodeURIComponent(token)}`, {
    method: "GET",
    cache: "no-store",
    redirect: "manual",
  });

  const response = NextResponse.redirect(new URL("/", req.url));

  // prekopíruj všetky Set-Cookie (môže ich byť viac)
  const setCookies = r.headers.getSetCookie?.() as string[] | undefined;

  if (setCookies?.length) {
    for (const c of setCookies) response.headers.append("set-cookie", c);
  } else {
    const single = r.headers.get("set-cookie");
    if (single) response.headers.set("set-cookie", single);
  }

  return response;
}
