"use client";

import { useState, useCallback } from "react";
import LocationPicker from "@/components/LocationPicker";
import ZmanimSection from "@/components/ZmanimSection";
import HebrewDatePicker from "@/components/HebrewDatePicker";
import CalendarPopup from "@/components/CalendarPopup";
import { ZmanimResponse, JewishInfo } from "@/types/zmanim";
import { SECTION_LABELS } from "@/lib/labels";

// ── Section ordering ──────────────────────────────────────────────────────────

const SECTION_ORDER = [
  "candleLighting",
  "alos", "misheyakir", "sunrise",
  "sofZmanShema", "sofZmanTefila",
  "chametz",
  "chatzos", "minchaGedola", "minchaKetana", "plagHamincha",
  "sunset", "tzait", "motzaeiShabbos", "midnight", "shaahZmanis",
];

const DEFAULT_OPEN = new Set(SECTION_ORDER);

// ── Date helpers ──────────────────────────────────────────────────────────────

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Day badge ─────────────────────────────────────────────────────────────────

function DayBadge({ jewish }: { jewish: JewishInfo }) {
  if (!jewish.specialDay && !jewish.isFriday) return null;

  const isShabbosOrYT = jewish.isShabbos || jewish.isYomTov;
  const isFast        = jewish.isTaanit;
  const isFriday      = jewish.isFriday && !jewish.isErevYomTov;

  let cls = "bg-blue-50 border-blue-200 text-blue-800";
  if (isShabbosOrYT) cls = "bg-amber-50 border-amber-200 text-amber-900";
  if (isFast)        cls = "bg-gray-100 border-gray-300 text-gray-700";

  let label = jewish.specialDay ?? "";
  if (isFriday && !jewish.isErevYomTov) label = "Erev Shabbos";

  const fastNote =
    isFast && jewish.isMinorFast  ? " — Fast begins at Alos HaShachar" :
    isFast && !jewish.isMinorFast ? " — 25-hour fast" : "";

  return (
    <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${cls}`}>
      {label}{fastNote}
    </div>
  );
}

// ── Nav button ────────────────────────────────────────────────────────────────

function NavBtn({ onClick, children, active }: {
  onClick: () => void; children: React.ReactNode; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 border-blue-600 text-white"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [location, setLocation] = useState<{
    lat: number; lng: number; name: string; timezone: string;
  } | null>(null);
  const [date, setDate]       = useState(todayStr());
  const [elevation, setElev]  = useState(0);
  const [data, setData]       = useState<ZmanimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [showAdv, setShowAdv] = useState(false);

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

  const goToDate = useCallback((d: string) => {
    setDate(d);
    if (location) fetchZmanim(location.lat, location.lng, location.name, location.timezone, d, elevation);
  }, [location, elevation, fetchZmanim]);

  const handleLocation = (lat: number, lng: number, name: string, tz: string) => {
    setLocation({ lat, lng, name, timezone: tz });
    fetchZmanim(lat, lng, name, tz, date, elevation);
  };
  const handleElev = (e: number) => {
    setElev(e);
    if (location) fetchZmanim(location.lat, location.lng, location.name, location.timezone, date, e);
  };

  const jewish = data?.meta.jewish;

  function sectionTitle(key: string): string {
    if (key === "candleLighting" && jewish?.candleLightingFromTzeit)
      return "Hadlakas Neiros — Light from Tzeit";
    if (key === "alos" && jewish?.isTaanit && jewish.isMinorFast)
      return "Dawn / Fast Start — עלות השחר";
    if (key === "tzait" && jewish?.motzaeiLabel)
      return `${jewish.motzaeiLabel} — ${SECTION_LABELS.tzait}`;
    if (key === "candleLighting" && jewish?.isErevYomTov && !jewish.isFriday)
      return "Hadlakas Neiros (Yom Tov) — הדלקת נרות";
    return SECTION_LABELS[key] ?? key;
  }

  function sectionSubtitle(key: string): string | undefined {
    if (key === "candleLighting" && jewish?.candleLightingFromTzeit)
      return jewish?.candleLightingForLabel
        ? `Light after — ${jewish.candleLightingForLabel}`
        : "Light after";
    if (key === "candleLighting" && jewish)
      return jewish.candleLightingForLabel ?? (jewish.isFriday ? "Erev Shabbos" : "Erev Yom Tov");
    if (key === "motzaeiShabbos" && jewish?.jewishDate)
      return jewish.jewishDate;
    return undefined;
  }

  function sectionAccent(key: string): string | undefined {
    if (key === "candleLighting") return "amber";
    if (key === "motzaeiShabbos") return "amber";
    if (key === "alos" && jewish?.isTaanit) return "gray";
    return undefined;
  }

  const isToday = date === todayStr();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Zmanim</h1>
            <p className="text-xs text-gray-500">Halachic Times — All Opinions</p>
          </div>
          {data && (
            <div className="text-right">
              {jewish?.jewishDate && (
                <p className="text-sm font-semibold text-amber-700">{jewish.jewishDate}</p>
              )}
              {jewish?.specialDay && (
                <p className="text-xs text-gray-500">{jewish.specialDay}</p>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-4">
        {/* Controls card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</p>
          <LocationPicker onLocationSelect={handleLocation} />

          <div className="flex flex-wrap gap-4 items-start">
            {/* Date navigation */}
            <div className="flex-1 min-w-[220px] space-y-1.5">
              <label className="block text-xs text-gray-500 font-medium">Date</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <NavBtn onClick={() => goToDate(shiftDate(date, -1))}>&#8592;</NavBtn>
                <CalendarPopup date={date} onChange={goToDate} />
                <NavBtn onClick={() => goToDate(shiftDate(date, 1))}>&#8594;</NavBtn>
                <NavBtn onClick={() => goToDate(todayStr())} active={isToday}>Today</NavBtn>
              </div>
              <HebrewDatePicker date={date} onChange={goToDate} />
            </div>

            {/* Advanced */}
            <div className="flex-shrink-0 space-y-1.5">
              <label className="block text-xs text-gray-500 font-medium">
                <button onClick={() => setShowAdv(!showAdv)}
                  className="text-blue-600 hover:text-blue-700 transition-colors">
                  {showAdv ? "▲" : "▼"} Advanced
                </button>
              </label>
              {showAdv ? (
                <div className="flex items-center gap-2">
                  <input type="number" value={elevation}
                    onChange={e => handleElev(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-28 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500 text-sm">m elev.</span>
                </div>
              ) : <div className="h-[38px]" />}
            </div>
          </div>

          {location && (
            <div className="bg-gray-50 rounded-lg px-4 py-2.5 text-xs flex flex-wrap gap-x-5 gap-y-1 border border-gray-100">
              <span className="text-gray-500">Location: <span className="text-gray-800 font-medium">{location.name}</span></span>
              <span className="text-gray-500">Lat <span className="font-mono text-gray-800">{location.lat.toFixed(6)}</span></span>
              <span className="text-gray-500">Lng <span className="font-mono text-gray-800">{location.lng.toFixed(6)}</span></span>
              <span className="text-gray-500">TZ <span className="text-gray-800">{location.timezone}</span></span>
              {elevation > 0 && <span className="text-gray-500">Elev <span className="text-gray-800">{elevation}m</span></span>}
            </div>
          )}
        </div>

        {/* States */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Calculating zmanim...</p>
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">{error}</div>
        )}
        {!loading && !data && !error && (
          <div className="text-center py-20 space-y-2">
            <h3 className="text-base font-semibold text-gray-500">Enter a location to get started</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Search for any address or use your current location to calculate all halachic times.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && data && (
          <>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-gray-500">
                  {new Date(data.meta.date + "T12:00:00Z").toLocaleDateString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
                {jewish?.jewishDate && (
                  <span className="text-amber-700 font-medium">{jewish.jewishDate}</span>
                )}
              </div>
              {jewish && <DayBadge jewish={jewish} />}
            </div>

            <div className="space-y-2">
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
                    accentColor={sectionAccent(key)}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer className="text-center py-8 text-gray-400 text-xs">
        Powered by KosherZmanim · NOAA Solar Algorithm · All opinions for educational purposes
      </footer>
    </div>
  );
}
