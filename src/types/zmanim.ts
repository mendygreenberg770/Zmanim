export interface ZmanimMeta {
  lat: number;
  lng: number;
  elevation: number;
  timezone: string;
  locationName: string;
  date: string;
  isErevPesach: boolean;
}

export type ZmanimSection = Record<string, string | null>;

export interface ZmanimResponse {
  meta: ZmanimMeta;
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
  midnight: ZmanimSection;
  shaahZmanis: ZmanimSection;
  chametz?: ZmanimSection;
}

export interface GeoResult {
  displayName: string;
  lat: number;
  lng: number;
  timezone: string;
}
