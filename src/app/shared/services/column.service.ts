import { Inject, Injectable, ViewContainerRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BehaviorSubject, filter, map } from 'rxjs';
import { ColumnConfigDialogComponent } from '../components/column-config-dialog/column-config-dialog.component';
import { ColumnConfig, ColumnDefinitions, getColumnDefinition } from '../models/ColumnConfiguration';
import { StorageService } from './storage.service';
import { CoordinateSystem } from '../models/CoordinateSystem';
import { FEATURE_TAB_CONFIG, FeatureTabConfig } from 'src/app/feature-tab.config';

const STORAGE_KEY = 'columns';

@Injectable()
export class ColumnService {
  private readonly columns = new BehaviorSubject<ColumnConfig>(this.getInitial(""));

  public readonly columns$ = this.columns.asObservable().pipe(
    filter((v): v is ColumnConfig => !!v),
    map(e => {
      return e.columns.map(e => e.key);
    })
  );

  constructor(@Inject(FEATURE_TAB_CONFIG) featureIdentifier: FeatureTabConfig, private readonly dialog: MatDialog) {
    const first = StorageService.get<ColumnConfig>(STORAGE_KEY) || this.getInitial(featureIdentifier.shortName);
    this.columns.next(first);
  }

  public changeCoordinateSystem(oldSystem: CoordinateSystem, newSystem: CoordinateSystem) {
    if (oldSystem === newSystem || this.columns.value == null) {
      return;
    }
    const newColumns = this.columns.value.columns.slice();
    const existingIndex = newColumns.findIndex(c => c.key === getColumnDefinition(oldSystem));
    const newItem = { key: getColumnDefinition(newSystem) };

    if (existingIndex != -1) {
      newColumns[existingIndex] = newItem;
    } else {
      newColumns.unshift(newItem);
    }
  }

  public getCurrentConfig() {
    return this.columns.getValue();
  }

  public setConfig(config: ColumnConfig) {
    this.columns.next(config);
    StorageService.save(STORAGE_KEY, config);
  }

  public openConfigDialog(viewContainerRef: ViewContainerRef) {
    return this.dialog.open(ColumnConfigDialogComponent, { viewContainerRef: viewContainerRef }).afterClosed();
  }

  // TODO refactor to not have tab identifiers all over the place
  private getInitial(featureIdentifier: string) {
    switch (featureIdentifier) {
      case 'atc':
        return {
          key: 'atc',
          columns: [{ key: ColumnDefinitions.WGS_84 }]
        };
      case 'cta':
        return {
          key: 'cta',
          columns: [{ key: ColumnDefinitions.WGS_84 }]
        };
      default:
        return {
          key: 'default',
          columns: [{ key: ColumnDefinitions.WGS_84 }]
        };
    }
  }
}
