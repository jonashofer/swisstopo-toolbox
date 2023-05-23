import { Component } from "@angular/core";
import { AddressCoordinateTableEntry } from "../shared/models/AddressCoordinateTableEntry";
import { AddressService } from "../shared/services";
import { getFeatureProviders, AddressToCoordinateService } from "../shared/services/features";

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
