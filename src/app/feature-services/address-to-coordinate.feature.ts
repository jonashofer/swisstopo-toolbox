import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { ColumnConfigItem, ColumnDefinitions, inactiveUserCol, sysCol, userCol } from '../shared/models/ColumnConfiguration';
import { AddressToCoordinateApiData, ApiService } from '../shared/services/api.service';
import { FeatureServiceBase, LabelType, SearchResultItemTyped } from '../shared/services/feature.service';

@Injectable()
export class AddressToCoordinateService extends FeatureServiceBase<AddressToCoordinateApiData> {

  constructor(private readonly apiService: ApiService) {
    super('address-to-coordinate', LabelType.ADDRESS);
    this.messageForMultipleResults = 'table.entry.warning.ambiguous';
  }

  validateSearchInput(input: string): string | null {
    return this.apiService.validateSearchInput(input);
  }

  search(input: string): Observable<SearchResultItemTyped<AddressToCoordinateApiData>[]> {
    return this.apiService.searchLocationsList(input).pipe(
      map(r =>
        r.map(apiSearchResult => ({ text: apiSearchResult.attrs.label, originalInput: input, data: apiSearchResult }))
      ),
      catchError(err => {
        return of([]);
      })
    );
  }

  transformInput(input: SearchResultItemTyped<AddressToCoordinateApiData>): Observable<AddressCoordinateTableEntry> {
    return of(this.apiService.mapApiResultToAddress(input.data));
  }

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string {
    return entry.address;
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
}