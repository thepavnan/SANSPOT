// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearTokensCookie } from "@/lib/tokens";

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url));
  clearTokensCookie(res);
  return res;
}
