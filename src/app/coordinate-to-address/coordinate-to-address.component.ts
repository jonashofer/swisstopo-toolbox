import { Component } from '@angular/core';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { AddressService, CoordinateService } from '../shared/services';
import { getFeatureProviders } from '../shared/services/features/feature.provider';
import { CoordinateToAddressService } from '../shared/services/features/coordinate-to-address.feature.service';
import { ReverseApiService } from '../shared/services/reverse-api.service';

@Component({
  selector: 'app-coordinate-to-address',
  templateUrl: './coordinate-to-address.component.html',
  providers: [getFeatureProviders(CoordinateToAddressService), ReverseApiService]
})
export class CoordinateToAddressComponent {
  editedAddress: AddressCoordinateTableEntry | null = null;

  constructor(
    public addressService: AddressService,
  ) {}

  edit(address: AddressCoordinateTableEntry) {
    this.editedAddress = {...address};
  }
}
