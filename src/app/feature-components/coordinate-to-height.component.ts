import { Component } from '@angular/core';
import { ReverseApiService } from '../shared/services';
import { getFeatureProviders, CoordinateToCoordinateService, CoordinateToHeightService } from '../feature-services';

@Component({
  selector: 'app-coordinate-to-height',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [ReverseApiService, getFeatureProviders(CoordinateToHeightService), CoordinateToCoordinateService]
})
export class CoordinateToHeightComponent {}
