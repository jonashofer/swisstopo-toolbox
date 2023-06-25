import { Injectable } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { AddressCoordinateTableEntry, ColumnDefinitions, Coordinate, CoordinateSystem, GWREntry, GWRSearchResult, MapServerResult } from '../shared/models';
import { ColumnConfigItem, userCol, sysCol, inactiveUserCol } from '../shared/models/ColumnConfiguration';
import { CoordinateService } from '../shared/services';
import { FeatureServiceBase, LabelType, SearchResultItemTyped } from '../shared/services/feature.service';
import { coords } from '../shared/models/Coordinate';
import { apiConvert } from '../shared/services/enrich-api-calls';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

export interface CoordinateToAddressApiData {
  gwr: GWRSearchResult;
  addressText: string;
  lv95: Coordinate;
  wgs84?: Coordinate;
}

@Injectable()
export class CoordinateToAddressService extends FeatureServiceBase<CoordinateToAddressApiData> {
  constructor(private httpClient: HttpClient, private translateService: TranslateService) {
    super('coordinate-to-address', LabelType.COORDINATE);
  }

  validateSearchInput(input: string): string | null {
    return CoordinateService.tryParse(input) === null ? 'notifications.inputNotCoordinate' : null;
  }

  search(validInput: string): Observable<SearchResultItemTyped<CoordinateToAddressApiData>[]> {
    const coords = CoordinateService.tryParse(validInput)!;
    return apiConvert(coords, CoordinateSystem.LV_95, this.httpClient).pipe(
      switchMap(value => this.searchNearestAddresses(value, validInput))
    );
  }

  transformInput(item: SearchResultItemTyped<CoordinateToAddressApiData>): AddressCoordinateTableEntry {
    const i = item.data;
    const gwr = i.gwr;
    return {
      address: i.addressText,
      originalInput: item.originalInput,
      id: i.gwr.featureId,
      isValid: true,
      lv95: coords(i.lv95.lat, i.lv95.lon, CoordinateSystem.LV_95),
      egid: gwr.attributes.egid,
      egrid: gwr.attributes.egrid
    };
  }

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string {
    return entry.originalInput || '';
  }

  getDefaultColumns(): ColumnConfigItem[] {
    return [
      userCol(ColumnDefinitions.WGS_84),
      userCol(ColumnDefinitions.ADDRESS),
      sysCol(ColumnDefinitions.EDIT),
      inactiveUserCol(ColumnDefinitions.LV_95),
      inactiveUserCol(ColumnDefinitions.LV_03),
      inactiveUserCol(ColumnDefinitions.HEIGHT),
      inactiveUserCol(ColumnDefinitions.EGID),
      inactiveUserCol(ColumnDefinitions.EGRID)
    ];
  }

  getExampleFileContent(): string {
    return `46.7591	7.6292\r\n636'810.21, 136'435.22\r\n2'642'580.0, 1'136'725.0`;
  }

  private searchNearestAddresses(
    lv95coord: Coordinate,
    originalInput: string
  ): Observable<SearchResultItemTyped<CoordinateToAddressApiData>[]> {
    if (lv95coord.system !== CoordinateSystem.LV_95) {
      return of([]);
    }
    const request = `https://api.geo.admin.ch/rest/services/api/MapServer/identify?mapExtent=0,0,100,100&imageDisplay=100,100,100&tolerance=100&geometryType=esriGeometryPoint&geometry=${lv95coord.lon},${lv95coord.lat}&layers=all:ch.bfs.gebaeude_wohnungs_register&returnGeometry=true&sr=2056`;

    return this.httpClient.get<MapServerResult>(request).pipe(
      map((data: MapServerResult) => {
        const apiResults = data.results || [];
        return apiResults
          .map(r => {
            const attr = r.attributes;
            const fullAddress = `${attr.strname_deinr}, ${attr.dplz4} ${attr.dplzname}`;
            const east = attr.dkode || attr.gkode;
            const north = attr.dkodn || attr.gkodn;
            const coord: Coordinate = coords(north, east, CoordinateSystem.LV_95);
            const distance = this.calculateDistance(lv95coord, coord);
            const distanceSuffix =
              distance > 0
                ? ` <i>${this.translateService.instant('search.coordinate.distance', { distance })}</i>`
                : '';
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
