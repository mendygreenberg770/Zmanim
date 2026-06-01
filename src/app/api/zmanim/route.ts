import { NextRequest, NextResponse } from "next/server";
import { ComplexZmanimCalendar, GeoLocation, JewishCalendar } from "kosher-zmanim";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cal = any;

function toISO(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === "object" && "toISO" in (val as object)) {
    return (val as { toISO: () => string | null }).toISO();
  }
  if (val instanceof Date) return val.toISOString();
  return null;
}

function fmtDuration(ms: unknown): string | null {
  if (typeof ms !== "number" || isNaN(ms)) return null;
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")} min`;
}

function safe(fn: () => unknown): string | null {
  try { return toISO(fn()); } catch { return null; }
}

function safeDur(fn: () => unknown): string | null {
  try { return fmtDuration(fn()); } catch { return null; }
}

// For degree values not exposed as named methods (protected in base class)
function sunriseByDeg(cal: Cal, deg: number): string | null {
  try { return toISO(cal.getSunriseOffsetByDegrees(90 + deg)); } catch { return null; }
}
function sunsetByDeg(cal: Cal, deg: number): string | null {
  try { return toISO(cal.getSunsetOffsetByDegrees(90 + deg)); } catch { return null; }
}

// Halachic midnight = midpoint between tonight's sunset and tomorrow's sunrise.
// getMidnightTonight() in kosher-zmanim returns literal UTC midnight, so we compute manually.
function halachicMidnight(geo: GeoLocation, date: Date): string | null {
  try {
    const todayCal: Cal = new ComplexZmanimCalendar(geo);
    todayCal.setDate(date);
    const sunsetIso = toISO(todayCal.getSeaLevelSunset());
    if (!sunsetIso) return null;

    const tomorrow = new Date(date.getTime() + 86_400_000);
    const tomorrowCal: Cal = new ComplexZmanimCalendar(geo);
    tomorrowCal.setDate(tomorrow);
    const sunriseIso = toISO(tomorrowCal.getSeaLevelSunrise());
    if (!sunriseIso) return null;

    const mid = Math.round((new Date(sunsetIso).getTime() + new Date(sunriseIso).getTime()) / 2);
    return new Date(mid).toISOString();
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const elevation = parseFloat(searchParams.get("elevation") ?? "0") || 0;
  const timezone = searchParams.get("timezone") ?? "UTC";
  const dateStr = searchParams.get("date");
  const locationName = searchParams.get("locationName") ?? "Custom";

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });
  }

  // Use noon UTC so the date is always correct regardless of timezone / DST.
  // new Date("YYYY-MM-DD") parses as UTC midnight which becomes the *previous*
  // evening in westward timezones — noon UTC avoids that entirely.
  const date = dateStr ? new Date(dateStr + "T12:00:00Z") : new Date();

  const geo = new GeoLocation(locationName, lat, lng, elevation, timezone);
  const cal: Cal = new ComplexZmanimCalendar(geo);
  cal.setDate(date);

  // Detect Erev Pesach (14 Nisan) to conditionally include chametz zmanim
  let isErevPesach = false;
  try {
    const jc = new JewishCalendar(date);
    isErevPesach = jc.getJewishMonth() === 1 && jc.getJewishDayOfMonth() === 14;
  } catch { /* ignore */ }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {
    meta: {
      lat, lng, elevation, timezone, locationName,
      date: dateStr ?? date.toISOString().split("T")[0],
      isErevPesach,
    },

    alos: {
      alos26Degrees:       safe(() => cal.getAlos26Degrees()),       // R' Chaim Na'eh / Alter Rebbe (stringent) 26°
      alos19Point8Degrees: safe(() => cal.getAlos19Point8Degrees()), // Minhag EY / R' Tukachinsky 19.8°
      alosBaalHatanya:     safe(() => cal.getAlosBaalHatanya()),     // Alter Rebbe Default 16.9°
      alos16Point1Degrees: safe(() => cal.getAlos16Point1Degrees()), // Alter Rebbe (Other) & GRA 16.1°
    },

    misheyakir: {
      misheyakir11Point8Degrees: sunriseByDeg(cal, 11.8),                          // Nivreshes, Eidus L'Yisroel
      misheyakir11Point5Degrees: safe(() => cal.getMisheyakir11Point5Degrees()),    // Imanuel Halocho L'Ma'aseh
      misheyakir10Point2Degrees: safe(() => cal.getMisheyakir10Point2Degrees()),    // Beis Baruch, Birur Halocho (Default)
    },

    sunrise: {
      seaLevelSunrise: safe(() => cal.getSeaLevelSunrise()),
    },

    sofZmanShema: {
      sofZmanShmaMGA:        safe(() => cal.getSofZmanShmaMGA()),        // 3 prop. hours after alos (MGA)
      sofZmanShmaBaalHatanya: safe(() => cal.getSofZmanShmaBaalHatanya()), // Alter Rebbe Default
      sofZmanShmaGRA:        safe(() => cal.getSofZmanShmaGRA()),        // Alter Rebbe (Other) & GRA
    },

    sofZmanTefila: {
      sofZmanTfilaMGA:        safe(() => cal.getSofZmanTfilaMGA()),        // 4 prop. hours after alos (MGA)
      sofZmanTfilaBaalHatanya: safe(() => cal.getSofZmanTfilaBaalHatanya()), // Alter Rebbe Default
      sofZmanTfilaGRA:        safe(() => cal.getSofZmanTfilaGRA()),        // Alter Rebbe (Other) & GRA
    },

    chatzos: {
      chatzos:           safe(() => cal.getChatzos()),
      fixedLocalChatzos: safe(() => cal.getFixedLocalChatzos()),
    },

    minchaGedola: {
      minchaGedola:            safe(() => cal.getMinchaGedola()),            // GRA / Alter Rebbe (Other)
      minchaGedolaBaalHatanya: safe(() => cal.getMinchaGedolaBaalHatanya()), // Alter Rebbe Default
      minchaGedola72Minutes:   safe(() => cal.getMinchaGedola72Minutes()),   // MGA
    },

    minchaKetana: {
      minchaKetana:            safe(() => cal.getMinchaKetana()),            // GRA / Alter Rebbe (Other)
      minchaKetanaBaalHatanya: safe(() => cal.getMinchaKetanaBaalHatanya()), // Alter Rebbe Default
      minchaKetana72Minutes:   safe(() => cal.getMinchaKetana72Minutes()),   // MGA
    },

    plagHamincha: {
      plagHamincha:                safe(() => cal.getPlagHamincha()),                // GRA / Alter Rebbe (Other)
      plagHaminchaBaalHatanya:     safe(() => cal.getPlagHaminchaBaalHatanya()),     // Alter Rebbe Default
      plagHamincha72MinutesZmanis: safe(() => cal.getPlagHamincha72MinutesZmanis()), // MGA
    },

    sunset: {
      seaLevelSunset:    safe(() => cal.getSeaLevelSunset()),
      sunsetBaalHatanya: safe(() => cal.getSunsetBaalHatanya()), // Alter Rebbe / Baal HaTanya
    },

    tzait: {
      tzaisGeonim5Point83Degrees: sunsetByDeg(cal, 5.83),                          // Alter Rebbe (R' Berel Levin) ~23 min
      tzaisBaalHatanya:           safe(() => cal.getTzaisBaalHatanya()),            // Alter Rebbe Default 6° ~24 min
      tzaisGeonim6Point3Degrees:  sunsetByDeg(cal, 6.3),                           // Alter Rebbe (R' Avrohom Altein) ~26 min
      tzaisGeonim6Point83Degrees: sunsetByDeg(cal, 6.83),                          // Alter Rebbe (R' Berel Levin) ~28 min
      tzaisGeonim7Point083Degrees: safe(() => cal.getTzaisGeonim7Point083Degrees()), // Melamed L'Ho'il ~30 min
      tzaisGeonim8Point5Degrees:  safe(() => cal.getTzaisGeonim8Point5Degrees()),   // R' Tukachinsky / Igros Moshe ~36 min
      tzais72:                    safe(() => cal.getTzais72()),                     // Rabbeinu Tam 72 fixed min
    },

    midnight: {
      midnightTonight: halachicMidnight(geo, date),
    },

    shaahZmanis: {
      shaahZmanisGra:              safeDur(() => cal.getShaahZmanisGra()),              // GRA (hanetz–shkiah)
      shaahZmanisBaalHatanya:      safeDur(() => cal.getShaahZmanisBaalHatanya()),      // Alter Rebbe Default (amiti)
      shaahZmanis16Point1Degrees:  safeDur(() => cal.getShaahZmanis16Point1Degrees()),  // MGA (alos–tzeit 16.1°)
    },
  };

  if (isErevPesach) {
    result.chametz = {
      sofZmanAchilasChametzGRA:         safe(() => cal.getSofZmanAchilasChametzGRA()),
      sofZmanAchilasChametzMGA72Minutes: safe(() => cal.getSofZmanAchilasChametzMGA72Minutes()),
      sofZmanAchilasChametzBaalHatanya:  safe(() => cal.getSofZmanAchilasChametzBaalHatanya()),
      sofZmanBiurChametzGRA:            safe(() => cal.getSofZmanBiurChametzGRA()),
      sofZmanBiurChametzMGA72Minutes:   safe(() => cal.getSofZmanBiurChametzMGA72Minutes()),
      sofZmanBiurChametzBaalHatanya:    safe(() => cal.getSofZmanBiurChametzBaalHatanya()),
    };
  }

  return NextResponse.json(result);
}
