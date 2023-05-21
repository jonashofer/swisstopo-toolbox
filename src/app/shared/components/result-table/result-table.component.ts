import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { map, tap } from 'rxjs';
import { AddressService, DownloadService } from '../../services';
import { ColumnService } from '../../services/column.service';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { CoordinateSystem } from '../../models/CoordinateSystem';
import { ColumnDefinitions } from '../../models/ColumnConfiguration';
import { MatRipple } from '@angular/material/core';

//all columns that should not be rendered in a generic way, need to have a custom
//matColumnDef in the template and need to be registered here
const customLayoutColumns: string[] = [
  ColumnDefinitions.WGS_84,
  ColumnDefinitions.LV_95,
  ColumnDefinitions.LV_03,
  ColumnDefinitions.ADDRESS,
  ColumnDefinitions.EDIT_ADDRESS,
  // ColumnDefinitions.COORDINATE_CHIPS
];

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent implements OnInit {
  @Output()
  editHandler = new EventEmitter<AddressCoordinateTableEntry>();

  @ViewChild('ripple') ripple: MatRipple | undefined;

  displayedColumns$ = this.columnService.columns$.pipe(
    map(userConfig => {
      const expandedColumns = userConfig.flatMap(c => this.expandColumnForView(c));
      expandedColumns.unshift('trash');
      expandedColumns.push('config');
      return expandedColumns;
    })
  );

  standardLayoutColumns$ = this.columnService.columns$.pipe(
    map(c => {
      return c.filter(e => !customLayoutColumns.includes(e));
    })
  );

  sys = CoordinateSystem;
  col = ColumnDefinitions;

  constructor(
    public addressService: AddressService,
    public columnService: ColumnService,
    public dialog: MatDialog,
    public viewContainerRef: ViewContainerRef,
    private downloadService: DownloadService
  ) {}

  ngOnInit() {
    this.downloadService.addressesCopied$.subscribe(() => this.ripple?.launch(0, 0, { centered: true }));
  }

  private expandColumnForView(column: ColumnDefinitions): string[] {
    switch (column) {
      case ColumnDefinitions.WGS_84:
        return ['wgs84_lat', 'wgs84_lon'];
      case ColumnDefinitions.LV_95:
      case ColumnDefinitions.LV_03:
        return [`${column}_east`, `${column}_north`];
      default:
        return [column];
    }
  }
}
