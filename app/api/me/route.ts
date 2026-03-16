// app/api/me/route.ts
import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/tokens";
import { getProfile } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const p = await getProfile(token);
    return NextResponse.json({
      id: p.id,
      name: p.display_name,
      image: p.images?.[0]?.url || p.images?.[1]?.url || null,
      product: p.product,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
