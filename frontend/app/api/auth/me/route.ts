
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
    if (!r.ok) return NextResponse.json({ user: null }, { status: r.status });
    const data = await r.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
