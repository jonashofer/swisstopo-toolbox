import { Component } from '@angular/core';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { AddressService, CoordinateService } from '../shared/services';

@Component({
  selector: 'app-coordinate-to-address',
  templateUrl: './coordinate-to-address.component.html',
  // providers: getFeatureTabComponentProviders('coordinate-to-address')
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
