import { Component, Inject } from '@angular/core';
import { DownloadService } from '../../services';
import { FEATURE_SERVICE_TOKEN, FeatureService } from '../../services/feature-services';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  constructor(public downloadService: DownloadService,
    @Inject(FEATURE_SERVICE_TOKEN) public featureService: FeatureService) {}
}
