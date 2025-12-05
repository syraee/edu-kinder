import { NextResponse } from "next/server";
import { headers } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET(request: Request) {
    try {
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
            method: "POST",
            headers: { cookie: (await headers()).get("cookie") || "" },
            cache: "no-store",
        });
    } catch {}

    const res = NextResponse.redirect(new URL("/", request.url));

    const cookieOptions = {
        path: "/",
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
    };

    res.cookies.set({
        name: "accessToken",
        value: "",
        ...cookieOptions,
    });

    res.cookies.set({
        name: "refreshToken",
        value: "",
        ...cookieOptions,
    });

    return res;
}
