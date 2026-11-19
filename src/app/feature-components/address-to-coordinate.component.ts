import { Component, ChangeDetectionStrategy } from '@angular/core';
import { getFeatureProviders, AddressToCoordinateService } from '../feature-services';
import { FeatureTabComponent } from '../shared/components/feature-tab/feature-tab.component';

@Component({
  selector: 'app-address-to-coordinate',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: getFeatureProviders(AddressToCoordinateService),
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FeatureTabComponent]
})
export class AddressToCoordinateComponent {}
