"use client";

import { useState, useCallback } from "react";
import LocationPicker from "@/components/LocationPicker";
import ZmanimSection from "@/components/ZmanimSection";
import { ZmanimResponse, JewishInfo } from "@/types/zmanim";
import { SECTION_LABELS } from "@/lib/labels";

// ── Icon & ordering ───────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, string> = {
  candleLighting: "🕯️",
  alos:           "🌑",
  misheyakir:     "🌒",
  sunrise:        "🌅",
  sofZmanShema:   "📜",
  sofZmanTefila:  "🙏",
  chatzos:        "☀️",
  minchaGedola:   "🕐",
  minchaKetana:   "🕒",
  plagHamincha:   "🕔",
  sunset:         "🌇",
  tzait:          "🌃",
  midnight:       "🌙",
  shaahZmanis:    "⏱️",
  chametz:        "🍞",
};

// Explicit ordering — candleLighting appears just before sunset
const SECTION_ORDER = [
  "candleLighting",
  "alos", "misheyakir", "sunrise",
  "sofZmanShema", "sofZmanTefila",
  "chatzos", "minchaGedola", "minchaKetana", "plagHamincha",
  "sunset", "tzait", "midnight", "shaahZmanis",
  "chametz",
];

const DEFAULT_OPEN = new Set(SECTION_ORDER);

// ── Special-day badge ─────────────────────────────────────────────────────────

function DayBadge({ jewish }: { jewish: JewishInfo }) {
  if (!jewish.specialDay && !jewish.isFriday) return null;

  const isShabbosOrYT = jewish.isShabbos || jewish.isYomTov;
  const isFast        = jewish.isTaanit;
  const isFriday      = jewish.isFriday && !jewish.isErevYomTov;
  const isErevYT      = jewish.isErevYomTov;

  let bg  = "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700";
  let label = jewish.specialDay ?? "";

  if (isShabbosOrYT)
    bg = "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700";
  if (isFast)
    bg = "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-400 dark:border-slate-500";
  if (isFriday && !isErevYT)
    label = "Erev Shabbos";

  const fastNote = isFast && jewish.isMinorFast ? " · Fast begins at Alos HaShachar" : "";
  const majorFastNote = isFast && !jewish.isMinorFast ? " · 25-hour fast — begins previous evening" : "";

  return (
    <div className={`flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${bg}`}>
      <span>{label}{fastNote}{majorFastNote}</span>
      {jewish.isChanukah && <span className="ml-1">🕎</span>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [location, setLocation] = useState<{
    lat: number; lng: number; name: string; timezone: string;
  } | null>(null);
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [elevation, setElev]    = useState(0);
  const [data, setData]         = useState<ZmanimResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [showAdv, setShowAdv]   = useState(false);

  const fetchZmanim = useCallback(async (
    lat: number, lng: number, name: string, tz: string, d: string, elev: number
  ) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({
        lat: lat.toString(), lng: lng.toString(),
        elevation: elev.toString(), timezone: tz,
        date: d, locationName: name,
      });
      const res = await fetch(`/api/zmanim?${params}`);
      if (!res.ok) throw new Error("Failed to fetch zmanim");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally { setLoading(false); }
  }, []);

  const handleLocation = (lat: number, lng: number, name: string, tz: string) => {
    setLocation({ lat, lng, name, timezone: tz });
    fetchZmanim(lat, lng, name, tz, date, elevation);
  };
  const handleDate = (d: string) => {
    setDate(d);
    if (location) fetchZmanim(location.lat, location.lng, location.name, location.timezone, d, elevation);
  };
  const handleElev = (e: number) => {
    setElev(e);
    if (location) fetchZmanim(location.lat, location.lng, location.name, location.timezone, date, e);
  };

  const jewish = data?.meta.jewish;

  // Section title overrides based on day type
  function sectionTitle(key: string): string {
    if (key === "alos" && jewish?.isTaanit && jewish.isMinorFast)
      return "Dawn / Fast Start — עלות השחר";
    if (key === "tzait" && jewish?.motzaeiLabel)
      return `${jewish.motzaeiLabel} — ${SECTION_LABELS.tzait}`;
    if (key === "candleLighting" && jewish?.isErevYomTov && !jewish.isFriday)
      return "Hadlakas Neiros (Yom Tov) — הדלקת נרות";
    return SECTION_LABELS[key] ?? key;
  }

  function sectionSubtitle(key: string): string | undefined {
    if (key === "candleLighting" && jewish) {
      const what = jewish.isFriday ? "Shabbos" : jewish.specialDay ?? "Yom Tov";
      return `${what} ends / Motzaei times below`;
    }
    return undefined;
  }

  function sectionAccent(key: string): string | undefined {
    if (key === "candleLighting")
      return "border-amber-300 dark:border-amber-600";
    if (key === "tzait" && jewish?.isShabbos)
      return "border-amber-300 dark:border-amber-600";
    if (key === "alos" && jewish?.isTaanit)
      return "border-slate-400 dark:border-slate-500";
    return undefined;
  }

  const totalZmanim = data
    ? Object.entries(data)
        .filter(([k]) => k !== "meta")
        .reduce((acc, [, sec]) =>
          acc + Object.values(sec as Record<string, string | null>).filter(Boolean).length, 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✡️</span>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Zmanim</h1>
              <p className="text-xs text-slate-400">Halachic Times — All Opinions</p>
            </div>
          </div>
          {data && (
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-400">{totalZmanim} zmanim</p>
              {jewish?.jewishDate && (
                <p className="text-xs text-amber-400">{jewish.jewishDate}</p>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Location / date controls */}
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 p-5 shadow-lg space-y-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</h2>
          <LocationPicker onLocationSelect={handleLocation} />

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Date</label>
              <input
                type="date" value={date}
                onChange={(e) => handleDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-700 border border-slate-600
                           text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                <button onClick={() => setShowAdv(!showAdv)}
                  className="text-blue-400 hover:text-blue-300 transition-colors">
                  {showAdv ? "▲" : "▼"} Advanced
                </button>
              </label>
              {showAdv ? (
                <div className="flex items-center gap-2">
                  <input type="number" value={elevation}
                    onChange={(e) => handleElev(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-28 px-3 py-2.5 rounded-xl bg-slate-700 border border-slate-600
                               text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-400 text-sm">m elev.</span>
                </div>
              ) : <div className="h-[42px]" />}
            </div>
          </div>

          {location && (
            <div className="bg-slate-700/40 rounded-xl px-4 py-2.5 text-xs flex flex-wrap gap-x-5 gap-y-1">
              <span className="text-slate-400">📍 <span className="text-slate-200">{location.name}</span></span>
              <span className="text-slate-400">Lat <span className="font-mono text-slate-200">{location.lat.toFixed(6)}</span></span>
              <span className="text-slate-400">Lng <span className="font-mono text-slate-200">{location.lng.toFixed(6)}</span></span>
              <span className="text-slate-400">TZ <span className="text-slate-200">{location.timezone}</span></span>
              {elevation > 0 && <span className="text-slate-400">Elev <span className="text-slate-200">{elevation}m</span></span>}
            </div>
          )}
        </div>

        {/* States */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Calculating zmanim…</p>
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl px-6 py-4 text-red-300">{error}</div>
        )}
        {!loading && !data && !error && (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🌍</div>
            <h3 className="text-lg font-semibold text-slate-300">Enter a location to get started</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Search for any address or use your current location to calculate all halachic times.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && data && (
          <>
            {/* Jewish date + special day badge */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-slate-400">
                  {new Date(data.meta.date + "T12:00:00Z").toLocaleDateString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
                {jewish?.jewishDate && (
                  <span className="text-amber-400 font-medium">{jewish.jewishDate}</span>
                )}
              </div>
              {jewish && <DayBadge jewish={jewish} />}
            </div>

            {/* Sections in explicit order */}
            <div className="space-y-2.5">
              {SECTION_ORDER.map((key) => {
                const sec = (data as unknown as Record<string, Record<string, string | null>>)[key];
                if (!sec) return null;
                return (
                  <ZmanimSection
                    key={key}
                    title={sectionTitle(key)}
                    subtitle={sectionSubtitle(key)}
                    data={sec}
                    timezone={data.meta.timezone}
                    defaultOpen={DEFAULT_OPEN.has(key)}
                    icon={SECTION_ICONS[key]}
                    accentColor={sectionAccent(key)}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer className="text-center py-8 text-slate-600 text-xs">
        Powered by KosherZmanim · NOAA Solar Algorithm · All opinions for educational purposes
      </footer>
    </div>
  );
}
