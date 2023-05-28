import { Injectable } from '@angular/core';
import { AddressToCoordinateService } from './address-to-coordinate.feature';
import { Observable } from 'rxjs';
import { LabelType } from '.';
import { AddressCoordinateTableEntry, ColumnDefinitions } from '../shared/models';
import { ColumnConfigItem, userCol, sysCol, inactiveUserCol } from '../shared/models/ColumnConfiguration';
import { AddressToCoordinateApiData } from '../shared/services/api.service';
import { FeatureServiceBase, SearchResultItemTyped } from '../shared/services/feature.service';

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
      sysCol(ColumnDefinitions.EDIT),
      userCol(ColumnDefinitions.EGID),
      inactiveUserCol(ColumnDefinitions.EGRID),
      inactiveUserCol(ColumnDefinitions.WGS_84),
      inactiveUserCol(ColumnDefinitions.LV_95),
      inactiveUserCol(ColumnDefinitions.LV_03),
      inactiveUserCol(ColumnDefinitions.HEIGHT),
    ];
  }

  getExampleFileContent(): string {
    return this.atcService.getExampleFileContent();
  }
}
