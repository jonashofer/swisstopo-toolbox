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
import { coords } from '../shared/models/Coordinate';
import { AddressToCoordinateAttrs, CoordinateSystem } from '../shared/models';


export interface AddressToCoordinateApiData {
  id: number;
  weight: number;
  attrs: AddressToCoordinateAttrs;
}

@Injectable()
export class AddressToCoordinateService extends FeatureServiceBase<AddressToCoordinateApiData> {
  constructor(private readonly httpClient: HttpClient) {
    super('address-to-coordinate', LabelType.ADDRESS);
    this.messageForMultipleResults = 'table.entry.warning.ambiguous';
  }

  validateSearchInput(input: string): string | null {
    const length = input.trim().length;
    const wordCount = input.split(' ').filter((w: string) => w.trim().length >= 1).length;
    if (length > 4000) {
      return 'notifications.inputTooLong';
    }
    if (wordCount > 10) {
      return 'notifications.inputTooManyWords';
    }
    return null;
  }

  search(input: string): Observable<SearchResultItemTyped<AddressToCoordinateApiData>[]> {
    input = input.trim();
    if (!input) {
      return of([]);
    }

    const request = `https://api3.geo.admin.ch/rest/services/api/SearchServer?lang=de&searchText=${encodeURIComponent(
      input
    )}&lang=de&type=locations&origins=address&limit=10&sr=2056`;
    return this.httpClient.get<{results: AddressToCoordinateApiData[]}>(request).pipe(
      map((data) => {
        const resultWeightDesc = (a: AddressToCoordinateApiData, b: AddressToCoordinateApiData) => b.weight - a.weight;
        return data.results
          .sort(resultWeightDesc)
          .map(apiSearchResult => ({ text: apiSearchResult.attrs.label, originalInput: input, data: apiSearchResult }));
      }),
      catchError(err => {
        return of([]);
      })
    );
  }

  transformInput(input: SearchResultItemTyped<AddressToCoordinateApiData>): AddressCoordinateTableEntry {
    const r = input.data;
    return {
      address: this.sanitize(r.attrs.label),
      id: r.attrs.featureId,
      wgs84: coords(r.attrs.lat, r.attrs.lon, CoordinateSystem.WGS_84),
      lv95: coords(r.attrs.x, r.attrs.y, CoordinateSystem.LV_95),
      isValid: true
    };
  }

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string {
    return entry.address!;
  }

  getDefaultColumns(): ColumnConfigItem[] {
    return [
      userCol(ColumnDefinitions.ADDRESS),
      sysCol(ColumnDefinitions.EDIT),
      userCol(ColumnDefinitions.WGS_84),
      inactiveUserCol(ColumnDefinitions.LV_95),
      inactiveUserCol(ColumnDefinitions.LV_03),
      inactiveUserCol(ColumnDefinitions.HEIGHT),
      inactiveUserCol(ColumnDefinitions.EGID),
      inactiveUserCol(ColumnDefinitions.EGRID)
    ];
  }

  getExampleFileContent(): string {
    return `Bundesplatz 1 3011 Bern\r\nSeftigenstrasse 264 3084 Wabern\r\nParadeplatz 2\r\n`;
  }

  private sanitize(htmlInput: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlInput;
    return div.textContent || div.innerText || '';
  }
}
