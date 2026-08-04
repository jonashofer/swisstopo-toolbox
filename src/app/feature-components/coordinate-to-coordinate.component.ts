import { Component } from '@angular/core';
import { getFeatureProviders, CoordinateToCoordinateService } from '../feature-services';
import { FeatureTabComponent } from '../shared/components/feature-tab/feature-tab.component';

@Component({
  selector: 'app-coordinate-to-coordinate',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(CoordinateToCoordinateService)],
  imports: [FeatureTabComponent]
})
export class CoordinateToCoordinateComponent {}
