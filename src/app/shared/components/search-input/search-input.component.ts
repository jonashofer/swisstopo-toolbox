import { Component, Input } from '@angular/core';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { InputSearchMode } from '../../models/InputSearchMode';
import { AddressService, CoordinateService } from '../../services';
import { combineLatest, switchMap } from 'rxjs';
import { ColumnService } from '../../services/column.service';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent {
  selectedInputType = 0; // 0 = text, 1 = file

  @Input()
  addressToEdit: AddressCoordinateTableEntry | null = null;

  @Input()
  searchMode = InputSearchMode.All;
  constructor(
    public addressService: AddressService,
    public coordinateService: CoordinateService,
    public columnService: ColumnService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.coordinateService.currentSystem$,
      this.addressService.validAddresses$,
      this.columnService.columns$
    ])
      .pipe(switchMap(([s, a, c]) => this.addressService.enrichAddresses$(a, s, c)))
      .subscribe();
  }
}
