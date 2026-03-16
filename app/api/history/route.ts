// app/api/history/route.ts
import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/tokens";
import { getRecentlyPlayed } from "@/lib/spotify";

export const dynamic = "force-dynamic";

interface TrackItem {
  track_id: string;
  track_name: string;
  artist_name: string;
  artist_id: string;
  album_name: string;
  album_image: string;
  duration_ms: number;
  played_at: string;
}

export async function GET() {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await getRecentlyPlayed(token, 50);
    if (!data?.items?.length) {
      return NextResponse.json({
        items: [],
        total: 0,
        stats: { totalTracks: 0, totalMinutes: 0, uniqueArtists: 0, uniqueTracks: 0, topArtists: [], topTracks: [] },
      });
    }

    // Маппимо треки
    const items: TrackItem[] = data.items.map((item: any) => ({
      track_id: item.track.id,
      track_name: item.track.name,
      artist_name: item.track.artists.map((a: any) => a.name).join(", "),
      artist_id: item.track.artists[0]?.id || "",
      album_name: item.track.album.name,
      album_image: item.track.album.images?.[0]?.url || item.track.album.images?.[1]?.url || "",
      duration_ms: item.track.duration_ms,
      played_at: item.played_at,
    }));

    // Рахуємо статистику
    const artists: Record<string, { name: string; count: number; image: string }> = {};
    const tracks: Record<string, { name: string; artist: string; count: number; image: string }> = {};
    let totalMs = 0;

    for (const t of items) {
      totalMs += t.duration_ms;

      if (!artists[t.artist_id]) artists[t.artist_id] = { name: t.artist_name, count: 0, image: t.album_image };
      artists[t.artist_id].count++;

      if (!tracks[t.track_id]) tracks[t.track_id] = { name: t.track_name, artist: t.artist_name, count: 0, image: t.album_image };
      tracks[t.track_id].count++;
    }

    return NextResponse.json({
      items,
      total: items.length,
      stats: {
        totalTracks: items.length,
        totalMinutes: Math.round(totalMs / 60_000),
        uniqueArtists: Object.keys(artists).length,
        uniqueTracks: Object.keys(tracks).length,
        topArtists: Object.values(artists).sort((a, b) => b.count - a.count).slice(0, 10),
        topTracks: Object.values(tracks).sort((a, b) => b.count - a.count).slice(0, 10),
      },
    });
  } catch (err) {
    console.error("History error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
