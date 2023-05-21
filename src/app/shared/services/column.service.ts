import { Inject, Injectable, ViewContainerRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BehaviorSubject, filter, map, pairwise } from 'rxjs';
import { ColumnConfigDialogComponent } from '../components/column-config-dialog/column-config-dialog.component';
import { ColumnConfigItem, ColumnDefinitions, getColumnDefinition, inactiveUserCol, sysCol, userCol } from '../models/ColumnConfiguration';
import { StorageService } from './storage.service';
import { CoordinateSystem } from '../models/CoordinateSystem';
import { FEATURE_TAB_CONFIG, FeatureTabConfig } from 'src/app/feature-tab.config';
import { CoordinateService } from './coordinate.service';

@Injectable()
export class ColumnService {
  private readonly columns = new BehaviorSubject<ColumnConfigItem[]>(this.getInitial());

  public readonly columns$ = this.columns.asObservable().pipe(
    map(e => {
      return e.filter(c => c.active).map(c => c.key);
    })
  );

  storageKey = '';
  featureIdentifier = '';

  constructor(
    @Inject(FEATURE_TAB_CONFIG) featureIdentifier: FeatureTabConfig,
    private readonly dialog: MatDialog,
    private readonly coordinateService: CoordinateService
  ) {
    this.featureIdentifier = featureIdentifier.shortName;
    this.storageKey = `displayColumns_${featureIdentifier.shortName}`;
    this.columns.next(StorageService.get<ColumnConfigItem[]>(this.storageKey) || this.getInitial());
    this.coordinateService.currentSystem$
      .pipe(pairwise())
      .subscribe(([oldSystem, newSystem]) => this.handleCoordinateSystemChange(oldSystem, newSystem));
  }

  public getCurrentConfig() {
    return this.columns.getValue();
  }

  public setConfig(config: ColumnConfigItem[]) {
    this.columns.next(config);
    this.saveConfig();
  }

  public openConfigDialog(viewContainerRef: ViewContainerRef) {
    return this.dialog.open(ColumnConfigDialogComponent, { viewContainerRef: viewContainerRef }).afterClosed();
  }

  // NOTE: this does only (de-)activate the respective systems and does not handle cases
  //       with custom orders or multiple systems activated manually by the user
  private handleCoordinateSystemChange(oldSystem: CoordinateSystem, newSystem: CoordinateSystem) {
    if (oldSystem === newSystem || this.columns.value == null) {
      return;
    }
    const newColumns = this.columns.value.slice();

    // set old to inactive
    const oldSystemItem = newColumns.find(c => c.key === getColumnDefinition(oldSystem));
    if (oldSystemItem) {
      oldSystemItem.active = false;
    }
    
    // set new to active
    const newSystemItem = newColumns.find(c => c.key === getColumnDefinition(newSystem));
    if (newSystemItem) {
      newSystemItem.active = true;
    }

    this.columns.next(newColumns);
    this.saveConfig();
  }

  public getInitial(): ColumnConfigItem[] {
    switch (this.featureIdentifier) {
      case 'atc':
        return [
          userCol(ColumnDefinitions.ADDRESS),
          sysCol(ColumnDefinitions.EDIT_ADDRESS),
          userCol(ColumnDefinitions.WGS_84),
          inactiveUserCol(ColumnDefinitions.LV_95),
          inactiveUserCol(ColumnDefinitions.LV_03),
          inactiveUserCol(ColumnDefinitions.HEIGHT),
          inactiveUserCol(ColumnDefinitions.EGID),
          inactiveUserCol(ColumnDefinitions.EGRID),
        ];
      case 'cta':
        return [
          // sysCol(ColumnDefinitions.COORDINATE_CHIPS),
          userCol(ColumnDefinitions.WGS_84),
          userCol(ColumnDefinitions.ADDRESS),
          sysCol(ColumnDefinitions.EDIT_ADDRESS),
          inactiveUserCol(ColumnDefinitions.LV_95),
          inactiveUserCol(ColumnDefinitions.LV_03),
          inactiveUserCol(ColumnDefinitions.HEIGHT),
          inactiveUserCol(ColumnDefinitions.EGID),
          inactiveUserCol(ColumnDefinitions.EGRID),
        ];
      default:
        return [];
    }
  }

  private saveConfig() {
    StorageService.save(this.storageKey, this.columns.value);
  }
}
