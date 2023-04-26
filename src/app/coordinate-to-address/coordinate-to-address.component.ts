import { Component } from '@angular/core';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { ObIAutocompleteInputOption } from '@oblique/oblique';
import { debounceTime, filter, map, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ReverseApiService } from '../shared/services/reverse-api.service';
import { Coordinate } from '../shared/models/Coordinate';
import { ApiService, CoordinateService } from '../shared/services';
import { CoordinateSystem } from '../shared/models/CoordinateSystem';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-coordinate-to-address',
  templateUrl: './coordinate-to-address.component.html',
  styleUrls: ['./coordinate-to-address.component.scss']
})
export class CoordinateToAddressComponent {
  selectedMode = 0;
  editedAddress: AddressCoordinateTableEntry | null = null;

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
    private reverseApi: ReverseApiService,
    private coordinateService: CoordinateService,
    private apiService: ApiService
  ) {
  }
}
