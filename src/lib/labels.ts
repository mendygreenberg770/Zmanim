export const SECTION_LABELS: Record<string, string> = {
  alos:          "Dawn (Alos HaShachar)",
  misheyakir:    "Earliest Tallit & Tefillin (Misheyakir)",
  sunrise:       "Sunrise (Hanetz HaChama)",
  sofZmanShema:  "Latest Shema (Sof Zman Shema)",
  sofZmanTefila: "Latest Shacharit (Sof Zman Tefila)",
  chatzos:       "Midday (Chatzos HaYom)",
  minchaGedola:  "Earliest Mincha (Mincha Gedolah)",
  minchaKetana:  "Mincha Ketanah",
  plagHamincha:  "Plag HaMincha",
  sunset:        "Sunset (Shkiah)",
  tzait:         "Nightfall (Tzeit HaKochavim)",
  midnight:      "Midnight (Chatzos HaLailah)",
  shaahZmanis:   "Shaah Zmanis (Proportional Hour)",
  chametz:       "Chametz Times (Erev Pesach)",
};

export const ZMAN_LABELS: Record<string, string> = {
  // Alos
  alos26Degrees:       "Alter Rebbe (R' Chaim Na'eh) — 26° / 120 Zmanis min",
  alos19Point8Degrees: "Minhag Eretz Yisroel (R' Tukachinsky, Nivreshes) — 19.8°",
  alosBaalHatanya:     "Alter Rebbe (Default) — 16.9° / 72 Zmanis min",
  alos16Point1Degrees: "Alter Rebbe (Other) & GRA — 16.1° / 4 Mil",

  // Misheyakir
  misheyakir11Point8Degrees: "Nivreshes, Eidus L'Yisroel — 11.8°",
  misheyakir11Point5Degrees: "Imanuel Halocho L'Ma'aseh — 11.5°",
  misheyakir10Point2Degrees: "Beis Baruch, Birur Halocho (Default) — 10.2°",

  // Sunrise
  seaLevelSunrise: "Sunrise (sea level)",

  // Shema
  sofZmanShmaMGA:         "Magen Avraham — 3 prop. hours after alos",
  sofZmanShmaBaalHatanya: "Alter Rebbe (Default) — 3 prop. hours after hanetz amiti",
  sofZmanShmaGRA:         "Alter Rebbe (Other) & GRA — 3 prop. hours after hanetz",

  // Tefila
  sofZmanTfilaMGA:         "Magen Avraham — 4 prop. hours after alos",
  sofZmanTfilaBaalHatanya: "Alter Rebbe (Default) — 4 prop. hours after hanetz amiti",
  sofZmanTfilaGRA:         "Alter Rebbe (Other) & GRA — 4 prop. hours after hanetz",

  // Chatzos
  chatzos: "Midday (Chatzos HaYom)",

  // Mincha Gedola
  minchaGedola:            "Alter Rebbe (Other) & GRA — 6.5 prop. hours after hanetz",
  minchaGedolaBaalHatanya: "Alter Rebbe (Default) — 6.5 prop. hours after hanetz amiti",
  minchaGedola72Minutes:   "Magen Avraham — 6.5 prop. hours after alos",

  // Mincha Ketana
  minchaKetana:            "Alter Rebbe (Other) & GRA — 2.5 prop. hours before shkiah",
  minchaKetanaBaalHatanya: "Alter Rebbe (Default) — 2.5 prop. hours before shkiah amiti",
  minchaKetana72Minutes:   "Magen Avraham — 2.5 prop. hours before tzeit",

  // Plag
  plagHamincha:                "Alter Rebbe (Other) & GRA — 1.25 prop. hours before shkiah",
  plagHaminchaBaalHatanya:     "Alter Rebbe (Default) — 1.25 prop. hours before shkiah amiti",
  plagHamincha72MinutesZmanis: "Magen Avraham — 1.25 prop. hours before tzeit",

  // Sunset
  seaLevelSunset:    "Sunset (sea level)",
  sunsetBaalHatanya: "Sunset — Alter Rebbe / Baal HaTanya (1.583°)",

  // Tzeit
  tzaisGeonim5Point83Degrees:  "Alter Rebbe (R' Berel Levin) — 5 Medium Stars, ~23 min (5.83°)",
  tzaisBaalHatanya:            "Alter Rebbe (Default) — Medium Stars, ~24 min (6°)",
  tzaisGeonim6Point3Degrees:   "Alter Rebbe (R' Avrohom Altein) — 3 Medium Stars, ~26 min (6.3°)",
  tzaisGeonim6Point83Degrees:  "Alter Rebbe (R' Berel Levin) — 3 Small Stars, ~28 min (6.83°)",
  tzaisGeonim7Point083Degrees: "Melamed L'Ho'il — Medium Stars, ~30 min (7.083°)",
  tzaisGeonim8Point5Degrees:   "R' Tukachinsky, Igros Moshe — Small Stars, ~36 min (8.5°)",
  tzais72:                     "Rabbeinu Tam — 72 fixed minutes after shkiah",

  // Midnight
  midnightTonight: "Midnight (Chatzos HaLailah)",

  // Shaah Zmanis
  shaahZmanisGra:             "Alter Rebbe (Other) & GRA — hanetz to shkiah",
  shaahZmanisBaalHatanya:     "Alter Rebbe (Default) — hanetz amiti to shkiah amiti",
  shaahZmanis16Point1Degrees: "Magen Avraham — alos to tzeit (16.1°)",

  // Chametz (Erev Pesach)
  sofZmanAchilasChametzGRA:          "Sof Zman Achilas Chametz — GRA",
  sofZmanAchilasChametzMGA72Minutes: "Sof Zman Achilas Chametz — Magen Avraham (72 min)",
  sofZmanAchilasChametzBaalHatanya:  "Sof Zman Achilas Chametz — Alter Rebbe",
  sofZmanBiurChametzGRA:             "Sof Zman Biur Chametz — GRA",
  sofZmanBiurChametzMGA72Minutes:    "Sof Zman Biur Chametz — Magen Avraham (72 min)",
  sofZmanBiurChametzBaalHatanya:     "Sof Zman Biur Chametz — Alter Rebbe",
};
