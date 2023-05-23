import { Component } from '@angular/core';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { AddressService, CoordinateService } from '../shared/services';
import { AddressToCoordinateService } from '../shared/services/features/address-to-coordinate.feature.service';
import { getFeatureProviders } from '../shared/services/features/feature.provider';

@Component({
  selector: 'app-address-to-coordinate',
  templateUrl: './address-to-coordinate.component.html',
  providers: getFeatureProviders(AddressToCoordinateService)
})
export class AddressToCoordinateComponent {
  addressToEdit: AddressCoordinateTableEntry | null = null;

  constructor(
    public addressService: AddressService,
  ) {}

  edit(address: AddressCoordinateTableEntry) {
    this.addressToEdit = {...address};
  }
}
