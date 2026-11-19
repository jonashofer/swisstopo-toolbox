import { Component, ChangeDetectionStrategy } from '@angular/core';
import { getFeatureProviders, AddressToCoordinateService, AddressToHeightService } from '../feature-services';
import { FeatureTabComponent } from '../shared/components/feature-tab/feature-tab.component';

@Component({
  selector: 'app-address-to-height',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(AddressToHeightService), AddressToCoordinateService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FeatureTabComponent]
})
export class AddressToHeightComponent {}
