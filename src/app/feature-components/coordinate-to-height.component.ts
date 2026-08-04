import { Component } from '@angular/core';
import { getFeatureProviders, CoordinateToCoordinateService, CoordinateToHeightService } from '../feature-services';
import { FeatureTabComponent } from '../shared/components/feature-tab/feature-tab.component';

@Component({
  selector: 'app-coordinate-to-height',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(CoordinateToHeightService), CoordinateToCoordinateService],
  imports: [FeatureTabComponent]
})
export class CoordinateToHeightComponent {}
