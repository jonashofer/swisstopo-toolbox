import { Component } from '@angular/core';
import { getFeatureProviders, AddressToEgidService, AddressToCoordinateService } from '../feature-services';
import { FeatureTabComponent } from '../shared/components/feature-tab/feature-tab.component';

@Component({
  selector: 'app-address-to-egid',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(AddressToEgidService), AddressToCoordinateService],
  imports: [FeatureTabComponent]
})
export class AddressToEgidComponent {}
