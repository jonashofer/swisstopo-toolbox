import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { CooridnateSystem } from './models/CoordinateSystem';

@Pipe({
  name: 'coordinate'
})
export class CoordinatePipe implements PipeTransform {
  constructor(private readonly decimalPipe: DecimalPipe) {}

  transform(value: number | undefined, coordinateSystem: CooridnateSystem): string | null {
    if (!value || !coordinateSystem) {
      return '';
    }

    switch (coordinateSystem) {
      case CooridnateSystem.WGS_84:
        return this.decimalPipe.transform(value, '1.4-4');
      case CooridnateSystem.LV_95:
        return this.decimalPipe.transform(value, '1.1-1');
      case CooridnateSystem.LV_03:
        return this.decimalPipe.transform(value, '1.2-2');
      default:
        return '';
    }
  }
}
