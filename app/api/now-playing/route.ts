// app/api/now-playing/route.ts
import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/tokens";
import { getNowPlaying } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await getNowPlaying(token);
    if (!data?.item) return NextResponse.json({ playing: false });

    return NextResponse.json({
      playing: data.is_playing,
      track: {
        id: data.item.id,
        name: data.item.name,
        artist: data.item.artists.map((a: any) => a.name).join(", "),
        album: data.item.album.name,
        image: data.item.album.images?.[0]?.url || "",
        progress_ms: data.progress_ms,
        duration_ms: data.item.duration_ms,
      },
    });
  } catch {
    return NextResponse.json({ playing: false });
  }
}
