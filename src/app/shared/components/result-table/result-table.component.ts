import { Component, EventEmitter, OnInit, Output, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { map } from 'rxjs';
import { AddressService, DownloadService } from '../../services';
import { ColumnService } from '../../services/column.service';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { ColumnDefinitions } from '../../models/ColumnConfiguration';
import { MatRipple } from '@angular/material/core';
import { MapInteractionService } from '../../services/map-interaction.service';
import { CoordinateSystemNames } from '../../models/CoordinateSystem';
import { Clipboard } from '@angular/cdk/clipboard';
import { ObNotificationService } from '@oblique/oblique';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { SharedStandaloneModule } from '../../shared-standalone.module';
import { CoordinatePipe } from '../coordinate.pipe';

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss'],
  imports: [SharedStandaloneModule, CoordinatePipe]
})
export class ResultTableComponent implements OnInit {
  addressService = inject(AddressService);
  columnService = inject(ColumnService);
  dialog = inject(MatDialog);
  viewContainerRef = inject(ViewContainerRef);
  private downloadService = inject(DownloadService);
  private mapInteractionService = inject(MapInteractionService);
  private clipboard = inject(Clipboard);
  private notifcationService = inject(ObNotificationService);
  private translate = inject(TranslateService);

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

  coordinateSystemNames = CoordinateSystemNames;

  ngOnInit() {
    this.downloadService.addressesCopied$.subscribe(() => {
      this.tableRipple?.launch(0, 0, { centered: true });
      this.copyNotify('table');
    });

    this.mapInteractionService.mapToTable$.subscribe(x => {
      this.highlightRow(x.id, x.end);
    });
  }

  rowHovered(row: AddressCoordinateTableEntry, isHovered: boolean) {
    this.mapInteractionService.sendToMap(row.id, isHovered);
  }

  copyRowData(item: AddressCoordinateTableEntry) {
    const dataToCopy = this.downloadService.getCopyToCliboardRow(item);
    this.clipboard.copy(dataToCopy);
    this.copyNotify('row');
  }

  copyColumnData(column: string) {
    const dataToCopy = this.downloadService.getCopyToClipboardColum(column);
    this.clipboard.copy(dataToCopy);
    this.copyNotify('column');
  }

  private highlightRow(id: string, end: boolean) {
    if (end) {
      this.highlightId = '';
    } else {
      this.highlightId = id;
    }
  }

  public copyTooltip(typeKey: string) {
    return this.translate.instant('table.clipboard.copy', {
      item: this.translate.instant(`table.clipboard.${typeKey}`)
    });
  }

  public copyNotify(typeKey: string) {
    const message = this.translate.instant('table.clipboard.copied', {
      item: this.translate.instant(`table.clipboard.${typeKey}`)
    });
    this.notifcationService.info(message);
  }
}
