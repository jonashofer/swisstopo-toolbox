import { Injectable } from '@angular/core';
import { AddressToCoordinateApiData, AddressToCoordinateService } from './address-to-coordinate.feature';
import { Observable } from 'rxjs';
import { LabelType } from '.';
import { ColumnConfigItem, userCol, sysCol, inactiveUserCol, ColumnDefinitions } from '../shared/models/ColumnConfiguration';
import { FeatureServiceBase, SearchResultItemTyped } from '../shared/services/feature.service';
import { AddressCoordinateTableEntry } from '../shared/models';

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

  transformInput(input: SearchResultItemTyped<AddressToCoordinateApiData>): AddressCoordinateTableEntry {
    return this.atcService.transformInput(input);
  }

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string {
    return entry.address!;
  }

  getDefaultColumns(): ColumnConfigItem[] {
    return [
      userCol(ColumnDefinitions.ADDRESS),
      sysCol(ColumnDefinitions.EDIT),
      userCol(ColumnDefinitions.EGID),
      userCol(ColumnDefinitions.EGRID),
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
