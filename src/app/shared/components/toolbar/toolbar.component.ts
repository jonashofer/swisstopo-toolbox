import { Component, Inject } from '@angular/core';
import { DownloadService, FEATURE_SERVICE_TOKEN, FeatureService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import { SharedStandaloneModule } from '../../shared-standalone.module';
import { DownloadSelectorComponent } from '../download-selector/download-selector.component';
import { CoordinateSystemSwitchComponent } from '../coordinate-system-switch/coordinate-system-switch.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  imports: [SharedStandaloneModule, DownloadSelectorComponent, CoordinateSystemSwitchComponent]
})
export class ToolbarComponent {
  constructor(
    public downloadService: DownloadService,
    @Inject(FEATURE_SERVICE_TOKEN) public featureService: FeatureService,
    private translate: TranslateService
  ) {}

  public getCopyTooltip(): string {
    return this.translate.instant('table.clipboard.copy', {
      item: this.translate.instant(`table.clipboard.table`)
    });
  }
}
