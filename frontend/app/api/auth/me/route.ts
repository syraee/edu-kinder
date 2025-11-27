
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET() {
  try {
    const cookie = (await headers()).get("cookie") || "";
    const r = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: "GET",
      headers: { cookie },
      credentials: "include",
      cache: "no-store",
    });
    const data = await r.json();
    const response = NextResponse.json(data, { status: r.status });

    const setCookie = r.headers.get("set-cookie");
    if (setCookie) {
        response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (e) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
