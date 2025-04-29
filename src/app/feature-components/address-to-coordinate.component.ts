import { Component } from '@angular/core';
import { getFeatureProviders, AddressToCoordinateService } from '../feature-services';

@Component({
    selector: 'app-address-to-coordinate',
    template: `<app-feature-tab></app-feature-tab>`,
    providers: getFeatureProviders(AddressToCoordinateService),
    standalone: false
})
export class AddressToCoordinateComponent {}
