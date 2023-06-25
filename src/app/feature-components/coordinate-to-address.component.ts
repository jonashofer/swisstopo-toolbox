import { Component } from '@angular/core';
import { getFeatureProviders, CoordinateToAddressService } from '../feature-services';

@Component({
  selector: 'app-coordinate-to-address',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(CoordinateToAddressService)]
})
export class CoordinateToAddressComponent {}
