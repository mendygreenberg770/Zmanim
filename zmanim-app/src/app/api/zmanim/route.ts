import { NextRequest, NextResponse } from "next/server";
import { ComplexZmanimCalendar, GeoLocation } from "kosher-zmanim";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cal = any;

function toISO(val: unknown): string | null {
  if (val == null) return null;
  // Luxon DateTime
  if (typeof val === "object" && "toISO" in (val as object)) {
    const iso = (val as { toISO: () => string | null }).toISO();
    return iso;
  }
  // JS Date
  if (val instanceof Date) return val.toISOString();
  return null;
}

function fmtDuration(ms: unknown): string | null {
  if (typeof ms !== "number" || isNaN(ms)) return null;
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

function safe(fn: () => unknown): string | null {
  try {
    return toISO(fn());
  } catch {
    return null;
  }
}

function safeDur(fn: () => unknown): string | null {
  try {
    return fmtDuration(fn());
  } catch {
    return null;
  }
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

  const geo = new GeoLocation(locationName, lat, lng, elevation, timezone);
  const cal: Cal = new ComplexZmanimCalendar(geo);

  const date = dateStr ? new Date(dateStr) : new Date();
  cal.setDate(date);

  const result = {
    meta: {
      lat,
      lng,
      elevation,
      timezone,
      locationName,
      date: date.toISOString().split("T")[0],
    },
    astronomical: {
      sunrise: safe(() => cal.getSunrise()),
      seaLevelSunrise: safe(() => cal.getSeaLevelSunrise()),
      sunset: safe(() => cal.getSunset()),
      seaLevelSunset: safe(() => cal.getSeaLevelSunset()),
      sunTransit: safe(() => cal.getSunTransit()),
      solarMidnight: safe(() => cal.getSolarMidnight()),
      beginAstronomicalTwilight: safe(() => cal.getBeginAstronomicalTwilight()),
      endAstronomicalTwilight: safe(() => cal.getEndAstronomicalTwilight()),
      beginNauticalTwilight: safe(() => cal.getBeginNauticalTwilight()),
      endNauticalTwilight: safe(() => cal.getEndNauticalTwilight()),
      beginCivilTwilight: safe(() => cal.getBeginCivilTwilight()),
      endCivilTwilight: safe(() => cal.getEndCivilTwilight()),
      localMeanTime: safe(() => cal.getLocalMeanTime()),
    },
    alos: {
      alos72: safe(() => cal.getAlos72()),
      alosHashachar: safe(() => cal.getAlosHashachar()),
      alos60: safe(() => cal.getAlos60()),
      alos90: safe(() => cal.getAlos90()),
      alos90Zmanis: safe(() => cal.getAlos90Zmanis()),
      alos96: safe(() => cal.getAlos96()),
      alos96Zmanis: safe(() => cal.getAlos96Zmanis()),
      alos120: safe(() => cal.getAlos120()),
      alos120Zmanis: safe(() => cal.getAlos120Zmanis()),
      alos72Zmanis: safe(() => cal.getAlos72Zmanis()),
      alos16Point1Degrees: safe(() => cal.getAlos16Point1Degrees()),
      alos18Degrees: safe(() => cal.getAlos18Degrees()),
      alos19Degrees: safe(() => cal.getAlos19Degrees()),
      alos19Point8Degrees: safe(() => cal.getAlos19Point8Degrees()),
      alos26Degrees: safe(() => cal.getAlos26Degrees()),
      alosBaalHatanya: safe(() => cal.getAlosBaalHatanya()),
    },
    misheyakir: {
      misheyakir7Point65Degrees: safe(() => cal.getMisheyakir7Point65Degrees()),
      misheyakir9Point5Degrees: safe(() => cal.getMisheyakir9Point5Degrees()),
      misheyakir10Point2Degrees: safe(() => cal.getMisheyakir10Point2Degrees()),
      misheyakir11Degrees: safe(() => cal.getMisheyakir11Degrees()),
      misheyakir11Point5Degrees: safe(() => cal.getMisheyakir11Point5Degrees()),
    },
    sunrise: {
      sunrise: safe(() => cal.getSunrise()),
      elevationAdjustedSunrise: safe(() => cal.getElevationAdjustedSunrise()),
      sunriseBaalHatanya: safe(() => cal.getSunriseBaalHatanya()),
    },
    sofZmanShema: {
      sofZmanShmaGRA: safe(() => cal.getSofZmanShmaGRA()),
      sofZmanShmaMGA: safe(() => cal.getSofZmanShmaMGA()),
      sofZmanShmaMGA72Minutes: safe(() => cal.getSofZmanShmaMGA72Minutes()),
      sofZmanShmaMGA72MinutesZmanis: safe(() => cal.getSofZmanShmaMGA72MinutesZmanis()),
      sofZmanShmaMGA90Minutes: safe(() => cal.getSofZmanShmaMGA90Minutes()),
      sofZmanShmaMGA90MinutesZmanis: safe(() => cal.getSofZmanShmaMGA90MinutesZmanis()),
      sofZmanShmaMGA96Minutes: safe(() => cal.getSofZmanShmaMGA96Minutes()),
      sofZmanShmaMGA96MinutesZmanis: safe(() => cal.getSofZmanShmaMGA96MinutesZmanis()),
      sofZmanShmaMGA120Minutes: safe(() => cal.getSofZmanShmaMGA120Minutes()),
      sofZmanShmaMGA16Point1Degrees: safe(() => cal.getSofZmanShmaMGA16Point1Degrees()),
      sofZmanShmaMGA18Degrees: safe(() => cal.getSofZmanShmaMGA18Degrees()),
      sofZmanShmaMGA19Point8Degrees: safe(() => cal.getSofZmanShmaMGA19Point8Degrees()),
      sofZmanShmaAteretTorah: safe(() => cal.getSofZmanShmaAteretTorah()),
      sofZmanShmaBaalHatanya: safe(() => cal.getSofZmanShmaBaalHatanya()),
      sofZmanShmaKolEliyahu: safe(() => cal.getSofZmanShmaKolEliyahu()),
      sofZmanShmaFixedLocal: safe(() => cal.getSofZmanShmaFixedLocal()),
      sofZmanShma3HoursBeforeChatzos: safe(() => cal.getSofZmanShma3HoursBeforeChatzos()),
      sofZmanShmaAlos16Point1ToSunset: safe(() => cal.getSofZmanShmaAlos16Point1ToSunset()),
      sofZmanShmaAlos16Point1ToTzaisGeonim7Point083Degrees: safe(() =>
        cal.getSofZmanShmaAlos16Point1ToTzaisGeonim7Point083Degrees()
      ),
      sofZmanShmaGRASunriseToFixedLocalChatzos: safe(() =>
        cal.getSofZmanShmaGRASunriseToFixedLocalChatzos()
      ),
      sofZmanShmaMGA16Point1DegreesToFixedLocalChatzos: safe(() =>
        cal.getSofZmanShmaMGA16Point1DegreesToFixedLocalChatzos()
      ),
      sofZmanShmaMGA72MinutesToFixedLocalChatzos: safe(() =>
        cal.getSofZmanShmaMGA72MinutesToFixedLocalChatzos()
      ),
      sofZmanShmaMGA90MinutesToFixedLocalChatzos: safe(() =>
        cal.getSofZmanShmaMGA90MinutesToFixedLocalChatzos()
      ),
      sofZmanShmaMGA18DegreesToFixedLocalChatzos: safe(() =>
        cal.getSofZmanShmaMGA18DegreesToFixedLocalChatzos()
      ),
    },
    sofZmanTefila: {
      sofZmanTfilaGRA: safe(() => cal.getSofZmanTfilaGRA()),
      sofZmanTfilaMGA: safe(() => cal.getSofZmanTfilaMGA()),
      sofZmanTfilaMGA72Minutes: safe(() => cal.getSofZmanTfilaMGA72Minutes()),
      sofZmanTfilaMGA72MinutesZmanis: safe(() => cal.getSofZmanTfilaMGA72MinutesZmanis()),
      sofZmanTfilaMGA90Minutes: safe(() => cal.getSofZmanTfilaMGA90Minutes()),
      sofZmanTfilaMGA90MinutesZmanis: safe(() => cal.getSofZmanTfilaMGA90MinutesZmanis()),
      sofZmanTfilaMGA96Minutes: safe(() => cal.getSofZmanTfilaMGA96Minutes()),
      sofZmanTfilaMGA96MinutesZmanis: safe(() => cal.getSofZmanTfilaMGA96MinutesZmanis()),
      sofZmanTfilaMGA120Minutes: safe(() => cal.getSofZmanTfilaMGA120Minutes()),
      sofZmanTfilaMGA16Point1Degrees: safe(() => cal.getSofZmanTfilaMGA16Point1Degrees()),
      sofZmanTfilaMGA18Degrees: safe(() => cal.getSofZmanTfilaMGA18Degrees()),
      sofZmanTfilaMGA19Point8Degrees: safe(() => cal.getSofZmanTfilaMGA19Point8Degrees()),
      sofZmanTfilaAteretTorah: safe(() => cal.getSofZmanTfilaAteretTorah()),
      sofZmanTfilahAteretTorah: safe(() => cal.getSofZmanTfilahAteretTorah()),
      sofZmanTfilaBaalHatanya: safe(() => cal.getSofZmanTfilaBaalHatanya()),
      sofZmanTfilaFixedLocal: safe(() => cal.getSofZmanTfilaFixedLocal()),
      sofZmanTfila2HoursBeforeChatzos: safe(() => cal.getSofZmanTfila2HoursBeforeChatzos()),
      sofZmanTfilaGRASunriseToFixedLocalChatzos: safe(() =>
        cal.getSofZmanTfilaGRASunriseToFixedLocalChatzos()
      ),
    },
    chatzos: {
      chatzos: safe(() => cal.getChatzos()),
      chatzosAsHalfDay: safe(() => cal.getChatzosAsHalfDay()),
      fixedLocalChatzos: safe(() => cal.getFixedLocalChatzos()),
      midnightLastNight: safe(() => cal.getMidnightLastNight()),
      midnightTonight: safe(() => cal.getMidnightTonight()),
    },
    minchaGedola: {
      minchaGedola: safe(() => cal.getMinchaGedola()),
      minchaGedola30Minutes: safe(() => cal.getMinchaGedola30Minutes()),
      minchaGedola72Minutes: safe(() => cal.getMinchaGedola72Minutes()),
      minchaGedola16Point1Degrees: safe(() => cal.getMinchaGedola16Point1Degrees()),
      minchaGedolaGreaterThan30: safe(() => cal.getMinchaGedolaGreaterThan30()),
      minchaGedolaAhavatShalom: safe(() => cal.getMinchaGedolaAhavatShalom()),
      minchaGedolaAteretTorah: safe(() => cal.getMinchaGedolaAteretTorah()),
      minchaGedolaBaalHatanya: safe(() => cal.getMinchaGedolaBaalHatanya()),
      minchaGedolaBaalHatanyaGreaterThan30: safe(() =>
        cal.getMinchaGedolaBaalHatanyaGreaterThan30()
      ),
      minchaGedolaGRAFixedLocalChatzos30Minutes: safe(() =>
        cal.getMinchaGedolaGRAFixedLocalChatzos30Minutes()
      ),
    },
    minchaKetana: {
      minchaKetana: safe(() => cal.getMinchaKetana()),
      minchaKetana16Point1Degrees: safe(() => cal.getMinchaKetana16Point1Degrees()),
      minchaKetana72Minutes: safe(() => cal.getMinchaKetana72Minutes()),
      minchaKetanaAhavatShalom: safe(() => cal.getMinchaKetanaAhavatShalom()),
      minchaKetanaAteretTorah: safe(() => cal.getMinchaKetanaAteretTorah()),
      minchaKetanaBaalHatanya: safe(() => cal.getMinchaKetanaBaalHatanya()),
      minchaKetanaGRAFixedLocalChatzosToSunset: safe(() =>
        cal.getMinchaKetanaGRAFixedLocalChatzosToSunset()
      ),
      samuchLeMinchaKetanaGRA: safe(() => cal.getSamuchLeMinchaKetanaGRA()),
      samuchLeMinchaKetana16Point1Degrees: safe(() =>
        cal.getSamuchLeMinchaKetana16Point1Degrees()
      ),
      samuchLeMinchaKetana72Minutes: safe(() => cal.getSamuchLeMinchaKetana72Minutes()),
    },
    plagHamincha: {
      plagHamincha: safe(() => cal.getPlagHamincha()),
      plagHamincha60Minutes: safe(() => cal.getPlagHamincha60Minutes()),
      plagHamincha72Minutes: safe(() => cal.getPlagHamincha72Minutes()),
      plagHamincha72MinutesZmanis: safe(() => cal.getPlagHamincha72MinutesZmanis()),
      plagHamincha90Minutes: safe(() => cal.getPlagHamincha90Minutes()),
      plagHamincha90MinutesZmanis: safe(() => cal.getPlagHamincha90MinutesZmanis()),
      plagHamincha96Minutes: safe(() => cal.getPlagHamincha96Minutes()),
      plagHamincha96MinutesZmanis: safe(() => cal.getPlagHamincha96MinutesZmanis()),
      plagHamincha120Minutes: safe(() => cal.getPlagHamincha120Minutes()),
      plagHamincha120MinutesZmanis: safe(() => cal.getPlagHamincha120MinutesZmanis()),
      plagHamincha16Point1Degrees: safe(() => cal.getPlagHamincha16Point1Degrees()),
      plagHamincha18Degrees: safe(() => cal.getPlagHamincha18Degrees()),
      plagHamincha19Point8Degrees: safe(() => cal.getPlagHamincha19Point8Degrees()),
      plagHamincha26Degrees: safe(() => cal.getPlagHamincha26Degrees()),
      plagHaminchaAteretTorah: safe(() => cal.getPlagHaminchaAteretTorah()),
      plagHaminchaBaalHatanya: safe(() => cal.getPlagHaminchaBaalHatanya()),
      plagAhavatShalom: safe(() => cal.getPlagAhavatShalom()),
      plagAlosToSunset: safe(() => cal.getPlagAlosToSunset()),
      plagAlos16Point1ToTzaisGeonim7Point083Degrees: safe(() =>
        cal.getPlagAlos16Point1ToTzaisGeonim7Point083Degrees()
      ),
    },
    sunset: {
      sunset: safe(() => cal.getSunset()),
      elevationAdjustedSunset: safe(() => cal.getElevationAdjustedSunset()),
      sunsetBaalHatanya: safe(() => cal.getSunsetBaalHatanya()),
      candleLighting: safe(() => cal.getCandleLighting()),
    },
    beinHashmashos: {
      bainHashmashosRT13Point24Degrees: safe(() =>
        cal.getBainHashmashosRT13Point24Degrees()
      ),
      bainHashmashosRT13Point5MinutesBefore7Point083Degrees: safe(() =>
        cal.getBainHashmashosRT13Point5MinutesBefore7Point083Degrees()
      ),
      bainHashmashosRT2Stars: safe(() => cal.getBainHashmashosRT2Stars()),
      bainHashmashosRT58Point5Minutes: safe(() => cal.getBainHashmashosRT58Point5Minutes()),
      bainHashmashosYereim13Point5Minutes: safe(() =>
        cal.getBainHashmashosYereim13Point5Minutes()
      ),
      bainHashmashosYereim16Point875Minutes: safe(() =>
        cal.getBainHashmashosYereim16Point875Minutes()
      ),
      bainHashmashosYereim18Minutes: safe(() => cal.getBainHashmashosYereim18Minutes()),
      bainHashmashosYereim2Point1Degrees: safe(() =>
        cal.getBainHashmashosYereim2Point1Degrees()
      ),
      bainHashmashosYereim2Point8Degrees: safe(() =>
        cal.getBainHashmashosYereim2Point8Degrees()
      ),
      bainHashmashosYereim3Point05Degrees: safe(() =>
        cal.getBainHashmashosYereim3Point05Degrees()
      ),
    },
    tzait: {
      tzais: safe(() => cal.getTzais()),
      tzais72: safe(() => cal.getTzais72()),
      tzais72Zmanis: safe(() => cal.getTzais72Zmanis()),
      tzais50: safe(() => cal.getTzais50()),
      tzais60: safe(() => cal.getTzais60()),
      tzais90: safe(() => cal.getTzais90()),
      tzais90Zmanis: safe(() => cal.getTzais90Zmanis()),
      tzais96: safe(() => cal.getTzais96()),
      tzais96Zmanis: safe(() => cal.getTzais96Zmanis()),
      tzais120: safe(() => cal.getTzais120()),
      tzais120Zmanis: safe(() => cal.getTzais120Zmanis()),
      tzais16Point1Degrees: safe(() => cal.getTzais16Point1Degrees()),
      tzais18Degrees: safe(() => cal.getTzais18Degrees()),
      tzais19Point8Degrees: safe(() => cal.getTzais19Point8Degrees()),
      tzais26Degrees: safe(() => cal.getTzais26Degrees()),
      tzaisAteretTorah: safe(() => cal.getTzaisAteretTorah()),
      tzaisBaalHatanya: safe(() => cal.getTzaisBaalHatanya()),
      tzaisGeonim3Point65Degrees: safe(() => cal.getTzaisGeonim3Point65Degrees()),
      tzaisGeonim3Point676Degrees: safe(() => cal.getTzaisGeonim3Point676Degrees()),
      tzaisGeonim3Point7Degrees: safe(() => cal.getTzaisGeonim3Point7Degrees()),
      tzaisGeonim3Point8Degrees: safe(() => cal.getTzaisGeonim3Point8Degrees()),
      tzaisGeonim4Point37Degrees: safe(() => cal.getTzaisGeonim4Point37Degrees()),
      tzaisGeonim4Point61Degrees: safe(() => cal.getTzaisGeonim4Point61Degrees()),
      tzaisGeonim4Point8Degrees: safe(() => cal.getTzaisGeonim4Point8Degrees()),
      tzaisGeonim5Point88Degrees: safe(() => cal.getTzaisGeonim5Point88Degrees()),
      tzaisGeonim5Point95Degrees: safe(() => cal.getTzaisGeonim5Point95Degrees()),
      tzaisGeonim6Point45Degrees: safe(() => cal.getTzaisGeonim6Point45Degrees()),
      tzaisGeonim7Point083Degrees: safe(() => cal.getTzaisGeonim7Point083Degrees()),
      tzaisGeonim7Point67Degrees: safe(() => cal.getTzaisGeonim7Point67Degrees()),
      tzaisGeonim8Point5Degrees: safe(() => cal.getTzaisGeonim8Point5Degrees()),
      tzaisGeonim9Point3Degrees: safe(() => cal.getTzaisGeonim9Point3Degrees()),
      tzaisGeonim9Point75Degrees: safe(() => cal.getTzaisGeonim9Point75Degrees()),
    },
    shaahZmanis: {
      shaahZmanisGra: safeDur(() => cal.getShaahZmanisGra()),
      shaahZmanisMGA: safeDur(() => cal.getShaahZmanisMGA()),
      shaahZmanis60Minutes: safeDur(() => cal.getShaahZmanis60Minutes()),
      shaahZmanis72Minutes: safeDur(() => cal.getShaahZmanis72Minutes()),
      shaahZmanis72MinutesZmanis: safeDur(() => cal.getShaahZmanis72MinutesZmanis()),
      shaahZmanis90Minutes: safeDur(() => cal.getShaahZmanis90Minutes()),
      shaahZmanis90MinutesZmanis: safeDur(() => cal.getShaahZmanis90MinutesZmanis()),
      shaahZmanis96Minutes: safeDur(() => cal.getShaahZmanis96Minutes()),
      shaahZmanis96MinutesZmanis: safeDur(() => cal.getShaahZmanis96MinutesZmanis()),
      shaahZmanis120Minutes: safeDur(() => cal.getShaahZmanis120Minutes()),
      shaahZmanis120MinutesZmanis: safeDur(() => cal.getShaahZmanis120MinutesZmanis()),
      shaahZmanis16Point1Degrees: safeDur(() => cal.getShaahZmanis16Point1Degrees()),
      shaahZmanis18Degrees: safeDur(() => cal.getShaahZmanis18Degrees()),
      shaahZmanis19Point8Degrees: safeDur(() => cal.getShaahZmanis19Point8Degrees()),
      shaahZmanis26Degrees: safeDur(() => cal.getShaahZmanis26Degrees()),
      shaahZmanisAteretTorah: safeDur(() => cal.getShaahZmanisAteretTorah()),
      shaahZmanisBaalHatanya: safeDur(() => cal.getShaahZmanisBaalHatanya()),
      shaahZmanisAlos16Point1ToTzais3Point7: safeDur(() =>
        cal.getShaahZmanisAlos16Point1ToTzais3Point7()
      ),
      shaahZmanisAlos16Point1ToTzais3Point8: safeDur(() =>
        cal.getShaahZmanisAlos16Point1ToTzais3Point8()
      ),
    },
    chametz: {
      sofZmanAchilasChametzGRA: safe(() => cal.getSofZmanAchilasChametzGRA()),
      sofZmanAchilasChametzMGA72Minutes: safe(() =>
        cal.getSofZmanAchilasChametzMGA72Minutes()
      ),
      sofZmanAchilasChametzMGA72MinutesZmanis: safe(() =>
        cal.getSofZmanAchilasChametzMGA72MinutesZmanis()
      ),
      sofZmanAchilasChametzMGA16Point1Degrees: safe(() =>
        cal.getSofZmanAchilasChametzMGA16Point1Degrees()
      ),
      sofZmanAchilasChametzBaalHatanya: safe(() =>
        cal.getSofZmanAchilasChametzBaalHatanya()
      ),
      sofZmanBiurChametzGRA: safe(() => cal.getSofZmanBiurChametzGRA()),
      sofZmanBiurChametzMGA72Minutes: safe(() => cal.getSofZmanBiurChametzMGA72Minutes()),
      sofZmanBiurChametzMGA72MinutesZmanis: safe(() =>
        cal.getSofZmanBiurChametzMGA72MinutesZmanis()
      ),
      sofZmanBiurChametzMGA16Point1Degrees: safe(() =>
        cal.getSofZmanBiurChametzMGA16Point1Degrees()
      ),
      sofZmanBiurChametzBaalHatanya: safe(() => cal.getSofZmanBiurChametzBaalHatanya()),
    },
    kidushLevana: {
      tchilasZmanKidushLevana3Days: safe(() => cal.getTchilasZmanKidushLevana3Days()),
      tchilasZmanKidushLevana7Days: safe(() => cal.getTchilasZmanKidushLevana7Days()),
      sofZmanKidushLevana15Days: safe(() => cal.getSofZmanKidushLevana15Days()),
      sofZmanKidushLevanaBetweenMoldos: safe(() =>
        cal.getSofZmanKidushLevanaBetweenMoldos()
      ),
      zmanMolad: safe(() => cal.getZmanMolad()),
    },
  };

  return NextResponse.json(result);
}
