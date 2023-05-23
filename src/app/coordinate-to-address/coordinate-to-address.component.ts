import { Component } from '@angular/core';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { AddressService, CoordinateService } from '../shared/services';
import { getFeatureTabComponentProviders } from '../feature-tab.config';
import { InputSearchMode } from '../shared/models/InputSearchMode';

@Component({
  selector: 'app-coordinate-to-address',
  templateUrl: './coordinate-to-address.component.html',
  providers: getFeatureTabComponentProviders('coordinate-to-address', 'cta')
})
export class CoordinateToAddressComponent {
  selectedMode = 0;
  editedAddress: AddressCoordinateTableEntry | null = null;

  coordinateSearchMode = InputSearchMode.Coordinate;

  constructor(
    public addressService: AddressService,
  ) {}

  edit(address: AddressCoordinateTableEntry) {
    this.editedAddress = {...address};
  }
}
