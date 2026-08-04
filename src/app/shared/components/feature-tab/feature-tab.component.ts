import { Component, inject } from '@angular/core';
import { AddressCoordinateTableEntry } from '../../models';
import {
  AddressService,
  ColumnService,
  CoordinateService,
  DownloadService,
  MapInteractionService
} from '../../services';
import { DecimalPipe } from '@angular/common';
import { CoordinatePipe } from '../coordinate.pipe';
import { SharedStandaloneModule } from '../../shared-standalone.module';
import { SearchInputComponent } from '../search-input/search-input.component';
import { ResultTableComponent } from '../result-table/result-table.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { ResultMapComponent } from '../result-map/result-map.component';

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
    MapInteractionService
  ],
  imports: [SharedStandaloneModule, SearchInputComponent, ResultTableComponent, ToolbarComponent, ResultMapComponent]
})
export class FeatureTabComponent {
  addressService = inject(AddressService);

  addressToEdit: AddressCoordinateTableEntry | null = null;

  edit(address: AddressCoordinateTableEntry) {
    this.addressToEdit = { ...address };
  }
}
