import { Component, EventEmitter, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { map } from 'rxjs';
import { AddressService, DownloadService } from '../../services';
import { ColumnService } from '../../services/column.service';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { ColumnDefinitions } from '../../models/ColumnConfiguration';
import { MatRipple } from '@angular/material/core';
import { MapInteractionService } from '../../services/map-interaction.service';
import { CoordinateSystem, CoordinateSystemNames } from '../../models/CoordinateSystem';

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent implements OnInit {
  @Output()
  editHandler = new EventEmitter<AddressCoordinateTableEntry>();

  @ViewChild('tableRipple') tableRipple: MatRipple | undefined;

  displayedColumns$ = this.columnService.activeColumnsKeys$.pipe(
    map(userConfig => {
      const expandedColumns = userConfig.flatMap(c => this.columnService.expandCoordinateColumnOrDefault(c, '_'));
      expandedColumns.unshift('trash');
      expandedColumns.push('config');
      return expandedColumns;
    })
  );

  coordinateColumns: ColumnDefinitions[] = [ColumnDefinitions.WGS_84, ColumnDefinitions.LV_95, ColumnDefinitions.LV_03];

  genericColumns: ColumnDefinitions[] = [
    ColumnDefinitions.ADDRESS,
    ColumnDefinitions.EGID,
    ColumnDefinitions.EGRID,
    ColumnDefinitions.HEIGHT
  ];

  highlightId = '';

  coordinateSystemNames: any = CoordinateSystemNames;

  constructor(
    public addressService: AddressService,
    public columnService: ColumnService,
    public dialog: MatDialog,
    public viewContainerRef: ViewContainerRef,
    private downloadService: DownloadService,
    private mapInteractionService: MapInteractionService
  ) {}

  ngOnInit() {
    this.downloadService.addressesCopied$.subscribe(() => this.tableRipple?.launch(0, 0, { centered: true }));

    this.mapInteractionService.mapToTable$.subscribe(x => {
      this.highlightRow(x.id, x.end);
    });
  }

  rowHovered(row: AddressCoordinateTableEntry, isHovered: boolean) {
    this.mapInteractionService.sendToMap(row.id, isHovered);
  }

  private highlightRow(id: string, end: boolean) {
    if (end) {
      this.highlightId = '';
    } else {
      this.highlightId = id;
    }
  }
}
