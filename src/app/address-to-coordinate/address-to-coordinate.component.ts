import { ChangeDetectorRef, Component } from '@angular/core';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { AddressService, CoordinateService } from '../shared/services';
import { ColumnService } from '../shared/services/column.service';
import { getFeatureTabComponentProviders } from '../feature-tab.config';
import { InputSearchMode } from '../shared/models/InputSearchMode';

@Component({
  selector: 'app-address-to-coordinate',
  templateUrl: './address-to-coordinate.component.html',
  styleUrls: ['./address-to-coordinate.component.scss'],
  providers: getFeatureTabComponentProviders("address-to-coordinate")
})
export class AddressToCoordinateComponent {
  addressToEdit: AddressCoordinateTableEntry | null = null;
  selectedMode = 0;

  addressSearchMode = InputSearchMode.Address;

  constructor(private cd: ChangeDetectorRef, public addressService: AddressService, public coordinateService: CoordinateService, public columnService: ColumnService) {
    
    console.log('AddressToCoordinateComponent constructed');
  }
}
