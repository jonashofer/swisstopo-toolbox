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
  providers: getFeatureTabComponentProviders("coordinate-to-address")
})
export class CoordinateToAddressComponent {
  selectedMode = 0;
  editedAddress: AddressCoordinateTableEntry | null = null;

  coordinateSearchMode = InputSearchMode.Coordinate;

  input = new FormControl('');

  debouncedInput$ = this.input.valueChanges.pipe(
    filter(_ => this.input.valid),
    filter((v): v is string => !!v),
    map(v => this.coordinateService.tryParse(v)),
    filter((coords): coords is Coordinate => coords !== null),
    debounceTime(300)
  );

  results$: Observable<ObIAutocompleteInputOption[]> = this.debouncedInput$.pipe(
    switchMap(value => this.apiService.convert(value, CoordinateSystem.LV_95)),
    switchMap(value => this.reverseApi.searchNearestAddresses(value)),
    map(r => {
      const items = r.map(x => ({ label: x.name, disabled: false }));
      return items;
    })
  );

  constructor(
    public addressService: AddressService,
    private reverseApi: ReverseApiService,
    public coordinateService: CoordinateService,
    private apiService: ApiService
  ) {}
}
