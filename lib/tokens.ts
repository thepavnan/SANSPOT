// lib/tokens.ts
// Зберігаємо токени прямо в httpOnly cookies — працює на Vercel без БД

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshToken } from "./spotify";

const COOKIE = "sp_tokens";

export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/** Записати токени в cookie (використовуй на response об'єкті) */
export function setTokensCookie(res: NextResponse, tokens: Tokens) {
  const val = Buffer.from(JSON.stringify(tokens)).toString("base64");
  res.cookies.set(COOKIE, val, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

/** Прочитати токени з cookie */
export function readTokens(): Tokens | null {
  const c = cookies().get(COOKIE);
  if (!c) return null;
  try {
    return JSON.parse(Buffer.from(c.value, "base64").toString());
  } catch {
    return null;
  }
}

/** Отримати робочий access_token, автоматично оновити якщо протух */
export async function getAccessToken(): Promise<string | null> {
  const tokens = readTokens();
  if (!tokens) return null;

  // Токен ще живий (1 хв запас)
  if (Date.now() < tokens.expires_at - 60_000) {
    return tokens.access_token;
  }

  // Треба оновити
  try {
    const fresh = await refreshToken(tokens.refresh_token);
    // Зберігаємо оновлені токени — але тут через cookies() напряму
    const updated: Tokens = {
      access_token: fresh.access_token,
      refresh_token: fresh.refresh_token || tokens.refresh_token,
      expires_at: Date.now() + fresh.expires_in * 1000,
    };
    const val = Buffer.from(JSON.stringify(updated)).toString("base64");
    cookies().set(COOKIE, val, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return updated.access_token;
  } catch (err) {
    console.error("Token refresh error:", err);
    return null;
  }
}

/** Видалити cookie (для logout через response) */
export function clearTokensCookie(res: NextResponse) {
  res.cookies.set(COOKIE, "", { maxAge: 0, path: "/" });
  res.cookies.set("sp_session", "", { maxAge: 0, path: "/" });
}
