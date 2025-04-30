import { Component } from '@angular/core';
import { getFeatureProviders, EgidToAddressService } from '../feature-services';
import { FeatureTabComponent } from '../shared/components/feature-tab/feature-tab.component';

@Component({
  selector: 'app-egid-to-address',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: getFeatureProviders(EgidToAddressService),
	imports: [FeatureTabComponent]

})
export class EgidToAddressComponent {}
