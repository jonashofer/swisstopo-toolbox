import { Injectable } from '@angular/core';
import { FeatureServiceBase, SearchResultItemTyped, } from './feature-base.service';
import { AddressToCoordinateApiData, ApiService } from '../api.service';
import { Observable, catchError, map, of } from 'rxjs';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { ColumnConfigItem, ColumnDefinitions, inactiveUserCol, sysCol, userCol } from '../../models/ColumnConfiguration';

@Injectable()
export class AddressToCoordinateService extends FeatureServiceBase<AddressToCoordinateApiData> {

  constructor(private readonly apiService: ApiService) {
    super('address-to-coordinate', 'atc');
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

  searchMultiple(lines: string[]): Observable<AddressCoordinateTableEntry> {
    throw new Error('Method not implemented.');
  }

  transformInput(input: SearchResultItemTyped<AddressToCoordinateApiData>): Observable<AddressCoordinateTableEntry> {
    return of(this.apiService.mapApiResultToAddress(input.data));
  }

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string {
    //TODO check
    return entry.address;
  }

  getDefaultColumns(): ColumnConfigItem[] {
    return [
      userCol(ColumnDefinitions.ADDRESS),
      sysCol(ColumnDefinitions.EDIT_ADDRESS),
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
