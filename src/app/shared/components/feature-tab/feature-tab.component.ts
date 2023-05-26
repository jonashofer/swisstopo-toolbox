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
import { combineLatest, switchMap } from 'rxjs';

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
    ReverseApiService
  ]
})
export class FeatureTabComponent {
  addressToEdit: AddressCoordinateTableEntry | null = null;

  constructor(
    public addressService: AddressService,
    private readonly coordinateService: CoordinateService,
    private readonly columnService: ColumnService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.addressService.validAddresses$,
      this.columnService.activeColumnsKeys$
    ])
      .pipe(switchMap(([adresses, columns]) => this.addressService.enrichAddresses$(adresses, columns)))
      .subscribe();
  }

  edit(address: AddressCoordinateTableEntry) {
    this.addressToEdit = { ...address };
  }
}
