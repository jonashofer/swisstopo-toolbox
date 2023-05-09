import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { AddressService, CoordinateService } from '../shared/services';
import { ColumnService } from '../shared/services/column.service';
import { InputMode } from '../shared/models/InputMode';
import { getFeatureTabComponentProviders } from '../feature-tab.config';

@Component({
  selector: 'app-address-to-coordinate',
  templateUrl: './address-to-coordinate.component.html',
  styleUrls: ['./address-to-coordinate.component.scss'],
  providers: getFeatureTabComponentProviders("address-to-coordinate")
})
export class AddressToCoordinateComponent implements OnInit {
  editedAddress: AddressCoordinateTableEntry | null = null;
  selectedMode = 0;

  inputMode = InputMode.Address;

  constructor(public addressService: AddressService, public coordinateService: CoordinateService, public columnService: ColumnService) {}

  ngOnInit(): void {
    combineLatest([this.coordinateService.currentSystem$, this.addressService.validAddresses$, this.columnService.columns$])
      .pipe(switchMap(([s, a, c]) => this.addressService.enrichAddresses$(a, s, c)))
      .subscribe();
  }
}
