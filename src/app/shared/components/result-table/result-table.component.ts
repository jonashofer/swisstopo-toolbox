import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { map } from 'rxjs';
import { AddressService } from '../../services';
import { ColumnService } from '../../services/column.service';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { CoordinateSystem } from '../../models/CoordinateSystem';

//all columns that should not be rendered in a generic way, need to have a custom
//matColumnDef in the template and need to be registered here
const customLayoutColumns: string[] = [];

// export function mapEach<T, R>(mapper: (value: T) => R) {
//   return (source: Observable<T[]>): Observable<R[]> => {
//     return source.pipe(
//       map(array => array.map(mapper))
//     );
//   };
// }

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent {
  @Input()
  currentSystem!: CoordinateSystem;

  @Output()
  editHandler = new EventEmitter<AddressCoordinateTableEntry>();

  get latLonHeadersEnabled(): boolean {
    return this.currentSystem == CoordinateSystem.WGS_84;
  }

  displayedColumns$ = this.columnService.columns$.pipe(
    map(userConfig => {
      const matColumns = userConfig.map(c => c.toString());
      matColumns.unshift('trash', 'address', 'edit'); //those got custom columns
      return matColumns;
    })
  );

  standardLayoutColumns$ = this.columnService.columns$.pipe(
    map(c => {
      return c.filter(e => !customLayoutColumns.includes(e));
    })
  );

  constructor(public addressService: AddressService, private columnService: ColumnService, public dialog: MatDialog) {}
}
