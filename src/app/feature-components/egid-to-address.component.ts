import { Component } from '@angular/core';
import { getFeatureProviders, AddressToCoordinateService, EgidToAddressService } from '../feature-services';

@Component({
    selector: 'app-egid-to-address',
    template: `<app-feature-tab></app-feature-tab>`,
    providers: getFeatureProviders(EgidToAddressService),
    standalone: false
})
export class EgidToAddressComponent {}
