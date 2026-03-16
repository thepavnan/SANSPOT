// app/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

function SpotifyLogo({ s = 26 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="#1DB954">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function RefreshSvg() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  );
}

function SearchSvg() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ClearSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

interface Profile { id: string; name: string; image: string | null; product: string }
interface NowPlaying { playing: boolean; track?: { id: string; name: string; artist: string; album: string; image: string; progress_ms: number; duration_ms: number } }
interface HistoryItem { track_id: string; track_name: string; artist_name: string; album_name: string; album_image: string; duration_ms: number; played_at: string }
interface Stats { totalTracks: number; totalMinutes: number; uniqueArtists: number; uniqueTracks: number; topArtists: { name: string; count: number; image: string }[]; topTracks: { name: string; artist: string; count: number; image: string }[] }

function dur(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ago(d: string) {
  const df = Date.now() - new Date(d).getTime();
  const m = Math.floor(df / 60000);
  if (m < 1) return "щойно";
  if (m < 60) return `${m} хв`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} год`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} дн`;
  return new Date(d).toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [np, setNp] = useState<NowPlaying | null>(null);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [spin, setSpin] = useState(false);
  const [tab, setTab] = useState<"history" | "artists" | "tracks">("history");
  const [query, setQuery] = useState("");

  const load = useCallback(async (ref = false) => {
    if (ref) setSpin(true);
    try {
      const [p, h, n] = await Promise.all([
        fetch("/api/me"), fetch("/api/history"), fetch("/api/now-playing"),
      ]);
      if (p.status === 401 || h.status === 401) { router.push("/"); return; }
      const [pd, hd, nd] = await Promise.all([p.json(), h.json(), n.json()]);
      setProfile(pd);
      setItems(hd.items || []);
      setStats(hd.stats || null);
      setNp(nd);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setSpin(false); }
  }, [router]);

  useEffect(() => {
    load();
    const id = setInterval(() => load(), 30000);
    return () => clearInterval(id);
  }, [load]);

  const q = query.toLowerCase().trim();

  const filteredItems = useMemo(() => {
    if (!q) return items;
    return items.filter(i =>
      i.track_name.toLowerCase().includes(q) ||
      i.artist_name.toLowerCase().includes(q) ||
      i.album_name.toLowerCase().includes(q)
    );
  }, [items, q]);

  const filteredArtists = useMemo(() => {
    if (!stats) return [];
    if (!q) return stats.topArtists;
    return stats.topArtists.filter(a => a.name.toLowerCase().includes(q));
  }, [stats, q]);

  const filteredTracks = useMemo(() => {
    if (!stats) return [];
    if (!q) return stats.topTracks;
    return stats.topTracks.filter(t =>
      t.name.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }, [stats, q]);

  if (loading) return <div className="ld"><div className="ld-r" /><span className="ld-t">Завантаження...</span></div>;

  return (
    <div className="dash">
      <nav className="nav">
        <a href="/dashboard" className="nav-b"><SpotifyLogo s={26} /><span>Statify</span></a>
        <div className="nav-r">
          {profile && (<>
            {profile.image && <div className="ava"><img src={profile.image} alt="" /></div>}
            <span className="nav-n">{profile.name}</span>
          </>)}
          <a href="/api/auth/logout" className="btn-o">Вийти</a>
        </div>
      </nav>

      {np?.playing && np.track && (
        <div className="np">
          <div className="np-img">
            {np.track.image && <img src={np.track.image} alt="" />}
            <div className="np-dot" />
          </div>
          <div className="np-i">
            <div className="np-l">Зараз грає</div>
            <div className="np-t">{np.track.name}</div>
            <div className="np-a">{np.track.artist} — {np.track.album}</div>
            <div className="np-bar">
              <div className="np-fill" style={{ width: `${(np.track.progress_ms / np.track.duration_ms) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="stats">
          <div className="st"><div className="st-n g">{stats.totalTracks}</div><div className="st-l">Прослухано</div></div>
          <div className="st"><div className="st-n">{stats.totalMinutes}</div><div className="st-l">Хвилин</div></div>
          <div className="st"><div className="st-n">{stats.uniqueArtists}</div><div className="st-l">Артистів</div></div>
          <div className="st"><div className="st-n">{stats.uniqueTracks}</div><div className="st-l">Треків</div></div>
        </div>
      )}

      {/* Search */}
      <div className="srch">
        <div className="srch-box">
          <SearchSvg />
          <input
            className="srch-in"
            type="text"
            placeholder="Пошук по трекам, артистам, альбомам..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="srch-x" onClick={() => setQuery("")}><ClearSvg /></button>
          )}
        </div>
        {q && (
          <span className="srch-cnt">
            {tab === "history" ? `${filteredItems.length} з ${items.length}` :
             tab === "artists" ? `${filteredArtists.length} з ${stats?.topArtists.length || 0}` :
             `${filteredTracks.length} з ${stats?.topTracks.length || 0}`}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(["history", "artists", "tracks"] as const).map(t => (
          <button key={t} className={`tb ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
            {t === "history" ? "Історія" : t === "artists" ? "Топ артисти" : "Топ треки"}
          </button>
        ))}
      </div>

      {/* Artists */}
      {tab === "artists" && (
        <div>
          <div className="sh"><h2 className="sh-t">Топ артисти</h2><span className="sh-s">за останні 50 треків</span></div>
          {filteredArtists.length ? (
            <div className="tsc">
              {filteredArtists.map((a, i) => (
                <div className="tc" key={a.name}>
                  <div className={`tc-r ${i === 0 && !q ? "f" : ""}`}>{i + 1}</div>
                  <div className="tc-img circ">{a.image && <img src={a.image} alt={a.name} />}</div>
                  <div className="tc-n">{a.name}</div>
                  <div className="tc-s">{a.count} треків</div>
                </div>
              ))}
            </div>
          ) : <NoResults hasQuery={!!q} icon="🎤" />}
        </div>
      )}

      {/* Tracks */}
      {tab === "tracks" && (
        <div>
          <div className="sh"><h2 className="sh-t">Топ треки</h2><span className="sh-s">найчастіше прослуховувані</span></div>
          {filteredTracks.length ? (
            <div className="tsc">
              {filteredTracks.map((t, i) => (
                <div className="tc" key={`${t.name}-${t.artist}`}>
                  <div className={`tc-r ${i === 0 && !q ? "f" : ""}`}>{i + 1}</div>
                  <div className="tc-img">{t.image && <img src={t.image} alt={t.name} />}</div>
                  <div className="tc-n">{t.name}</div>
                  <div className="tc-s">{t.artist}</div>
                </div>
              ))}
            </div>
          ) : <NoResults hasQuery={!!q} icon="🎵" />}
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div>
          <div className="sh">
            <h2 className="sh-t">Остання активність</h2>
            <button className={`btn-r ${spin ? "sp" : ""}`} onClick={() => load(true)} disabled={spin}>
              <RefreshSvg />{spin ? "..." : "Оновити"}
            </button>
          </div>
          {filteredItems.length ? (
            <div className="hl">
              {filteredItems.map((it, i) => (
                <div className="hi" key={`${it.played_at}-${it.track_id}`} style={{ animationDelay: `${i * .025}s` }}>
                  <div className="hi-img">{it.album_image && <img src={it.album_image} alt="" />}</div>
                  <div className="hi-i">
                    <div className="hi-t">{it.track_name}</div>
                    <div className="hi-a">{it.artist_name} · {it.album_name}</div>
                  </div>
                  <div className="hi-m">
                    <div className="hi-d">{dur(it.duration_ms)}</div>
                    <div className="hi-w">{ago(it.played_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ey">
              <div className="ey-ic">{q ? "🔍" : "🎧"}</div>
              <div className="ey-t">{q ? "Нічого не знайдено" : "Історія порожня"}</div>
              <div className="ey-s">{q ? "Спробуй інший запит" : "Послухай щось у Spotify — треки з'являться тут"}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NoResults({ hasQuery, icon }: { hasQuery: boolean; icon: string }) {
  return (
    <div className="ey">
      <div className="ey-ic">{hasQuery ? "🔍" : icon}</div>
      <div className="ey-t">{hasQuery ? "Нічого не знайдено" : "Поки немає даних"}</div>
      {hasQuery && <div className="ey-s">Спробуй інший запит</div>}
    </div>
  );
}
