import { Component } from '@angular/core';
import { getFeatureProviders, AddressToEgidService, AddressToCoordinateService } from '../shared/services/features';

@Component({
  selector: 'app-address-to-egid',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(AddressToEgidService), AddressToCoordinateService]
})
export class AddressToEgidComponent {}
