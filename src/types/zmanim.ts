export interface JewishInfo {
  jewishDate: string;          // "16 Sivan 5786"
  specialDay: string | null;   // "Shabbos", "Rosh Hashana", "Chanukah — Day 3", etc.
  isFriday: boolean;
  isShabbos: boolean;
  isErevYomTov: boolean;
  isYomTov: boolean;
  isTaanit: boolean;
  isMinorFast: boolean;
  isYomKippur: boolean;
  isTishaBAv: boolean;
  isRoshChodesh: boolean;
  isChanukah: boolean;
  isErevPesach: boolean;
  needsCandleLighting: boolean;
  motzaeiLabel: string | null; // "Motzaei Shabbos" | "Motzaei Yom Tov" | null
}

export interface ZmanimMeta {
  lat: number;
  lng: number;
  elevation: number;
  timezone: string;
  locationName: string;
  date: string;
  jewish: JewishInfo;
}

export type ZmanimSection = Record<string, string | null>;

export interface ZmanimResponse {
  meta: ZmanimMeta;
  candleLighting?: ZmanimSection; // Erev Shabbos / Erev Yom Tov only
  alos: ZmanimSection;
  misheyakir: ZmanimSection;
  sunrise: ZmanimSection;
  sofZmanShema: ZmanimSection;
  sofZmanTefila: ZmanimSection;
  chatzos: ZmanimSection;
  minchaGedola: ZmanimSection;
  minchaKetana: ZmanimSection;
  plagHamincha: ZmanimSection;
  sunset: ZmanimSection;
  tzait: ZmanimSection;
  motzaeiShabbos?: ZmanimSection; // Shabbos only
  midnight: ZmanimSection;
  shaahZmanis: ZmanimSection;
  chametz?: ZmanimSection; // Erev Pesach only
}

export interface GeoResult {
  displayName: string;
  lat: number;
  lng: number;
  timezone: string;
}
