import { Injectable } from '@angular/core';
import { CoordinateToAddressApiData, ReverseApiService } from '../reverse-api.service';
import { FeatureServiceBase, SearchResultItemTyped } from './feature-base.service';
import { Coordinate } from '../../models/Coordinate';
import { Observable } from 'rxjs';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { ColumnConfigItem, ColumnDefinitions, inactiveUserCol, sysCol, userCol } from '../../models/ColumnConfiguration';
import { CoordinateService } from '../coordinate.service';

@Injectable()
export class CoordinateToAddressService extends FeatureServiceBase<CoordinateToAddressApiData> {
  constructor(
    private readonly reverseApiService: ReverseApiService,
    private readonly coordinateService: CoordinateService
  ) {
    super('coordinate-to-address', 'cta');
  }

  validateSearchInput(input: string): string | null {
    return this.reverseApiService.validateSearchInput(input);
  }

  search(validInput: string): Observable<SearchResultItemTyped<CoordinateToAddressApiData>[]> {
    const coords = this.coordinateService.tryParse(validInput)!;
    return this.reverseApiService.search(coords);
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
