// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function Logo({ s = 32 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="#1DB954">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

// ── Demo Data ──────────────────────────────────────

const DEMO_NP = {
  name: "Blinding Lights",
  artist: "The Weeknd",
  album: "After Hours",
  progress: 65,
};

const DEMO_STATS = {
  totalTracks: 847,
  totalMinutes: 2941,
  uniqueArtists: 124,
  uniqueTracks: 312,
};

const DEMO_ARTISTS = [
  { name: "The Weeknd", count: 42, color: "#e74c3c" },
  { name: "Drake", count: 38, color: "#3498db" },
  { name: "Dua Lipa", count: 31, color: "#e91e8a" },
  { name: "Bad Bunny", count: 27, color: "#f39c12" },
  { name: "Tyler, The Creator", count: 24, color: "#2ecc71" },
  { name: "SZA", count: 21, color: "#9b59b6" },
];

const DEMO_TRACKS = [
  { name: "Blinding Lights", artist: "The Weeknd", color: "#e74c3c" },
  { name: "Levitating", artist: "Dua Lipa", color: "#e91e8a" },
  { name: "One Dance", artist: "Drake", color: "#3498db" },
  { name: "HUMBLE.", artist: "Kendrick Lamar", color: "#f39c12" },
  { name: "As It Was", artist: "Harry Styles", color: "#2ecc71" },
  { name: "Kill Bill", artist: "SZA", color: "#9b59b6" },
];

const DEMO_HISTORY = [
  { track: "Blinding Lights", artist: "The Weeknd", album: "After Hours", dur: "3:20", time: "2 хв", color: "#e74c3c" },
  { track: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", dur: "3:23", time: "6 хв", color: "#e91e8a" },
  { track: "Save Your Tears", artist: "The Weeknd", album: "After Hours", dur: "3:35", time: "10 хв", color: "#e74c3c" },
  { track: "One Dance", artist: "Drake", album: "Views", dur: "2:53", time: "14 хв", color: "#3498db" },
  { track: "HUMBLE.", artist: "Kendrick Lamar", album: "DAMN.", dur: "2:57", time: "17 хв", color: "#f39c12" },
  { track: "As It Was", artist: "Harry Styles", album: "Harry's House", dur: "2:47", time: "20 хв", color: "#2ecc71" },
  { track: "Kill Bill", artist: "SZA", album: "SOS", dur: "2:33", time: "23 хв", color: "#9b59b6" },
  { track: "Starboy", artist: "The Weeknd", album: "Starboy", dur: "3:50", time: "27 хв", color: "#e74c3c" },
];

// ── Fake album art placeholder ──

function FakeArt({ color, size = 42, round = false }: { color: string; size?: number; round?: boolean }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: round ? "50%" : 6,
      background: `linear-gradient(135deg, ${color}, ${color}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
    </div>
  );
}

// ── Demo Dashboard Component ──

function DemoDashboard() {
  const [demoTab, setDemoTab] = useState<"history" | "artists" | "tracks">("history");
  const [demoQuery, setDemoQuery] = useState("");

  const dq = demoQuery.toLowerCase().trim();

  const fHistory = dq
    ? DEMO_HISTORY.filter(h => h.track.toLowerCase().includes(dq) || h.artist.toLowerCase().includes(dq) || h.album.toLowerCase().includes(dq))
    : DEMO_HISTORY;

  const fArtists = dq
    ? DEMO_ARTISTS.filter(a => a.name.toLowerCase().includes(dq))
    : DEMO_ARTISTS;

  const fTracks = dq
    ? DEMO_TRACKS.filter(t => t.name.toLowerCase().includes(dq) || t.artist.toLowerCase().includes(dq))
    : DEMO_TRACKS;

  return (
    <div className="demo-dash">
      {/* Nav */}
      <div className="nav" style={{ borderColor: "rgba(255,255,255,.03)" }}>
        <div className="nav-b" style={{ pointerEvents: "none" }}>
          <Logo s={22} /><span>Statify</span>
        </div>
        <div className="nav-r">
          <div className="ava" style={{ background: "linear-gradient(135deg, #1DB954, #1a73e8)", border: "none" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", fontSize: ".8rem", fontWeight: 700 }}>D</span>
          </div>
          <span className="nav-n">Demo User</span>
          <span className="btn-o" style={{ pointerEvents: "none", opacity: 0.5 }}>Вийти</span>
        </div>
      </div>

      {/* Now Playing */}
      <div className="np">
        <div className="np-img">
          <FakeArt color={DEMO_NP.color || "#e74c3c"} size={56} />
          <div className="np-dot" />
        </div>
        <div className="np-i">
          <div className="np-l">Зараз грає</div>
          <div className="np-t">{DEMO_NP.name}</div>
          <div className="np-a">{DEMO_NP.artist} — {DEMO_NP.album}</div>
          <div className="np-bar"><div className="np-fill" style={{ width: `${DEMO_NP.progress}%` }} /></div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="st"><div className="st-n g">{DEMO_STATS.totalTracks}</div><div className="st-l">Прослухано</div></div>
        <div className="st"><div className="st-n">{DEMO_STATS.totalMinutes}</div><div className="st-l">Хвилин</div></div>
        <div className="st"><div className="st-n">{DEMO_STATS.uniqueArtists}</div><div className="st-l">Артистів</div></div>
        <div className="st"><div className="st-n">{DEMO_STATS.uniqueTracks}</div><div className="st-l">Треків</div></div>
      </div>

      {/* Search */}
      <div className="srch">
        <div className="srch-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input className="srch-in" type="text" placeholder="Пошук по трекам, артистам, альбомам..." value={demoQuery} onChange={e => setDemoQuery(e.target.value)} />
          {demoQuery && (
            <button className="srch-x" onClick={() => setDemoQuery("")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        {dq && <span className="srch-cnt">
          {demoTab === "history" ? `${fHistory.length} з ${DEMO_HISTORY.length}` :
           demoTab === "artists" ? `${fArtists.length} з ${DEMO_ARTISTS.length}` :
           `${fTracks.length} з ${DEMO_TRACKS.length}`}
        </span>}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(["history", "artists", "tracks"] as const).map(t => (
          <button key={t} className={`tb ${demoTab === t ? "on" : ""}`} onClick={() => setDemoTab(t)}>
            {t === "history" ? "Історія" : t === "artists" ? "Топ артисти" : "Топ треки"}
          </button>
        ))}
      </div>

      {/* Artists */}
      {demoTab === "artists" && (
        <div>
          <div className="sh"><h2 className="sh-t">Топ артисти</h2></div>
          {fArtists.length ? (
            <div className="tsc">
              {fArtists.map((a, i) => (
                <div className="tc" key={a.name}>
                  <div className={`tc-r ${i === 0 && !dq ? "f" : ""}`}>{i + 1}</div>
                  <div className="tc-img circ"><FakeArt color={a.color} size={120} round /></div>
                  <div className="tc-n">{a.name}</div>
                  <div className="tc-s">{a.count} треків</div>
                </div>
              ))}
            </div>
          ) : <div className="ey"><div className="ey-ic">🔍</div><div className="ey-t">Нічого не знайдено</div></div>}
        </div>
      )}

      {/* Tracks */}
      {demoTab === "tracks" && (
        <div>
          <div className="sh"><h2 className="sh-t">Топ треки</h2></div>
          {fTracks.length ? (
            <div className="tsc">
              {fTracks.map((t, i) => (
                <div className="tc" key={t.name}>
                  <div className={`tc-r ${i === 0 && !dq ? "f" : ""}`}>{i + 1}</div>
                  <div className="tc-img"><FakeArt color={t.color} size={120} /></div>
                  <div className="tc-n">{t.name}</div>
                  <div className="tc-s">{t.artist}</div>
                </div>
              ))}
            </div>
          ) : <div className="ey"><div className="ey-ic">🔍</div><div className="ey-t">Нічого не знайдено</div></div>}
        </div>
      )}

      {/* History */}
      {demoTab === "history" && (
        <div>
          <div className="sh"><h2 className="sh-t">Остання активність</h2></div>
          {fHistory.length ? (
            <div className="hl">
              {fHistory.map((h, i) => (
                <div className="hi" key={`${h.track}-${i}`}>
                  <div className="hi-img"><FakeArt color={h.color} size={42} /></div>
                  <div className="hi-i">
                    <div className="hi-t">{h.track}</div>
                    <div className="hi-a">{h.artist} · {h.album}</div>
                  </div>
                  <div className="hi-m">
                    <div className="hi-d">{h.dur}</div>
                    <div className="hi-w">{h.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="ey"><div className="ey-ic">🔍</div><div className="ey-t">Нічого не знайдено</div></div>}
        </div>
      )}
    </div>
  );
}

// ── Landing Page ──

export default function Home() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="land-page">
      {/* Hero Section */}
      <section className="land">
        <div className="glow glow-g" />
        <div className="glow glow-b" />

        <div className="land-c">
          <div className="land-icon"><Logo s={32} /></div>

          <h1>Твоя музика.<br /><span className="gr">Твоя історія.</span></h1>

          <p className="land-p">
            Підключи Spotify і відстежуй кожен трек.
            Дивись статистику, топ артистів та повну історію прослуховувань.
          </p>

          <Link href="/api/auth/login" className="btn-go">
            <Logo s={20} />
            Увійти через Spotify
          </Link>

          {error && (
            <div className="land-err">Помилка авторизації: {error}</div>
          )}

          <div className="pills">
            <div className="pill"><span className="pill-d" />Історія треків</div>
            <div className="pill"><span className="pill-d" />Топ артисти</div>
            <div className="pill"><span className="pill-d" />Пошук</div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="demo-section">
        <div className="demo-header">
          <h2 className="demo-title">Подивись як це працює</h2>
          <p className="demo-sub">Інтерактивне демо з штучними даними. Увійди через Spotify щоб побачити свої.</p>
        </div>
        <div className="demo-frame">
          <div className="demo-dots">
            <span /><span /><span />
          </div>
          <DemoDashboard />
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">Готовий побачити <span className="gr">свою</span> статистику?</h2>
        <Link href="/api/auth/login" className="btn-go">
          <Logo s={20} />
          Підключити Spotify
        </Link>
      </section>
    </div>
  );
}
