import { Component } from '@angular/core';
import { getFeatureProviders, AddressToCoordinateService } from '../shared/services/features';

@Component({
  selector: 'app-address-to-coordinate',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: getFeatureProviders(AddressToCoordinateService)
})
export class AddressToCoordinateComponent {}
