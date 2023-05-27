import { Injectable } from '@angular/core';
import { FeatureServiceBase, LabelType, SearchResultItemTyped, } from './base/feature-base.service';
import { AddressToCoordinateApiData } from '../api.service';
import { Observable } from 'rxjs';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { ColumnConfigItem, ColumnDefinitions, inactiveUserCol, sysCol, userCol } from '../../models/ColumnConfiguration';
import { AddressToCoordinateService } from './address-to-coordinate.feature';

@Injectable()
export class AddressToEgidService extends FeatureServiceBase<AddressToCoordinateApiData> {

  showCoordinateSystemSwitch = false;

  constructor(private readonly atcService: AddressToCoordinateService) {
    super('address-to-egid', LabelType.ADDRESS);
    this.messageForMultipleResults = 'table.entry.warning.ambiguous';
  }

  validateSearchInput(input: string): string | null {
    return this.atcService.validateSearchInput(input);
  }

  search(input: string): Observable<SearchResultItemTyped<AddressToCoordinateApiData>[]> {
    return this.atcService.search(input);
  }

  transformInput(input: SearchResultItemTyped<AddressToCoordinateApiData>): Observable<AddressCoordinateTableEntry> {
    return this.atcService.transformInput(input);
  }

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string {
    return entry.address;
  }

  getDefaultColumns(): ColumnConfigItem[] {
    return [
      userCol(ColumnDefinitions.ADDRESS),
      sysCol(ColumnDefinitions.EDIT_ADDRESS),
      userCol(ColumnDefinitions.EGID),
      inactiveUserCol(ColumnDefinitions.WGS_84),
      inactiveUserCol(ColumnDefinitions.LV_95),
      inactiveUserCol(ColumnDefinitions.LV_03),
      inactiveUserCol(ColumnDefinitions.HEIGHT),
      inactiveUserCol(ColumnDefinitions.EGRID)
    ];
  }

  getExampleFileContent(): string {
    return this.atcService.getExampleFileContent();
  }
}
