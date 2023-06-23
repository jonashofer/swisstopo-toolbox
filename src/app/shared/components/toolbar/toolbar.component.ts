import { Component, Inject } from '@angular/core';
import { DownloadService, FEATURE_SERVICE_TOKEN, FeatureService } from '../../services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  constructor(public downloadService: DownloadService,
    @Inject(FEATURE_SERVICE_TOKEN) public featureService: FeatureService,
    private translate: TranslateService) {}

    public getCopyTooltip(): string {
      return this.translate.instant('table.clipboard.copy', {
        item: this.translate.instant(`table.clipboard.table`)
      });
    }
}
