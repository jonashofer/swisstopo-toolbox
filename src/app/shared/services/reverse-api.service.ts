import { Injectable } from '@angular/core';
import { Observable, of, map, tap, switchMap, from, mergeMap } from 'rxjs';
import { ApiSearchResult, ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Coordinate } from '../models/Coordinate';
import { CoordinateSystem } from '../models/CoordinateSystem';
import { CoordinateService } from './coordinate.service';
import { AddressCoordinateTableEntry } from '../models/AddressCoordinateTableEntry';
import { SearchResultItem } from '../components/text-input/text-input.component';
import { TranslateService } from '@ngx-translate/core';

export interface MapServerIdentifyResult {
  results?: GWRSearchResult[] | null;
}
export interface GWRSearchResult {
  layerBodId: string;
  layerName: string;
  featureId: string;
  id: string;
  attributes: GWREntry;
}
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

@Injectable()
export class ReverseApiService {
  private bulkAddId = -1;
  constructor(
    private httpClient: HttpClient,
    private coordinateService: CoordinateService,
    private apiService: ApiService,
    private translateService: TranslateService
  ) {}

  public validateSearchInput(value: string): { valid: boolean; messageLabel?: string | undefined } {
    const parsed = this.coordinateService.tryParse(value);
    if (parsed === null) {
      return { valid: false, messageLabel: 'notifications.inputNotCoordinate' };
    } else {
      return { valid: true };
    }
  }

  public searchMultiple(lines: string[]): Observable<AddressCoordinateTableEntry> {
    return from(lines).pipe(
      mergeMap(userInput => {
        const parseResult = this.coordinateService.tryParse(userInput);
        if (parseResult == null) {
          const entry: AddressCoordinateTableEntry = {
            address: userInput,
            id: (--this.bulkAddId).toString(),
            isValid: false,
            warningTranslationKey: 'notifications.inputNotCoordinate',
            wgs84: null,
            lv95: null,
            lv03: null
          };
          return of(entry);
        } else {
          return this.search(userInput).pipe(
            switchMap(r => {
              if (r.length > 0) {
                return this.mapReverseApiResultToAddress(r[0]);
              }
              const entry: AddressCoordinateTableEntry = {
                address: userInput,
                id: (--this.bulkAddId).toString(),
                isValid: false,
                warningTranslationKey: 'search.cta.noResults',
                wgs84: null,
                lv95: null,
                lv03: null
              };
              return of(entry);
            })
          );
        }
      })
    );
  }

  public search(input: string): Observable<SearchResultItem[]> {
    const coordinates = this.coordinateService.tryParse(input)!;

    return this.apiService
      .convert(coordinates, CoordinateSystem.LV_95)
      .pipe(
        switchMap(value => this.searchNearestAddresses(value, this.coordinateService.stringify(coordinates, ', ')))
      );
  }

  public mapReverseApiResultToAddress(item: SearchResultItem): Observable<AddressCoordinateTableEntry> {
    const i = item.c2a_data!;
    const gwr = i.gwr;
    return this.apiService.convert(i.lv95, CoordinateSystem.WGS_84).pipe(
      map(wgs84 => {
        return {
          address: i.addressText,
          originalInput: item.originalInput,
          id: i.gwr.id,
          featureId: gwr.featureId,
          isValid: true,
          wgs84: {
            system: CoordinateSystem.WGS_84,
            lat: wgs84.lat,
            lon: wgs84.lon
          },
          lv95: {
            system: CoordinateSystem.LV_95,
            lat: i.lv95.lat,
            lon: i.lv95.lon
          },
          lv03: null,
          egid: gwr.attributes.egid,
          egrid: gwr.attributes.egrid
        };
      })
    );
  }

  public searchNearestAddresses(lv95coord: Coordinate, originalInput: string): Observable<SearchResultItem[]> {
    if (lv95coord.system !== CoordinateSystem.LV_95) {
      return of([]);
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
        const apiResults = data.results || [];
        return apiResults
          .map(r => {
            const attr = r.attributes;
            const fullAddress = `${attr.strname_deinr}, ${attr.dplz4} ${attr.dplzname}`;
            const east = attr.dkode || attr.gkode;
            const north = attr.dkodn || attr.gkodn;
            const coord: Coordinate = { lon: east, lat: north, system: CoordinateSystem.LV_95 };
            const distance = this.calculateDistance(lv95coord, coord);
            const distanceSuffix =
              distance > 0 ? ` <i>${this.translateService.instant('search.cta.distance', { distance })}</i>` : '';
            return {
              text: `${fullAddress}${distanceSuffix}`,
              originalInput: originalInput,
              c2a_data: {
                gwr: r,
                lv95: coord,
                addressText: fullAddress,
                distance: distance
              }
            };
          })
          .sort((a, b) => a.c2a_data.distance - b.c2a_data.distance);
      })
    );
  }

  private calculateDistance(coord1: Coordinate, coord2: Coordinate) {
    const deltaX = coord2.lat - coord1.lat;
    const deltaY = coord2.lon - coord1.lon;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return Math.round(distance);
  }
}
