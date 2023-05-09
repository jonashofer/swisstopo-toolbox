import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { ObIAutocompleteInputOption } from '@oblique/oblique';
import { debounceTime, filter, map, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ReverseApiService } from '../shared/services/reverse-api.service';
import { Coordinate } from '../shared/models/Coordinate';
import { AddressService, ApiService, CoordinateService } from '../shared/services';
import { CoordinateSystem } from '../shared/models/CoordinateSystem';
import { Observable } from 'rxjs';
import { getFeatureTabComponentProviders } from '../feature-tab.config';
import { InputSearchMode } from '../shared/models/InputSearchMode';

@Component({
  selector: 'app-coordinate-to-address',
  templateUrl: './coordinate-to-address.component.html',
  styleUrls: ['./coordinate-to-address.component.scss'],
  providers: getFeatureTabComponentProviders('coordinate-to-address', 'cta')
})
export class CoordinateToAddressComponent {
  selectedMode = 0;
  editedAddress: AddressCoordinateTableEntry | null = null;

  coordinateSearchMode = InputSearchMode.Coordinate;

  constructor(
    public addressService: AddressService,
    public coordinateService: CoordinateService,
  ) {}
}
