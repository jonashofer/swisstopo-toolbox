import { Component } from '@angular/core';
import { AddressCoordinateTableEntry } from '../../models';
import {
  AddressService,
  ColumnService,
  CoordinateService,
  DownloadService,
  MapInteractionService,
} from '../../services';
import { DecimalPipe } from '@angular/common';
import { CoordinatePipe } from '../coordinate.pipe';
import { combineLatest, switchMap } from 'rxjs';

@Component({
  selector: 'app-feature-tab',
  templateUrl: './feature-tab.component.html',
  providers: [
    AddressService,
    ColumnService,
    CoordinateService,
    DownloadService,
    DecimalPipe,
    CoordinatePipe,
    MapInteractionService,
  ]
})
export class FeatureTabComponent {
  addressToEdit: AddressCoordinateTableEntry | null = null;

  constructor(
    public addressService: AddressService,
  ) {}


  edit(address: AddressCoordinateTableEntry) {
    this.addressToEdit = { ...address };
  }
}
