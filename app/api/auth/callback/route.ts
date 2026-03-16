// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getProfile } from "@/lib/spotify";
import { setTokensCookie, type Tokens } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL(`/?error=${error || "no_code"}`, req.url));
  }

  try {
    const data = await exchangeCode(code);
    const profile = await getProfile(data.access_token);

    const tokens: Tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };

    // Створюємо redirect response
    const res = NextResponse.redirect(new URL("/dashboard", req.url));

    // Ставимо обидва cookies прямо на response
    setTokensCookie(res, tokens);
    res.cookies.set("sp_session", Buffer.from(JSON.stringify({
      userId: profile.id,
      name: profile.display_name,
    })).toString("base64"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Auth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}
