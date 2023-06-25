import { Component } from '@angular/core';
import { getFeatureProviders, CoordinateToAddressService, CoordinateToCoordinateService } from '../feature-services';

@Component({
  selector: 'app-coordinate-to-coordinate',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(CoordinateToCoordinateService)]
})
export class CoordinateToCoordinateComponent {}
