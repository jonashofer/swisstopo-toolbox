import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AddressService } from '../../services';
import { AddressCoordinateTableEntry } from '../models/AddressCoordinateTableEntry';
import { CooridnateSystem } from '../models/CoordinateSystem';

@Component({
  selector: 'app-address-coordinate-table',
  templateUrl: './address-coordinate-table.component.html',
  styleUrls: ['./address-coordinate-table.component.scss']
})
export class AddressCoordinateTableComponent {
  @Input()
  currentSystem!: CooridnateSystem;

  @Output()
  editHandler = new EventEmitter<AddressCoordinateTableEntry>();

  get latLonHeadersEnabled(): boolean {
    return this.currentSystem == CooridnateSystem.WGS_84;
  }

  get displayedColumns(): string[] {
    if (this.currentSystem != CooridnateSystem.WGS_84) {
      return ['trash', 'address', 'edit', 'lon', 'lat', 'egid', 'egrid'];
    }
    return ['trash', 'address', 'edit', 'lat', 'lon', 'egid', 'egrid'];
  }

  constructor(public addressService: AddressService, public dialog: MatDialog) {}
}
