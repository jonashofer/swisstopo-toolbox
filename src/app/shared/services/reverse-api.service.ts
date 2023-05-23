import { Injectable } from '@angular/core';
import { Observable, of, map, tap, switchMap, from, mergeMap } from 'rxjs';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Coordinate } from '../models/Coordinate';
import { CoordinateSystem } from '../models/CoordinateSystem';
import { CoordinateService } from './coordinate.service';
import { AddressCoordinateTableEntry } from '../models/AddressCoordinateTableEntry';
import { TranslateService } from '@ngx-translate/core';
import { SearchResultItemTyped } from './features/feature.service';
import { GWREntry } from '../models/GeoAdminApiModels';

interface MapServerIdentifyResult {
  results?: GWRSearchResult[] | null;
}
interface GWRSearchResult {
  layerBodId: string;
  layerName: string;
  featureId: string;
  id: string;
  attributes: GWREntry;
}
export interface CoordinateToAddressApiData {
  gwr: GWRSearchResult;
  addressText: string;
  distance: number;
  lv95: Coordinate;
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

  public validateSearchInput(value: string): string | null {
    return this.coordinateService.tryParse(value) === null ? 'notifications.inputNotCoordinate' : null;
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
          return this.search(parseResult).pipe(
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

  public search(input: Coordinate): Observable<SearchResultItemTyped<CoordinateToAddressApiData>[]> {
    return this.apiService
      .convert(input, CoordinateSystem.LV_95)
      .pipe(
        switchMap(value => this.searchNearestAddresses(value, this.coordinateService.stringify(input, ', ')))
      );
  }

  //TODO wgs84 zu enrich zügeln, dann kann muss auch hier kein observable zurückgegeben werden
  public mapReverseApiResultToAddress(
    item: SearchResultItemTyped<CoordinateToAddressApiData>
  ): Observable<AddressCoordinateTableEntry> {
    const i = item.data;
    const gwr = i.gwr;
    return this.apiService.convert(i.lv95, CoordinateSystem.WGS_84).pipe(
      map(wgs84 => {
        return {
          address: i.addressText,
          originalInput: item.originalInput,
          id: i.gwr.featureId,
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

  public searchNearestAddresses(
    lv95coord: Coordinate,
    originalInput: string
  ): Observable<SearchResultItemTyped<CoordinateToAddressApiData>[]> {
    if (lv95coord.system !== CoordinateSystem.LV_95) {
      return of([]);
    }
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
              data: {
                gwr: r,
                lv95: coord,
                addressText: fullAddress,
                distance: distance
              }
            };
          })
          .sort((a, b) => a.data.distance - b.data.distance);
      }),
    );
  }

  private calculateDistance(coord1: Coordinate, coord2: Coordinate) {
    const deltaX = coord2.lat - coord1.lat;
    const deltaY = coord2.lon - coord1.lon;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return Math.round(distance);
  }
}
