import { Inject, Injectable, ViewContainerRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BehaviorSubject, filter, map, pairwise } from 'rxjs';
import { ColumnConfigDialogComponent } from '../components/column-config-dialog/column-config-dialog.component';
import { ColumnConfigItem, ColumnDefinitions, getColumnDefinition, inactiveUserCol, sysCol, userCol } from '../models/ColumnConfiguration';
import { CoordinateSystem } from '../models/CoordinateSystem';
import { CoordinateService, FeatureService, StorageService } from '.';
import { FEATURE_SERVICE_TOKEN } from './feature.service';

@Injectable()
export class ColumnService {
  storageKey = `displayColumns_${this.featureService.name}`;

  private readonly _columns = new BehaviorSubject<ColumnConfigItem[]>(
    StorageService.get<ColumnConfigItem[]>(this.storageKey) || this.getInitial()
  );

  public readonly columns$ = this._columns.asObservable();

  public readonly activeColumnsKeys$ = this._columns.asObservable().pipe(
    map(e => {
      return e.filter(c => c.active).map(c => c.key);
    })
  );

  constructor(
    @Inject(FEATURE_SERVICE_TOKEN) private readonly featureService: FeatureService,
    private readonly dialog: MatDialog,
    private readonly coordinateService: CoordinateService
  ) {
    this.coordinateService.currentSystem$
      .pipe(pairwise())
      .subscribe(([oldSystem, newSystem]) => this.handleCoordinateSystemChange(oldSystem, newSystem));
  }

  public getCurrentConfig() {
    return this._columns.getValue();
  }

  public setConfig(config: ColumnConfigItem[]) {
    this._columns.next(config);
    this.saveConfig();
  }

  public openConfigDialog(viewContainerRef: ViewContainerRef) {
    return this.dialog.open(ColumnConfigDialogComponent, { viewContainerRef: viewContainerRef }).afterClosed();
  }

  // NOTE: this does only (de-)activate the respective systems and does not handle cases
  //       with custom orders or multiple systems activated manually by the user
  private handleCoordinateSystemChange(oldSystem: CoordinateSystem, newSystem: CoordinateSystem) {
    if (oldSystem === newSystem || this._columns.value == null) {
      return;
    }
    const newColumns = this._columns.value.slice();

    // set old to inactive
    const oldSystemItem = newColumns.find(c => c.key === getColumnDefinition(oldSystem));
    if (oldSystemItem && !this.featureService.disableInactivationOfOldSystemWhenSwitching) {
      oldSystemItem.active = false;
    }

    // set new to active
    const newSystemItem = newColumns.find(c => c.key === getColumnDefinition(newSystem));
    if (newSystemItem) {
      newSystemItem.active = true;
    }

    this._columns.next(newColumns);
    this.saveConfig();
  }

  public getInitial(): ColumnConfigItem[] {
    return this.featureService.getDefaultColumns();
  }

  private saveConfig() {
    StorageService.save(this.storageKey, this._columns.value);
  }

  public expandCoordinateColumnOrDefault(column: ColumnDefinitions, seperator: string): string[] {
    switch (column) {
      case ColumnDefinitions.WGS_84:
        return [`${column}${seperator}lat`, `${column}${seperator}lon`];
      case ColumnDefinitions.LV_95:
      case ColumnDefinitions.LV_03:
        return [`${column}${seperator}lon`, `${column}${seperator}lat`];
      default:
        return [column];
    }
  }
}
