export interface ZmanimMeta {
  lat: number;
  lng: number;
  elevation: number;
  timezone: string;
  locationName: string;
  date: string;
}

export type ZmanimSection = Record<string, string | null>;

export interface ZmanimResponse {
  meta: ZmanimMeta;
  astronomical: ZmanimSection;
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
  beinHashmashos: ZmanimSection;
  tzait: ZmanimSection;
  shaahZmanis: ZmanimSection;
  chametz: ZmanimSection;
  kidushLevana: ZmanimSection;
}

export interface GeoResult {
  displayName: string;
  lat: number;
  lng: number;
  timezone: string;
}
