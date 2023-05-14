import { Inject, Injectable, ViewContainerRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BehaviorSubject, filter, map, pairwise } from 'rxjs';
import { ColumnConfigDialogComponent } from '../components/column-config-dialog/column-config-dialog.component';
import { ColumnConfigItem, ColumnDefinitions, getColumnDefinition, sysCol, userCol } from '../models/ColumnConfiguration';
import { StorageService } from './storage.service';
import { CoordinateSystem } from '../models/CoordinateSystem';
import { FEATURE_TAB_CONFIG, FeatureTabConfig } from 'src/app/feature-tab.config';
import { CoordinateService } from './coordinate.service';

@Injectable()
export class ColumnService {
  private readonly columns = new BehaviorSubject<ColumnConfigItem[]>(this.getInitial());

  public readonly columns$ = this.columns.asObservable().pipe(
    map(e => {
      return e.map(c => c.key);
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

  private handleCoordinateSystemChange(oldSystem: CoordinateSystem, newSystem: CoordinateSystem) {
    if (oldSystem === newSystem || this.columns.value == null) {
      return;
    }
    const newColumns = this.columns.value.slice();
    const existingIndex = newColumns.findIndex(c => c.key === getColumnDefinition(oldSystem));
    const newItem: ColumnConfigItem = { key: getColumnDefinition(newSystem), isSystemColumn: false };

    if (existingIndex != -1) {
      newColumns[existingIndex] = newItem;
    } else {
      newColumns.unshift(newItem);
    }
    this.columns.next(newColumns);
    this.saveConfig();
  }

  // TODO refactor to not have tab identifiers all over the place
  private getInitial(): ColumnConfigItem[] {
    switch (this.featureIdentifier) {
      case 'atc':
        return [
          userCol(ColumnDefinitions.ADDRESS),
          sysCol(ColumnDefinitions.EDIT_ADDRESS),
          userCol(ColumnDefinitions.WGS_84)
        ];
      case 'cta':
        return [
          // sysCol(ColumnDefinitions.COORDINATE_CHIPS),
          userCol(ColumnDefinitions.WGS_84),
          userCol(ColumnDefinitions.ADDRESS),
          sysCol(ColumnDefinitions.EDIT_ADDRESS)
        ];
      default:
        return [];
    }
  }

  private saveConfig() {
    StorageService.save(this.storageKey, this.columns.value);
  }
}
