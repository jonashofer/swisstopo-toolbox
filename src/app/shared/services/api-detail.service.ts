import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

export interface Attributes {
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
  lparzsx?: any;
  ltyp?: any;
  gebnr: string;
  gbez: string;
  gkode: number;
  gkodn: number;
  gksce: number;
  gstat: number;
  gkat: number;
  gklas: number;
  gbauj?: any;
  gbaum?: any;
  gbaup: number;
  gabbj?: any;
  garea: number;
  gvol?: any;
  gvolnorm?: any;
  gvolsce?: any;
  gastw: number;
  ganzwhg: number;
  gazzi?: any;
  gschutzr: number;
  gebf?: any;
  gwaerzh1: number;
  genh1: number;
  gwaersceh1: number;
  gwaerdath1: string;
  gwaerzh2: number;
  genh2: number;
  gwaersceh2: number;
  gwaerdath2: string;
  gwaerzw1: number;
  genw1: number;
  gwaerscew1: number;
  gwaerdatw1: string;
  gwaerzw2: number;
  genw2: number;
  gwaerscew2: number;
  gwaerdatw2: string;
  edid: string;
  egaid: number;
  deinr: string;
  esid: number;
  strname: string[];
  strnamk: string[];
  strindx: string[];
  strsp: string[];
  stroffiziel: string;
  dplz4: number;
  dplzz: number;
  dplzname: string;
  dkode: number;
  dkodn: number;
  doffadr: number;
  dexpdat: string;
  ewid: string[];
  whgnr: any[];
  wstwk: number[];
  wmehrg: number[];
  weinr: any[];
  wbez: any[];
  wstat: number[];
  wexpdat: Date[];
  wbauj: number[];
  wabbj: any[];
  warea: number[];
  wazim: number[];
  wkche: number[];
  label: string;
}

export interface Feature {
  layerBodId: string;
  layerName: string;
  featureId: string;
  id: string;
  attributes: Attributes;
}

export interface RootObject {
  feature: Feature;
}

@Injectable({
  providedIn: 'root'
})
export class ApiDetailService {
  constructor(private readonly httpClient: HttpClient) {}

  public getBuildingInfo(featureId: string) {
    const request = `https://api.geo.admin.ch/rest/services/api/MapServer/ch.bfs.gebaeude_wohnungs_register/${featureId}?returnGeometry=false`;
    return this.httpClient.get<RootObject>(request).pipe(
      map((data: RootObject) => {
        console.log(data);
        return data;
      })
    );
  }

  public getHeight(lv95_east: number, lv95_north: number) {
    const request = `https://api.geo.admin.ch/rest/services/height?easting=${lv95_east}&northing=${lv95_north}`;
    return this.httpClient.get<{ height: string }>(request).pipe(map(r => r.height));
  }
}
