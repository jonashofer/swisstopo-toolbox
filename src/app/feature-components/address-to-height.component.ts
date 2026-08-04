import { Component } from '@angular/core';
import { getFeatureProviders, AddressToCoordinateService, AddressToHeightService } from '../feature-services';
import { FeatureTabComponent } from '../shared/components/feature-tab/feature-tab.component';

@Component({
  selector: 'app-address-to-height',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(AddressToHeightService), AddressToCoordinateService],
  imports: [FeatureTabComponent]
})
export class AddressToHeightComponent {}
