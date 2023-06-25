import { Component } from '@angular/core';
import { getFeatureProviders, CoordinateToCoordinateService, CoordinateToHeightService } from '../feature-services';

@Component({
  selector: 'app-coordinate-to-height',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(CoordinateToHeightService), CoordinateToCoordinateService]
})
export class CoordinateToHeightComponent {}
