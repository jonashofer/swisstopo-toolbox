export interface GWREntry {
  egid: string;
  strname_deinr: string;
  plz_plz6: string;
  ggdename: string;
  ggdenr: number;
  gexpdat: string;
  gdekt: string;
  egrid: string;
  lgbkr: number;
  lparz: string;
  lparzsx?: null;
  ltyp?: null;
  gebnr: string;
  gbez: string;
  gkode: number;
  gkodn: number;
  gksce: number;
  gstat: number;
  gkat: number;
  gklas?: null;
  gbauj?: null;
  gbaum?: null;
  gbaup: number;
  gabbj?: null;
  garea: number;
  gvol?: null;
  gvolnorm?: null;
  gvolsce?: null;
  gastw: number;
  ganzwhg?: null;
  gazzi?: null;
  gschutzr?: null;
  gebf?: null;
  gwaerzh1: number;
  genh1: number;
  gwaersceh1: number;
  gwaerdath1: string;
  gwaerzh2?: null;
  genh2?: null;
  gwaersceh2?: null;
  gwaerdath2: string;
  gwaerzw1: number;
  genw1: number;
  gwaerscew1: number;
  gwaerdatw1: string;
  gwaerzw2?: null;
  genw2?: null;
  gwaerscew2?: null;
  gwaerdatw2: string;
  edid: string;
  egaid: number;
  deinr: string;
  esid: number;
  strname?: string[] | null;
  strnamk?: string[] | null;
  strindx?: string[] | null;
  strsp?: string[] | null;
  stroffiziel: string;
  dplz4: number;
  dplzz: number;
  dplzname: string;
  dkode?: number;
  dkodn?: number;
  doffadr: number;
  dexpdat: string;
  ewid?: null;
  whgnr?: null;
  wstwk?: null;
  wmehrg?: null;
  weinr?: null;
  wbez?: null;
  wstat?: null;
  wexpdat?: null;
  wbauj?: null;
  wabbj?: null;
  warea?: null;
  wazim?: null;
  wkche?: null;
  label: string;
}

export interface Geometry {
  x: number;
  y: number;
}

export interface AddressToCoordinateAttrs {
  origin: string;
  geom_quadindex: string;
  zoomlevel: any;
  featureId: string;
  lon: number;
  detail: string;
  rank: number;
  geom_st_box2d: string;
  lat: number;
  num: number;
  y: number;
  x: number;
  label: string;
}
export interface MapServerResult {
  results?: GWRSearchResult[] | null;
}

export interface GWRSearchResult {
  layerBodId: string;
  layerName: string;
  featureId: string;
  id: string;
  attributes: GWREntry;

  bbox: number[];
  geometry: Geometry;
}
