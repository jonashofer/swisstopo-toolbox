import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CoordinateToCoordinateService, LabelType } from '.';
import { AddressCoordinateTableEntry, ColumnDefinitions, Coordinate } from '../shared/models';
import { ColumnConfigItem, userCol, sysCol, inactiveUserCol } from '../shared/models/ColumnConfiguration';
import { FeatureServiceBase, SearchResultItemTyped } from '../shared/services/feature.service';

@Injectable()
export class CoordinateToHeightService extends FeatureServiceBase<Coordinate> {

  constructor(private readonly ctcService: CoordinateToCoordinateService) {
    super('coordinate-to-height', LabelType.COORDINATE);
  }

  validateSearchInput(input: string): string | null {
    return this.ctcService.validateSearchInput(input);
  }

  search(validInput: string): Observable<SearchResultItemTyped<Coordinate>[]> {
    return this.ctcService.search(validInput);
  }

  transformInput(input: SearchResultItemTyped<Coordinate>): Observable<AddressCoordinateTableEntry> {
    return this.ctcService.transformInput(input);
  }

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string {
    return this.ctcService.transformEntryForEdit(entry);
  }

  getDefaultColumns(): ColumnConfigItem[] {
    return [
      userCol(ColumnDefinitions.WGS_84),
      inactiveUserCol(ColumnDefinitions.LV_95),
      inactiveUserCol(ColumnDefinitions.LV_03),
      sysCol(ColumnDefinitions.EDIT),
      userCol(ColumnDefinitions.HEIGHT),


      // do not setup since not applicable here
      // inactiveUserCol(ColumnDefinitions.ADDRESS),
      // inactiveUserCol(ColumnDefinitions.EGID),
      // inactiveUserCol(ColumnDefinitions.EGRID)
    ];
  }

  getExampleFileContent(): string {
    return this.ctcService.getExampleFileContent();
  }
}
