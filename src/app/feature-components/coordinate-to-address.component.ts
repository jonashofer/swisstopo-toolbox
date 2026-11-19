import { Component, ChangeDetectionStrategy } from '@angular/core';
import { getFeatureProviders, CoordinateToAddressService } from '../feature-services';
import { FeatureTabComponent } from '../shared/components/feature-tab/feature-tab.component';

@Component({
  selector: 'app-coordinate-to-address',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: [getFeatureProviders(CoordinateToAddressService)],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FeatureTabComponent]
})
export class CoordinateToAddressComponent {}
