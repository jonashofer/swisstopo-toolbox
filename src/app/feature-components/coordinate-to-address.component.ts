import { Component } from '@angular/core';
import { ReverseApiService } from '../shared/services';
import { CoordinateToAddressService, getFeatureProviders } from '../shared/services/feature-services';

@Component({
  selector: 'app-coordinate-to-address',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [ReverseApiService, getFeatureProviders(CoordinateToAddressService)]
})
export class CoordinateToAddressComponent {}
