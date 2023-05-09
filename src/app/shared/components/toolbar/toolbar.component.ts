import { Component, ViewContainerRef } from '@angular/core';
import { DownloadService } from '../../services';
import { ColumnService } from '../../services/column.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  constructor(public downloadService: DownloadService, public columnService: ColumnService, public viewContainerRef: ViewContainerRef) {}
}
