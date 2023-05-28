import { Component } from '@angular/core';
import { getFeatureProviders, AddressToCoordinateService, AddressToHeightService } from '../feature-services';

@Component({
  selector: 'app-address-to-height',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(AddressToHeightService), AddressToCoordinateService]
})
export class AddressToHeightComponent {}
