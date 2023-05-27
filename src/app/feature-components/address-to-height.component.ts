import { Component } from '@angular/core';
import { AddressToHeightService } from '../feature-services/address-to-height.feature';
import { getFeatureProviders, AddressToCoordinateService } from '../feature-services';

@Component({
  selector: 'app-address-to-height',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(AddressToHeightService), AddressToCoordinateService]
})
export class AddressToHeightComponent {}
