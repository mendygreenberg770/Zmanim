"use client";

import { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Circle,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";

// ── Halacha constants ─────────────────────────────────────────────────────────
// Two main opinions on the length of one Amah (cubit):
//   R' Chaim Naeh: 48.0 cm  →  2000 amot = 960 m
//   Chazon Ish:    57.6 cm  →  2000 amot = 1152 m
const OPINIONS = [
  { key: "naeh",     label: "R' Chaim Naeh",  amah: 0.480, radius: 960  },
  { key: "chazonish",label: "Chazon Ish",      amah: 0.576, radius: 1152 },
];

const LIBRARIES: ("places")[] = ["places"];

const MAP_STYLE = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];

function metersToFeet(m: number) { return (m * 3.28084).toFixed(0); }
function mToMiles(m: number)     { return (m / 1609.344).toFixed(2); }

function haversineMeters(
  lat1: number, lon1: number, lat2: number, lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface ClickInfo {
  lat: number;
  lng: number;
  distance: number;
  withinNaeh: boolean;
  withinChazonIsh: boolean;
}

export default function TechumMap({ apiKey }: { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const [origin, setOrigin] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [opinion, setOpinion] = useState<"naeh" | "chazonish">("naeh");
  const [clickInfo, setClickInfo] = useState<ClickInfo | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 31.7683, lng: 35.2137 }); // Jerusalem default
  const [mapZoom, setMapZoom] = useState(12);
  const [showBoth, setShowBoth] = useState(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const selected = OPINIONS.find((o) => o.key === opinion)!;

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setOrigin({ lat, lng, label: place.formatted_address ?? place.name ?? "" });
    setMapCenter({ lat, lng });
    setMapZoom(14);
    setClickInfo(null);
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!origin || !e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const dist = haversineMeters(origin.lat, origin.lng, lat, lng);
      setClickInfo({
        lat, lng, distance: dist,
        withinNaeh:      dist <= 960,
        withinChazonIsh: dist <= 1152,
      });
    },
    [origin]
  );

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setOrigin({ lat, lng, label: "My Location" });
      setMapCenter({ lat, lng });
      setMapZoom(14);
      setClickInfo(null);
    });
  }, []);

  if (loadError) return (
    <div className="flex items-center justify-center h-full text-red-500 p-8 text-center">
      Failed to load Google Maps. Check your API key.
    </div>
  );
  if (!isLoaded) return (
    <div className="flex items-center justify-center h-full text-gray-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        Loading map...
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* ── Top control bar ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-10 px-4 py-3 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <Autocomplete
            onLoad={(ac) => { autocompleteRef.current = ac; }}
            onPlaceChanged={handlePlaceChanged}
          >
            <input
              type="text"
              placeholder="Search your Shabbos location…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Autocomplete>
        </div>

        {/* Geolocate */}
        <button
          onClick={handleGeolocate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z"/>
          </svg>
          Use My Location
        </button>

        {/* Opinion toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Opinion:</span>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
            {OPINIONS.map((op) => (
              <button
                key={op.key}
                onClick={() => setOpinion(op.key as "naeh" | "chazonish")}
                className={`px-3 py-1.5 transition-colors ${
                  opinion === op.key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Show both toggle */}
        <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showBoth}
            onChange={(e) => setShowBoth(e.target.checked)}
            className="rounded"
          />
          Show both circles
        </label>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Map ─────────────────────────────────────────────────────────── */}
        <div className="flex-1 relative">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter}
            zoom={mapZoom}
            onClick={handleMapClick}
            onLoad={(map) => { mapRef.current = map; }}
            options={{
              styles: MAP_STYLE,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {/* Origin marker */}
            {origin && (
              <Marker
                position={{ lat: origin.lat, lng: origin.lng }}
                title={origin.label}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: "#2563EB",
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 2,
                }}
              />
            )}

            {/* Primary techum circle */}
            {origin && (
              <Circle
                center={{ lat: origin.lat, lng: origin.lng }}
                radius={selected.radius}
                options={{
                  fillColor: "#3B82F6",
                  fillOpacity: 0.10,
                  strokeColor: "#2563EB",
                  strokeOpacity: 0.9,
                  strokeWeight: 2.5,
                }}
              />
            )}

            {/* Secondary circle when showBoth */}
            {origin && showBoth && (
              <Circle
                center={{ lat: origin.lat, lng: origin.lng }}
                radius={opinion === "naeh" ? 1152 : 960}
                options={{
                  fillColor: "#F59E0B",
                  fillOpacity: 0.07,
                  strokeColor: "#D97706",
                  strokeOpacity: 0.7,
                  strokeWeight: 1.5,
                }}
              />
            )}

            {/* Clicked point marker */}
            {clickInfo && (
              <Marker
                position={{ lat: clickInfo.lat, lng: clickInfo.lng }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 7,
                  fillColor: clickInfo.withinNaeh ? "#22C55E" : "#EF4444",
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 2,
                }}
              />
            )}
          </GoogleMap>

          {/* No origin hint */}
          {!origin && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg px-6 py-4 text-center max-w-xs">
                <div className="text-3xl mb-2">🕍</div>
                <p className="font-semibold text-gray-800 text-sm">Set your Shabbos location</p>
                <p className="text-gray-500 text-xs mt-1">Search above or use your current location to draw your Techum Shabbos boundary</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Info panel ──────────────────────────────────────────────────── */}
        <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
          {/* Techum info */}
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Techum Boundary</h2>
            <div className="space-y-2">
              {OPINIONS.map((op) => (
                <div
                  key={op.key}
                  className={`rounded-lg px-3 py-2.5 border text-xs ${
                    opinion === op.key
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${opinion === op.key ? "text-blue-800" : "text-gray-600"}`}>
                      {op.label}
                    </span>
                    {opinion === op.key && (
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <div className="mt-1 text-gray-500">
                    <span className="font-mono">{op.amah * 100} cm</span> / amah
                  </div>
                  <div className="mt-0.5 text-gray-700 font-medium">
                    {op.radius} m · {(op.radius / 1609.344).toFixed(3)} mi
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Origin */}
          {origin && (
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Starting Point</h2>
              <p className="text-sm text-gray-800 font-medium leading-snug">{origin.label}</p>
              <p className="text-xs text-gray-400 font-mono mt-1">
                {origin.lat.toFixed(6)}, {origin.lng.toFixed(6)}
              </p>
              <button
                onClick={() => { setOrigin(null); setClickInfo(null); }}
                className="mt-2 text-xs text-red-500 hover:text-red-600"
              >
                Clear location
              </button>
            </div>
          )}

          {/* Click result */}
          {clickInfo && origin && (
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Checked Point</h2>
              <p className="text-xs text-gray-400 font-mono mb-3">
                {clickInfo.lat.toFixed(6)}, {clickInfo.lng.toFixed(6)}
              </p>

              {/* Distance */}
              <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                <div className="text-xs text-gray-500">Distance from origin</div>
                <div className="text-lg font-bold text-gray-900">
                  {clickInfo.distance >= 1000
                    ? `${(clickInfo.distance / 1000).toFixed(2)} km`
                    : `${clickInfo.distance.toFixed(0)} m`}
                </div>
                <div className="text-xs text-gray-500">
                  {metersToFeet(clickInfo.distance)} ft · {mToMiles(clickInfo.distance)} mi
                </div>
              </div>

              {/* Status per opinion */}
              {OPINIONS.map((op) => {
                const within = clickInfo.distance <= op.radius;
                const remaining = op.radius - clickInfo.distance;
                return (
                  <div
                    key={op.key}
                    className={`rounded-lg px-3 py-2.5 mb-2 border text-xs ${
                      within
                        ? "border-green-300 bg-green-50"
                        : "border-red-300 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                      <span className={within ? "text-green-700" : "text-red-700"}>
                        {within ? "✓ Within" : "✗ Outside"} Techum
                      </span>
                    </div>
                    <div className={`text-xs ${within ? "text-green-600" : "text-red-600"}`}>
                      ({op.label})
                    </div>
                    <div className="text-gray-600 mt-1">
                      {within
                        ? `${remaining.toFixed(0)} m remaining`
                        : `${Math.abs(remaining).toFixed(0)} m over limit`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Instructions */}
          {origin && !clickInfo && (
            <div className="p-4 text-center text-gray-400 text-xs">
              <p>Tap anywhere on the map to check if that point is within your Techum Shabbos.</p>
            </div>
          )}

          {/* About */}
          <div className="p-4 mt-auto">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About Techum Shabbos</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              On Shabbos, one may not travel more than <strong>2000 amot</strong> (cubits)
              beyond the city boundary. Two major opinions exist on the length of one
              amah: R&apos; Chaim Naeh (48 cm) and the Chazon Ish (57.6 cm), resulting in
              boundaries of 960 m and 1,152 m respectively.
            </p>
            <p className="text-xs text-gray-400 mt-2">For educational purposes only. Consult your posek.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
