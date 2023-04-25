import { Component } from '@angular/core';
import { AddressCoordinateTableEntry } from '../shared/models/AddressCoordinateTableEntry';
import { ObIAutocompleteInputOption } from '@oblique/oblique';
import { Observable, concatMap, debounceTime, filter, flatMap, map, mergeMap, switchMap, tap } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ReverseApiService } from '../shared/services/reverse-api.service';
import { Coordinate } from '../shared/models/Coordinate';
import { ApiService, CoordinateService } from '../shared/services';
import { CooridnateSystem } from '../shared/models/CoordinateSystem';

@Component({
  selector: 'app-coordinate-to-address',
  templateUrl: './coordinate-to-address.component.html',
  styleUrls: ['./coordinate-to-address.component.scss']
})
export class CoordinateToAddressComponent {
  selectedMode = 0;
  editedAddress: AddressCoordinateTableEntry | null = null;

  input = new FormControl('');

  results$: Observable<ObIAutocompleteInputOption[]> = this.input.valueChanges.pipe(
    filter(_ => this.input.valid),
    filter((v): v is string => !!v),
    map(v => this.coordinateService.tryParse(v)),
    filter((coords): coords is Coordinate => coords !== null),
    debounceTime(300),
    switchMap(value =>
      this.apiService.convert(value, CooridnateSystem.LV_95).pipe(
        concatMap(value =>
          this.reverseApi.searchNearestAddresses({ lat: value.lat, lon: value.lon }).pipe(
            tap(x => console.log('33', x)),
            // tap(_ => this.trigger?.openPanel()),
            map(r => {
              const items = r.map(x => ({ label: x.name, disabled: false }));
              return items;
            })
          )
        )
      )
    )
  );

  constructor(
    private reverseApi: ReverseApiService,
    private coordinateService: CoordinateService,
    private apiService: ApiService
  ) {
    this.results$.subscribe(x => console.log(x));
  }
}
