import { Component } from '@angular/core';
import { AddressCoordinateTableEntry } from '../../models';
import {
  AddressService,
  ApiDetailService,
  ApiService,
  ColumnService,
  CoordinateService,
  DownloadService,
  MapInteractionService,
  ReverseApiService
} from '../../services';
import { DecimalPipe } from '@angular/common';
import { CoordinatePipe } from '../coordinate.pipe';

@Component({
  selector: 'app-feature-tab',
  templateUrl: './feature-tab.component.html',
  providers: [
    AddressService,
    ColumnService,
    ApiService,
    ApiDetailService,
    CoordinateService,
    DownloadService,
    DecimalPipe,
    CoordinatePipe,
    MapInteractionService,
    ReverseApiService,
  ]
})
export class FeatureTabComponent {
  addressToEdit: AddressCoordinateTableEntry | null = null;

  constructor(public addressService: AddressService) {}

  edit(address: AddressCoordinateTableEntry) {
    this.addressToEdit = { ...address };
  }
}
