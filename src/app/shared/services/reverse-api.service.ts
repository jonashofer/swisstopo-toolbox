import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { ApiSearchResult } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Coordinate } from '../models/Coordinate';
import { CooridnateSystem } from '../models/CoordinateSystem';

export interface MapServerIdentifyResult {
  results?: ResultsEntity[] | null;
}
export interface ResultsEntity {
  layerBodId: string;
  layerName: string;
  featureId: string;
  id: string;
  attributes: Attributes;
}
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

@Injectable({
  providedIn: 'root'
})
export class ReverseApiService {
  constructor(private httpClient: HttpClient) {}

  public searchNearestAddresses(lv95coord: Coordinate) {
    console.log("search nearest addresses");
    if(lv95coord.system !== CooridnateSystem.LV_95) {
      return of();
    }

    // same validation as in search input for catching multiline or fileinputs
    // const validation = this.validateSearchInput(input);
    // if (!validation.valid) {
    //   this.notificationService.warning(this.translate.instant(validation.messageLabel!));
    //   return of({ input, results: [] });
    // }

    const request = `https://api.geo.admin.ch/rest/services/api/MapServer/identify?mapExtent=0,0,100,100&imageDisplay=100,100,100&tolerance=100&geometryType=esriGeometryPoint&geometry=${lv95coord.lon},${lv95coord.lat}&layers=all:ch.bfs.gebaeude_wohnungs_register&returnGeometry=false&sr=2056`;

    return this.httpClient.get<MapServerIdentifyResult>(request).pipe(
      map((data: MapServerIdentifyResult) => {
        console.log(data);
        const apiResults = data.results || [];
        return apiResults.map(r => {
          const attr = r.attributes;
          const east = attr.dkode || attr.gkode;
          const north = attr.dkodn || attr.gkodn;
          const coord: Coordinate = {lon: east, lat: north}
          const distance = this.calculateDistance(lv95coord, coord);
          const name = `${attr.strname_deinr}, ${attr.dplz4} ${attr.dplzname} (${distance}m)`
          return {name, distance};
        }).sort((a, b) => a.distance - b.distance);
      })
    );
  }

  private calculateDistance(coord1: Coordinate, coord2: Coordinate) {
    const deltaX = coord2.lat - coord1.lat;
    const deltaY = coord2.lon - coord1.lon;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance;
  }
}
