import { Component, Input } from '@angular/core';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent {
  selectedInputType = 0; // 0 = text, 1 = file

  @Input()
  addressToEdit: AddressCoordinateTableEntry | null = null;

  constructor() {}
}
