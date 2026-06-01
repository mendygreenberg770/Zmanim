"use client";

import { useState, useCallback, useRef } from "react";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  onLocationSelect: (lat: number, lng: number, name: string, timezone: string) => void;
}

export default function LocationPicker({ onLocationSelect }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=6`,
          { headers: { "Accept-Language": "en" } }
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const resolveTimezone = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://timezonefinder.com/api/?lat=${lat}&lng=${lng}&format=json`
      );
      const data = await res.json();
      return data.timezone || guessTimezone(lat, lng);
    } catch {
      return guessTimezone(lat, lng);
    }
  };

  const guessTimezone = (lat: number, lng: number): string => {
    const offset = Math.round(lng / 15);
    if (offset >= 0) return `Etc/GMT-${offset}`;
    return `Etc/GMT+${Math.abs(offset)}`;
  };

  const handleSelect = async (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const name = result.display_name.split(",")[0].trim();
    setQuery(result.display_name);
    setSuggestions([]);
    const tz = await resolveTimezone(lat, lng);
    onLocationSelect(lat, lng, name, tz);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const name = data.display_name?.split(",")[0] ?? "My Location";
          setQuery(data.display_name ?? `${lat}, ${lng}`);
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          onLocationSelect(lat, lng, name, tz);
        } catch {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          onLocationSelect(lat, lng, "My Location", tz);
        } finally {
          setGeoLoading(false);
        }
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              search(e.target.value);
            }}
            placeholder="Enter address, city, or coordinates..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          {suggestions.length > 0 && (
            <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl overflow-hidden">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => handleSelect(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
                    {s.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleGeolocate}
          disabled={geoLoading}
          title="Use my location"
          className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {geoLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>
    </div>
  );
}
