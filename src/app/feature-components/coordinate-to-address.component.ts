import { Component } from '@angular/core';
import { getFeatureProviders, CoordinateToAddressService } from '../feature-services';
import { FeatureTabComponent } from '../shared/components/feature-tab/feature-tab.component';

@Component({
  selector: 'app-coordinate-to-address',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(CoordinateToAddressService)],
	imports: [FeatureTabComponent]

})
export class CoordinateToAddressComponent {}
