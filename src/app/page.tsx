"use client";

import { useState, useCallback } from "react";
import LocationPicker from "@/components/LocationPicker";
import ZmanimSection from "@/components/ZmanimSection";
import { ZmanimResponse } from "@/types/zmanim";
import { SECTION_LABELS } from "@/lib/labels";

const SECTION_ICONS: Record<string, string> = {
  alos:          "🌑",
  misheyakir:    "🌒",
  sunrise:       "🌅",
  sofZmanShema:  "📜",
  sofZmanTefila: "🙏",
  chatzos:       "☀️",
  minchaGedola:  "🕐",
  minchaKetana:  "🕒",
  plagHamincha:  "🕔",
  sunset:        "🌇",
  tzait:         "🌃",
  midnight:      "🌙",
  shaahZmanis:   "⏱️",
  chametz:       "🍞",
};

const DEFAULT_OPEN_SECTIONS = new Set([
  "alos",
  "misheyakir",
  "sunrise",
  "sofZmanShema",
  "sofZmanTefila",
  "chatzos",
  "minchaGedola",
  "minchaKetana",
  "plagHamincha",
  "sunset",
  "tzait",
  "midnight",
  "shaahZmanis",
  "chametz",
]);

export default function Home() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
    timezone: string;
  } | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [elevation, setElevation] = useState(0);
  const [data, setData] = useState<ZmanimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchZmanim = useCallback(
    async (
      lat: number,
      lng: number,
      name: string,
      timezone: string,
      selectedDate: string,
      elev: number
    ) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          lat: lat.toString(),
          lng: lng.toString(),
          elevation: elev.toString(),
          timezone,
          date: selectedDate,
          locationName: name,
        });
        const res = await fetch(`/api/zmanim?${params}`);
        if (!res.ok) throw new Error("Failed to fetch zmanim");
        const json: ZmanimResponse = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleLocationSelect = (
    lat: number,
    lng: number,
    name: string,
    timezone: string
  ) => {
    setLocation({ lat, lng, name, timezone });
    fetchZmanim(lat, lng, name, timezone, date, elevation);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (location) {
      fetchZmanim(location.lat, location.lng, location.name, location.timezone, newDate, elevation);
    }
  };

  const handleElevationChange = (elev: number) => {
    setElevation(elev);
    if (location) {
      fetchZmanim(location.lat, location.lng, location.name, location.timezone, date, elev);
    }
  };

  const totalZmanim = data
    ? Object.entries(data)
        .filter(([k]) => k !== "meta")
        .reduce(
          (acc, [, section]) =>
            acc + Object.values(section as Record<string, string | null>).filter(Boolean).length,
          0
        )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✡️</span>
            <div>
              <h1 className="text-xl font-bold text-white">Zmanim</h1>
              <p className="text-xs text-slate-400">Halachic Times — All Formulas</p>
            </div>
          </div>
          {data && (
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-400">{totalZmanim} zmanim</p>
              <p className="text-xs text-slate-500">{data.meta.locationName}</p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 p-6 shadow-lg space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Location
          </h2>
          <LocationPicker onLocationSelect={handleLocationSelect} />

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-700 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showAdvanced ? "▲" : "▼"} Advanced
                </button>
              </label>
              {showAdvanced ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={elevation}
                    onChange={(e) => handleElevationChange(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-28 px-3 py-2.5 rounded-xl bg-slate-700 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-400 text-sm">m elevation</span>
                </div>
              ) : (
                <div className="h-[42px]" />
              )}
            </div>
          </div>

          {location && (
            <div className="bg-slate-700/40 rounded-xl px-4 py-3 text-sm flex flex-wrap gap-x-6 gap-y-1">
              <span className="text-slate-400">
                📍 <span className="text-slate-200">{location.name}</span>
              </span>
              <span className="text-slate-400">
                Lat:{" "}
                <span className="font-mono text-slate-200">{location.lat.toFixed(6)}</span>
              </span>
              <span className="text-slate-400">
                Lng:{" "}
                <span className="font-mono text-slate-200">{location.lng.toFixed(6)}</span>
              </span>
              <span className="text-slate-400">
                TZ: <span className="text-slate-200">{location.timezone}</span>
              </span>
              {elevation > 0 && (
                <span className="text-slate-400">
                  Elevation: <span className="text-slate-200">{elevation}m</span>
                </span>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Calculating zmanim...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl px-6 py-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && !data && !error && (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl">🌍</div>
            <h3 className="text-xl font-semibold text-slate-300">
              Enter a location to get started
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Search for any address or use your current location to calculate all halachic
              times using every major formula and opinion.
            </p>
          </div>
        )}

        {!loading && data && (
          <>
            <div className="text-center py-2">
              <p className="text-slate-400 text-sm">
                Showing{" "}
                <span className="text-blue-400 font-semibold">{totalZmanim} zmanim</span>{" "}
                for{" "}
                <span className="text-white font-medium">{data.meta.locationName}</span> on{" "}
                <span className="text-white font-medium">
                  {new Date(data.meta.date + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Powered by KosherZmanim · Opinions: GRA, MGA, Baal HaTanya, Ateret Torah,
                Geonim, Yereim & more
              </p>
            </div>

            <div className="space-y-3">
              {(
                Object.entries(data).filter(
                  ([k]) => k !== "meta"
                ) as [string, Record<string, string | null>][]
              ).map(([sectionKey, sectionData]) => (
                <ZmanimSection
                  key={sectionKey}
                  title={SECTION_LABELS[sectionKey] ?? sectionKey}
                  data={sectionData}
                  timezone={data.meta.timezone}
                  defaultOpen={DEFAULT_OPEN_SECTIONS.has(sectionKey)}
                  icon={SECTION_ICONS[sectionKey]}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="text-center py-8 text-slate-600 text-xs">
        Zmanim calculated using KosherZmanim (TypeScript port of KosherJava) · NOAA Solar
        Algorithm · All opinions presented for educational purposes
      </footer>
    </div>
  );
}
