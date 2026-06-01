import { NextRequest, NextResponse } from "next/server";
import { ComplexZmanimCalendar, GeoLocation, JewishCalendar } from "kosher-zmanim";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cal = any;

function toISO(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === "object" && "toISO" in (val as object))
    return (val as { toISO: () => string | null }).toISO();
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
function sunriseByDeg(cal: Cal, deg: number): string | null {
  try { return toISO(cal.getSunriseOffsetByDegrees(90 + deg)); } catch { return null; }
}
function sunsetByDeg(cal: Cal, deg: number): string | null {
  try { return toISO(cal.getSunsetOffsetByDegrees(90 + deg)); } catch { return null; }
}

function halachicMidnight(geo: GeoLocation, date: Date): string | null {
  try {
    const c1: Cal = new ComplexZmanimCalendar(geo); c1.setDate(date);
    const sunsetIso = toISO(c1.getSeaLevelSunset()); if (!sunsetIso) return null;
    const c2: Cal = new ComplexZmanimCalendar(geo);
    c2.setDate(new Date(date.getTime() + 86_400_000));
    const sunriseIso = toISO(c2.getSeaLevelSunrise()); if (!sunriseIso) return null;
    return new Date(Math.round((new Date(sunsetIso).getTime() + new Date(sunriseIso).getTime()) / 2)).toISOString();
  } catch { return null; }
}

// Tzeit values reusable for both tzait and motzaei sections
function tzaitValues(cal: Cal): Record<string, string | null> {
  return {
    tzaisGeonim5Point83Degrees: sunsetByDeg(cal, 5.83),
    tzaisBaalHatanya:           safe(() => cal.getTzaisBaalHatanya()),
    tzaisGeonim6Point3Degrees:  sunsetByDeg(cal, 6.3),
    tzaisGeonim6Point83Degrees: sunsetByDeg(cal, 6.83),
    tzaisGeonim7Point083Degrees: safe(() => cal.getTzaisGeonim7Point083Degrees()),
    tzaisGeonim8Point5Degrees:  safe(() => cal.getTzaisGeonim8Point5Degrees()),
    tzais72:                    safe(() => cal.getTzais72()),
  };
}

// ── Hebrew calendar helpers ──────────────────────────────────────────────────

const HEBREW_MONTHS = [
  "", "Nissan", "Iyar", "Sivan", "Tamuz", "Av", "Elul",
  "Tishrei", "Cheshvan", "Kislev", "Teves", "Shevat", "Adar", "Adar II",
];

function getSpecialDayName(jc: JewishCalendar): string | null {
  const m  = jc.getJewishMonth();
  const d  = jc.getJewishDayOfMonth();
  const dow = jc.getDayOfWeek(); // 1=Sun … 7=Sat
  let isLeap = false;
  try { isLeap = jc.isJewishLeapYear(); } catch {}

  // Tishrei
  if (m === 7) {
    if (d === 1 || d === 2)               return "Rosh Hashana";
    if ((d === 3 && dow !== 7) || (d === 4 && dow === 1)) return "Tzom Gedalya";
    if (d === 9)                           return "Erev Yom Kippur";
    if (d === 10)                          return "Yom Kippur";
    if (d === 14)                          return "Erev Sukkos";
    if (d === 15 || d === 16)              return "Sukkos";
    if (d >= 17 && d <= 20)               return "Chol HaMoed Sukkos";
    if (d === 21)                          return "Hoshana Raba";
    if (d === 22)                          return "Shmini Atzeres";
    if (d === 23)                          return "Simchas Torah";
  }

  // Chanukah
  try {
    const chanDay = jc.getDayOfChanukah();
    if (chanDay > 0) return `Chanukah — Day ${chanDay}`;
  } catch {}

  if (m === 10 && d === 10)              return "10 Teves (Fast)";
  if (m === 11 && d === 15)              return "Tu B'Shvat";

  // Purim
  const adarII = isLeap ? 13 : 12;
  if (m === adarII) {
    if ((d === 13 && dow !== 7) || (d === 11 && dow === 5)) return "Ta'anis Esther";
    if (d === 14) return "Purim";
    if (d === 15) return "Shushan Purim";
  }
  if (isLeap && m === 12) {
    if (d === 14) return "Purim Katan";
    if (d === 15) return "Shushan Purim Katan";
  }

  // Nissan
  if (m === 1) {
    if (d === 14)               return "Erev Pesach";
    if (d === 15 || d === 16)   return "Pesach";
    if (d >= 17 && d <= 20)     return "Chol HaMoed Pesach";
    if (d === 21 || d === 22)   return "Pesach";
  }

  if (m === 2 && d === 18)                return "Lag BaOmer";
  if (m === 3 && (d === 6 || d === 7))    return "Shavuos";

  // 17 Tamuz (pushed when Shabbos)
  if ((m === 4 && d === 17 && dow !== 7) || (m === 4 && d === 18 && dow === 1))
    return "17 Tamuz (Fast)";

  // Tisha B'Av (pushed when Shabbos)
  if ((m === 5 && d === 9 && dow !== 7) || (m === 5 && d === 10 && dow === 1))
    return "Tisha B'Av";

  if (dow === 7) return "Shabbos";

  let isRC = false;
  try { isRC = jc.isRoshChodesh(); } catch {}
  if (isRC) {
    const rcMonth = d === 30 ? (m < 13 ? m + 1 : 1) : m;
    return `Rosh Chodesh ${HEBREW_MONTHS[rcMonth] ?? ""}`;
  }

  return null;
}

function analyzeJewishCalendar(date: Date) {
  try {
    const jc  = new JewishCalendar(date);
    const m   = jc.getJewishMonth();
    const d   = jc.getJewishDayOfMonth();
    const y   = jc.getJewishYear();
    const dow = jc.getDayOfWeek();

    const isFriday  = dow === 6;
    const isShabbos = dow === 7;

    let isErevYomTov = false, isYomTov = false;
    let isTaanit = false, isRoshChodesh = false;
    try { isErevYomTov = jc.isErevYomTov(); }    catch {}
    try { isYomTov     = jc.isYomTov(); }         catch {}
    try { isTaanit     = jc.isTaanis(); }          catch {}
    try { isRoshChodesh = jc.isRoshChodesh(); }    catch {}

    const isYomKippur  = m === 7  && d === 10;
    const isTishaBAv   = (m === 5 && d === 9 && dow !== 7) || (m === 5 && d === 10 && dow === 1);
    const isMinorFast  = isTaanit && !isYomKippur && !isTishaBAv;
    const isErevPesach = m === 1  && d === 14;

    let isChanukah = false;
    try { isChanukah = jc.getDayOfChanukah() > 0; } catch {}

    const specialDay = getSpecialDayName(jc);
    const jewishDate = `${d} ${HEBREW_MONTHS[m] ?? ""} ${y}`;

    // What label to use for motzaei (tomorrow / end of today)
    let motzaeiLabel: string | null = null;
    if (isFriday || (isErevYomTov && !isShabbos)) motzaeiLabel = "Motzaei Shabbos";
    if (isErevYomTov && !isFriday)                 motzaeiLabel = "Motzaei Yom Tov";
    if (isShabbos)                                  motzaeiLabel = "Motzaei Shabbos";
    if (isYomTov && !isShabbos)                     motzaeiLabel = "Motzaei Yom Tov";

    return {
      jewishDate, specialDay,
      isFriday, isShabbos,
      isErevYomTov, isYomTov,
      isTaanit, isMinorFast, isYomKippur, isTishaBAv,
      isRoshChodesh, isChanukah,
      isErevPesach,
      needsCandleLighting: isFriday || isErevYomTov,
      motzaeiLabel,
    };
  } catch {
    return {
      jewishDate: "", specialDay: null,
      isFriday: false, isShabbos: false,
      isErevYomTov: false, isYomTov: false,
      isTaanit: false, isMinorFast: false, isYomKippur: false, isTishaBAv: false,
      isRoshChodesh: false, isChanukah: false,
      isErevPesach: false,
      needsCandleLighting: false,
      motzaeiLabel: null,
    };
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat          = parseFloat(searchParams.get("lat") ?? "");
  const lng          = parseFloat(searchParams.get("lng") ?? "");
  const elevation    = parseFloat(searchParams.get("elevation") ?? "0") || 0;
  const timezone     = searchParams.get("timezone") ?? "UTC";
  const dateStr      = searchParams.get("date");
  const locationName = searchParams.get("locationName") ?? "Custom";

  if (isNaN(lat) || isNaN(lng))
    return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });

  // Noon UTC avoids DST / midnight-crossing issues across all timezones
  const date = dateStr ? new Date(dateStr + "T12:00:00Z") : new Date();

  const geo = new GeoLocation(locationName, lat, lng, elevation, timezone);
  const cal: Cal = new ComplexZmanimCalendar(geo);
  cal.setDate(date);

  const jewish = analyzeJewishCalendar(date);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};

  result.meta = {
    lat, lng, elevation, timezone, locationName,
    date: dateStr ?? date.toISOString().split("T")[0],
    jewish,
  };

  // ── Candle lighting (Erev Shabbos / Erev Yom Tov) ──────────────────────────
  if (jewish.needsCandleLighting) {
    const nextCal: Cal = new ComplexZmanimCalendar(geo);
    nextCal.setDate(new Date(date.getTime() + 86_400_000));

    // 18 min before today's sunset
    const candleLighting18 = (() => {
      try {
        const iso = toISO(cal.getSeaLevelSunset());
        if (!iso) return null;
        return new Date(new Date(iso).getTime() - 18 * 60_000).toISOString();
      } catch { return null; }
    })();

    // Motzaei times = next day's tzeit, prefixed so UI can style them smaller
    const nextTzait = tzaitValues(nextCal);
    const motzaei = Object.fromEntries(
      Object.entries(nextTzait).map(([k, v]) => [`motzaei_${k}`, v])
    );

    result.candleLighting = { candleLighting18, ...motzaei };
  }

  // ── Regular daily sections ──────────────────────────────────────────────────
  result.alos = {
    alos26Degrees:       safe(() => cal.getAlos26Degrees()),
    alos19Point8Degrees: safe(() => cal.getAlos19Point8Degrees()),
    alosBaalHatanya:     safe(() => cal.getAlosBaalHatanya()),
    alos16Point1Degrees: safe(() => cal.getAlos16Point1Degrees()),
  };

  result.misheyakir = {
    misheyakir11Point8Degrees: sunriseByDeg(cal, 11.8),
    misheyakir11Point5Degrees: safe(() => cal.getMisheyakir11Point5Degrees()),
    misheyakir10Point2Degrees: safe(() => cal.getMisheyakir10Point2Degrees()),
  };

  result.sunrise = { seaLevelSunrise: safe(() => cal.getSeaLevelSunrise()) };

  result.sofZmanShema = {
    sofZmanShmaMGA:         safe(() => cal.getSofZmanShmaMGA()),
    sofZmanShmaBaalHatanya: safe(() => cal.getSofZmanShmaBaalHatanya()),
    sofZmanShmaGRA:         safe(() => cal.getSofZmanShmaGRA()),
  };

  result.sofZmanTefila = {
    sofZmanTfilaMGA:         safe(() => cal.getSofZmanTfilaMGA()),
    sofZmanTfilaBaalHatanya: safe(() => cal.getSofZmanTfilaBaalHatanya()),
    sofZmanTfilaGRA:         safe(() => cal.getSofZmanTfilaGRA()),
  };

  result.chatzos = {
    chatzos:           safe(() => cal.getChatzos()),
    fixedLocalChatzos: safe(() => cal.getFixedLocalChatzos()),
  };

  result.minchaGedola = {
    minchaGedola:            safe(() => cal.getMinchaGedola()),
    minchaGedolaBaalHatanya: safe(() => cal.getMinchaGedolaBaalHatanya()),
    minchaGedola72Minutes:   safe(() => cal.getMinchaGedola72Minutes()),
  };

  result.minchaKetana = {
    minchaKetana:            safe(() => cal.getMinchaKetana()),
    minchaKetanaBaalHatanya: safe(() => cal.getMinchaKetanaBaalHatanya()),
    minchaKetana72Minutes:   safe(() => cal.getMinchaKetana72Minutes()),
  };

  result.plagHamincha = {
    plagHamincha:                safe(() => cal.getPlagHamincha()),
    plagHaminchaBaalHatanya:     safe(() => cal.getPlagHaminchaBaalHatanya()),
    plagHamincha72MinutesZmanis: safe(() => cal.getPlagHamincha72MinutesZmanis()),
  };

  result.sunset = {
    seaLevelSunset:    safe(() => cal.getSeaLevelSunset()),
    sunsetBaalHatanya: safe(() => cal.getSunsetBaalHatanya()),
  };

  result.tzait = tzaitValues(cal);

  result.midnight = { midnightTonight: halachicMidnight(geo, date) };

  result.shaahZmanis = {
    shaahZmanisGra:             safeDur(() => cal.getShaahZmanisGra()),
    shaahZmanisBaalHatanya:     safeDur(() => cal.getShaahZmanisBaalHatanya()),
    shaahZmanis16Point1Degrees: safeDur(() => cal.getShaahZmanis16Point1Degrees()),
  };

  // ── Conditional: Chametz (Erev Pesach 14 Nisan) ────────────────────────────
  if (jewish.isErevPesach) {
    result.chametz = {
      sofZmanAchilasChametzGRA:          safe(() => cal.getSofZmanAchilasChametzGRA()),
      sofZmanAchilasChametzMGA72Minutes: safe(() => cal.getSofZmanAchilasChametzMGA72Minutes()),
      sofZmanAchilasChametzBaalHatanya:  safe(() => cal.getSofZmanAchilasChametzBaalHatanya()),
      sofZmanBiurChametzGRA:             safe(() => cal.getSofZmanBiurChametzGRA()),
      sofZmanBiurChametzMGA72Minutes:    safe(() => cal.getSofZmanBiurChametzMGA72Minutes()),
      sofZmanBiurChametzBaalHatanya:     safe(() => cal.getSofZmanBiurChametzBaalHatanya()),
    };
  }

  return NextResponse.json(result);
}
