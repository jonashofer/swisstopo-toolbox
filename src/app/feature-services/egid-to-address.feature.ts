import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import {
  ColumnConfigItem,
  ColumnDefinitions,
  inactiveUserCol,
  sysCol,
  userCol
} from '../shared/models/ColumnConfiguration';
import { FeatureServiceBase, LabelType, SearchResultItemTyped } from '../shared/services/feature.service';
import { HttpClient } from '@angular/common/http';
import { Coordinate, CoordinateSystem, MapServerResult } from '../shared/models';
import { CoordinateToAddressApiData } from './coordinate-to-address.feature';

@Injectable()
export class EgidToAddressService extends FeatureServiceBase<CoordinateToAddressApiData> {
  showCoordinateSystemSwitch = false;

  constructor(private httpClient: HttpClient) {
    super('egid-to-address', LabelType.EGID);
    this.messageForMultipleResults = 'table.entry.warning.ambiguousEgid';
  }

  validateSearchInput(input: string): string | null {
    return this.tryParseEgid(input) === null ? 'notifications.inputNotEgid' : null;
  }

  search(input: string): Observable<SearchResultItemTyped<CoordinateToAddressApiData>[]> {
    const parsedInput = this.tryParseEgid(input)!;
    const request = `https://api.geo.admin.ch/rest/services/api/MapServer/find?layer=ch.bfs.gebaeude_wohnungs_register&searchText=${parsedInput}&searchField=egid&returnGeometry=true&sr=4326&contains=false`;

    return this.httpClient.get<MapServerResult>(request).pipe(
      map((data: MapServerResult) => {
        const apiResults = data.results || [];
        return apiResults.map(r => {
          const attr = r.attributes;
          const fullAddress = `${attr.strname_deinr}, ${attr.dplz4} ${attr.dplzname}`;

          const lv95: Coordinate = {
            lon: attr.dkode || attr.gkode,
            lat: attr.dkodn || attr.gkodn,
            system: CoordinateSystem.LV_95
          };
          const wgs84: Coordinate = {
            lon: r.geometry.x,
            lat: r.geometry.y,
            system: CoordinateSystem.WGS_84
          };
          return {
            text: `${r.attributes.egid} - ${fullAddress}`,
            originalInput: input,
            data: {
              gwr: r,
              lv95: lv95,
              wgs84: wgs84,
              addressText: fullAddress
            }
          };
        });
      }),
      catchError(() => of([]))
    );
  }

  transformInput(item: SearchResultItemTyped<CoordinateToAddressApiData>): AddressCoordinateTableEntry {
    const i = item.data;
    const gwr = i.gwr;
    const result = {
      address: i.addressText,
      originalInput: item.originalInput,
      id: i.gwr.featureId,
      isValid: true,
      wgs84: {
        system: CoordinateSystem.WGS_84,
        lat: i.wgs84!.lat,
        lon: i.wgs84!.lon
      },
      lv95: {
        system: CoordinateSystem.LV_95,
        lat: i.lv95.lat,
        lon: i.lv95.lon
      },
      egid: gwr.attributes.egid,
      egrid: gwr.attributes.egrid
    };
    return result;
  }

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string {
    return entry.originalInput || '';
  }

  getDefaultColumns(): ColumnConfigItem[] {
    return [
      userCol(ColumnDefinitions.EGID),
      sysCol(ColumnDefinitions.EDIT),
      userCol(ColumnDefinitions.ADDRESS),
      userCol(ColumnDefinitions.EGRID),
      inactiveUserCol(ColumnDefinitions.WGS_84),
      inactiveUserCol(ColumnDefinitions.LV_95),
      inactiveUserCol(ColumnDefinitions.LV_03),
      inactiveUserCol(ColumnDefinitions.HEIGHT)
    ];
  }

  getExampleFileContent(): string {
    return `2242547\r\n1272199\r\n190288049\r\n`;
  }

  private tryParseEgid(input: string): number | null {
    const sanitizedInput = input.replace(/\D/g, '');
    const numberInput = Number(sanitizedInput);

    if (numberInput >= 1 && numberInput <= 900_000_000) {
      return numberInput;
    } else {
      return null;
    }
  }
}
