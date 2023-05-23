import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { GWREntry } from '../models/GeoAdminApiModels';

interface Feature {
  layerBodId: string;
  layerName: string;
  featureId: string;
  id: string;
  attributes: GWREntry;
}

interface RootObject {
  feature: Feature;
}

@Injectable()
export class ApiDetailService {
  constructor(private readonly httpClient: HttpClient) {}

  public getBuildingInfo(featureId: string) {
    const request = `https://api.geo.admin.ch/rest/services/api/MapServer/ch.bfs.gebaeude_wohnungs_register/${featureId}?returnGeometry=false`;
    return this.httpClient.get<RootObject>(request);
  }

  public getHeight(lv95_east: number, lv95_north: number) {
    const request = `https://api.geo.admin.ch/rest/services/height?easting=${lv95_east}&northing=${lv95_north}`;
    return this.httpClient.get<{ height: string }>(request).pipe(map(r => r.height));
  }
}
