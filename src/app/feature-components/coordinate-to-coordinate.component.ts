import { Component } from '@angular/core';
import { ReverseApiService } from '../shared/services';
import { getFeatureProviders, CoordinateToAddressService, CoordinateToCoordinateService } from '../feature-services';

@Component({
  selector: 'app-coordinate-to-coordinate',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [ReverseApiService, getFeatureProviders(CoordinateToCoordinateService)]
})
export class CoordinateToCoordinateComponent {}
