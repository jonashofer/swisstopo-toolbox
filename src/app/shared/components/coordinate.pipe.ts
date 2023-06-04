import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { CoordinateSystem } from '../models';

@Pipe({
  name: 'coordinate'
})
export class CoordinatePipe implements PipeTransform {
  constructor(private readonly decimalPipe: DecimalPipe) {}

  transform(value: number | undefined, coordinateSystem: CoordinateSystem): string | null {
    if (!value || !coordinateSystem) {
      return '';
    }

    switch (coordinateSystem) {
      case CoordinateSystem.WGS_84:
        return this.decimalPipe.transform(value, '1.4-4');
      case CoordinateSystem.LV_95:
      case CoordinateSystem.LV_03:
        return this.decimalPipe.transform(value, '1.2-2');
      default:
        return '';
    }
  }
}
