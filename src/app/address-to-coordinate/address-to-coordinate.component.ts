import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { AddressService, CoordinateService } from '../shared/services';
import { ColumnService } from '../shared/services/column.service';

@Component({
  selector: 'app-address-to-coordinate',
  templateUrl: './address-to-coordinate.component.html',
  styleUrls: ['./address-to-coordinate.component.scss']
})
export class AddressToCoordinateComponent implements OnInit {
  editedAddress: AddressCoordinateTableEntry | null = null;
  selectedMode = 0;

  constructor(public addressService: AddressService, public coordinateService: CoordinateService, public columnService: ColumnService) {}

  ngOnInit(): void {
    combineLatest([this.coordinateService.currentSystem$, this.addressService.validAddresses$, this.columnService.columns$])
      .pipe(switchMap(([s, a, c]) => this.addressService.enrichAddresses$(a, s, c)))
      .subscribe();
  }
}
