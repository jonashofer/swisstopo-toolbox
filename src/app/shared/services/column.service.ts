import { Injectable, ViewContainerRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BehaviorSubject, map } from 'rxjs';
import { ColumnConfigDialogComponent } from '../components/column-config-dialog/column-config-dialog.component';
import { ColumnConfig, ColumnDefinitions } from '../models/ColumnConfiguration';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'columns';
const DEFAULT: ColumnConfig = {
  key: 'default',
  columns: [
    // { key: ColumnDefinitions.ADDRESS },
    { key: ColumnDefinitions.WGS_84_lat },
    { key: ColumnDefinitions.WGS_84_lon }
  ]
};

@Injectable()
export class ColumnService {
  private readonly columns = new BehaviorSubject<ColumnConfig>(
    StorageService.get<ColumnConfig>(STORAGE_KEY) || DEFAULT
  );

  public readonly columns$ = this.columns.asObservable().pipe(
    map(e => {
      return e.columns.map(e => e.key);
    })
  );

  constructor(private readonly dialog: MatDialog) {}

  public getCurrentConfig() {
    return this.columns.getValue();
  }

  public setConfig(config: ColumnConfig) {
    this.columns.next(config);
    StorageService.save(STORAGE_KEY, config);
  }

  public openConfigDialog(viewContainerRef: ViewContainerRef) {
    return this.dialog.open(ColumnConfigDialogComponent, {viewContainerRef: viewContainerRef}).afterClosed();
  }
}
