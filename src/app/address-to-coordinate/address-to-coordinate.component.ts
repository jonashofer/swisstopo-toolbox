import { Component } from '@angular/core';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { AddressService, CoordinateService } from '../shared/services';
import { getFeatureTabComponentProviders } from '../feature-tab.config';
import { InputSearchMode } from '../shared/models/InputSearchMode';

@Component({
  selector: 'app-address-to-coordinate',
  templateUrl: './address-to-coordinate.component.html',
  providers: getFeatureTabComponentProviders('address-to-coordinate', 'atc')
})
export class AddressToCoordinateComponent {
  addressToEdit: AddressCoordinateTableEntry | null = null;
  selectedMode = 0;

  addressSearchMode = InputSearchMode.Address;

  constructor(
    public addressService: AddressService,
  ) {}

  edit(address: AddressCoordinateTableEntry) {
    this.addressToEdit = {...address};
  }
}
