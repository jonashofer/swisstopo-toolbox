import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddressCoordinateTableEntry, ColumnDefinitions } from '../shared/models';
import { ColumnConfigItem, userCol, sysCol, inactiveUserCol } from '../shared/models/ColumnConfiguration';
import { ReverseApiService, CoordinateService } from '../shared/services';
import { CoordinateToAddressApiData } from '../shared/services/reverse-api.service';
import { FeatureServiceBase, LabelType, SearchResultItemTyped } from '../shared/services/feature.service';

@Injectable()
export class CoordinateToAddressService extends FeatureServiceBase<CoordinateToAddressApiData> {

  constructor(
    private readonly reverseApiService: ReverseApiService,
  ) {
    super('coordinate-to-address', LabelType.COORDINATE);
  }

  validateSearchInput(input: string): string | null {
    return this.reverseApiService.validateSearchInput(input);
  }

  search(validInput: string): Observable<SearchResultItemTyped<CoordinateToAddressApiData>[]> {
    const coords = CoordinateService.tryParse(validInput)!;
    return this.reverseApiService.search(coords, validInput);
  }

  transformInput(input: SearchResultItemTyped<CoordinateToAddressApiData>): Observable<AddressCoordinateTableEntry> {
    return this.reverseApiService.mapReverseApiResultToAddress(input);
  }

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string {
    return entry.originalInput || '';
  }

  getDefaultColumns(): ColumnConfigItem[] {
    return [
      userCol(ColumnDefinitions.WGS_84),
      userCol(ColumnDefinitions.ADDRESS),
      sysCol(ColumnDefinitions.EDIT_ADDRESS),
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
}
