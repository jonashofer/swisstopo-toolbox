import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AddressService, CoordinateService } from './services';
import { AddressCoordinateTableEntry } from './components/models/AddressCoordinateTableEntry';

@Component({
  selector: 'app-address-to-coordinate',
  templateUrl: './address-to-coordinate.component.html',
  styleUrls: ['./address-to-coordinate.component.scss']
})
export class AddressToCoordinateComponent implements OnInit {
  editedAddress: AddressCoordinateTableEntry | null = null;
  selectedMode = 0;

  constructor(public addressService: AddressService, public coordinateService: CoordinateService) {}

  ngOnInit(): void {
    combineLatest([this.coordinateService.currentSystem$, this.addressService.validAddresses$])
      .pipe(switchMap(([s, a]) => this.addressService.convertAddresses$(a, s)))
      .subscribe();
  }
}
