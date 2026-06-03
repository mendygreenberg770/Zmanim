export const SECTION_LABELS: Record<string, string> = {
  candleLighting: "Hadlakas Neiros — הדלקת נרות",
  alos:          "Dawn — עלות השחר",
  misheyakir:    "Earliest Tallit & Tefillin — משיכיר",
  sunrise:       "Sunrise — הנץ החמה",
  sofZmanShema:  "Latest Shema — סוף זמן קריאת שמע",
  sofZmanTefila: "Latest Shacharis — סוף זמן תפילה",
  chatzos:       "Midday — חצות היום",
  minchaGedola:  "Earliest Mincha — מנחה גדולה",
  minchaKetana:  "Mincha Ketanah — מנחה קטנה",
  plagHamincha:  "Plag HaMincha — פלג המנחה",
  sunset:        "Sunset — שקיעת החמה",
  tzait:         "Nightfall — צאת הכוכבים",
  midnight:      "Midnight — חצות הלילה",
  shaahZmanis:   "Proportional Hour — שעה זמנית",
  chametz:        "Chametz Times (Erev Pesach)",
  motzaeiShabbos: "Motzaei Shabbos — מוצאי שבת",
  motzaeiYomTov:  "Motzaei Yom Tov — מוצאי יום טוב",
};

export const ZMAN_LABELS: Record<string, string> = {
  // Candle lighting
  earliestCandleLighting:        "Earliest Candle Lighting (from Plag HaMincha)",
  candleLighting18:              "Candle Lighting — 18 min before sunset",
  candleLightingFromTzeit8Point5: "Candle Lighting (from Tzeit) — R' Tukachinsky / Igros Moshe, 36 min (8.5°)",
  candleLightingFromTzeit72:      "Candle Lighting (from Tzeit) — Rabeinu Tam, 72 fixed min",

  // Motzaei Shabbos (2 opinions used in candle-lighting and motzaei sections)
  motzaei_tzaisGeonim8Point5Degrees: "Shabbos Ends — R' Tukachinsky / Igros Moshe, 36 min (8.5°)",
  motzaei_tzais72:                   "Shabbos Ends — Rabeinu Tam, 72 fixed min after sunset",

  // Alos
  alos26Degrees:       "Alter Rebbe (Rav Chaim No'eh) — 26° / 120 Zmanis min before hanetz",
  alos19Point8Degrees: "Minhag Eretz Yisroel (R' Tukachinsky; Nivreshes) — 19.8° / 90 Zmanis min",
  alosBaalHatanya:     "Alter Rebbe (Default) — 16.9° / 72 Zmanis min before hanetz amiti",
  alos16Point1Degrees: "Alter Rebbe (Other) & GRA — 16.1° / Standard 4 Mil, 72 min",

  // Misheyakir
  misheyakir11Point8Degrees: "Nivreshes; Eidus L'Yisroel, and others — 11.8° / 52 Zmanis min",
  misheyakir11Point5Degrees: "Zmanei Halocho L'Ma'aseh — 11.5°",
  misheyakir10Point2Degrees: "Beis Baruch, Birur Halocho (Default) — 10.2° / 45 Zmanis min",

  // Sunrise
  seaLevelSunrise: "Sunrise at sea level",

  // Shema
  sofZmanShmaMGA:         "Magen Avraham — 3 proportional hours after alot",
  sofZmanShmaBaalHatanya: "Alter Rebbe (Default) — 3 proportional hours after hanetz amiti",
  sofZmanShmaGRA:         "Alter Rebbe (Other) and GRA — 3 proportional hours after hanetz",

  // Tefila
  sofZmanTfilaMGA:         "Magen Avraham — 4 proportional hours after alot",
  sofZmanTfilaBaalHatanya: "Alter Rebbe (Default) — 4 proportional hours after hanetz amiti",
  sofZmanTfilaGRA:         "Alter Rebbe (Other) and GRA — 4 proportional hours after hanetz",

  // Chatzos
  chatzos:           "Midday (Chatzot HaYom)",
  fixedLocalChatzos: "Chatzos HaEmtzai (Fixed Local Chatzos)",

  // Mincha Gedola
  minchaGedola:            "Alter Rebbe (Other) and GRA — 6.5 proportional hours after hanetz",
  minchaGedolaBaalHatanya: "Alter Rebbe (Default) — 6.5 proportional hours after hanetz amiti",
  minchaGedola72Minutes:   "Magen Avraham — 6.5 proportional hours after alot",

  // Mincha Ketana
  minchaKetana:            "Alter Rebbe (Other) and GRA — 2.5 proportional hours before shkiah",
  minchaKetanaBaalHatanya: "Alter Rebbe (Default) — 2.5 proportional hours before shkiah amiti",
  minchaKetana72Minutes:   "Magen Avraham — 2.5 proportional hours before tzeit",

  // Plag
  plagHamincha:                "Alter Rebbe (Other) and GRA — 1.25 proportional hours before shkiah",
  plagHaminchaBaalHatanya:     "Alter Rebbe (Default) — 1.25 proportional hours before shkiah amiti",
  plagHamincha72MinutesZmanis: "Magen Avraham — 1.25 proportional hours before tzeit",

  // Sunset
  seaLevelSunset:    "Sunset at sea level",
  sunsetBaalHatanya: "Sunset — Alter Rebbe / Baal HaTanya (1.583°)",

  // Tzeit
  tzaisGeonim5Point83Degrees:  "Alter Rebbe (Rabbi Berel Levin) — 3 Medium Stars, ~23 min (5.83°)",
  tzaisBaalHatanya:            "Alter Rebbe (Default) — 3 Medium Stars, ~24 min (6°)",
  tzaisGeonim6Point3Degrees:   "Alter Rebbe (Rabbi Avrohom Altein) — 3 Medium Stars, ~26 min (6.3°)",
  tzaisGeonim6Point83Degrees:  "Alter Rebbe (Rabbi Berel Levin) — 3 Small Stars, ~28 min (6.83°)",
  tzaisGeonim7Point083Degrees: "Melamed L'Ho'il — 3 Medium Stars, 30 min (7.083°)",
  tzaisGeonim8Point5Degrees:   "Rabbi Y.M. Tukachinsky; Igros Moshe — 3 Small Stars, 36 min (8.5°)",
  tzais72:                     "Rabeinu Tam — 72 fixed minutes after shkiah",

  // Midnight
  midnightTonight: "Midnight (Chatzot HaLailah)",

  // Shaah Zmanis
  shaahZmanisGra:             "Alter Rebbe (Other) and GRA — 1/12th of the time between hanetz and shkiah",
  shaahZmanisBaalHatanya:     "Alter Rebbe (Default) — 1/12th of the time between hanetz amiti and shkiah amiti",
  shaahZmanis16Point1Degrees: "Magen Avraham — 1/12th of the time between alot and tzeit (16.1°)",

  // Chametz (Erev Pesach only)
  sofZmanAchilasChametzGRA:          "Sof Zman Achilas Chametz — GRA",
  sofZmanAchilasChametzMGA72Minutes: "Sof Zman Achilas Chametz — Magen Avraham (72 min)",
  sofZmanAchilasChametzBaalHatanya:  "Sof Zman Achilas Chametz — Alter Rebbe",
  sofZmanBiurChametzGRA:             "Sof Zman Biur Chametz — GRA",
  sofZmanBiurChametzMGA72Minutes:    "Sof Zman Biur Chametz — Magen Avraham (72 min)",
  sofZmanBiurChametzBaalHatanya:     "Sof Zman Biur Chametz — Alter Rebbe",
};
