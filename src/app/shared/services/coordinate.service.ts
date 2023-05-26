import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CoordinateSystem } from '../models/CoordinateSystem';
import { Coordinate } from '../models/Coordinate';
import { CoordinatePipe } from '../components/coordinate.pipe';
import { StorageService } from './storage.service';

@Injectable()
export class CoordinateService {
  private readonly system$: BehaviorSubject<CoordinateSystem> = new BehaviorSubject<CoordinateSystem>(
    CoordinateSystem.WGS_84
  );

  public readonly currentSystem$: Observable<CoordinateSystem> = this.system$.asObservable();
  get currentSystem() {
    return this.system$.value;
  }

  constructor(private readonly coordinatePipe: CoordinatePipe) {
    this.system$.next(StorageService.get('coordinateSystem') || CoordinateSystem.WGS_84);
    this.system$.subscribe(system => {StorageService.save('coordinateSystem', system); })
  }

  //TODO refactor to remove
  // public stringify(coord: Coordinate | null, seperator: string, usePipe: boolean): string {
	// 	if(coord == null) {
	// 		return seperator
	// 	}

  //   const lat = usePipe ? this.coordinatePipe.transform(coord.lat, this.currentSystem) : coord.lat.toString();
  //   const lon = usePipe ? this.coordinatePipe.transform(coord.lon, this.currentSystem) : coord.lon.toString();

  //   // well-kown lat/lon order
  //   if (coord.system == CoordinateSystem.WGS_84) {
  //     return `${lat}${seperator}${lon}`;
  //   }
  //   return `${lon}${seperator}${lat}`;
  // }

  public changeCurrentSystem(newSystem: CoordinateSystem): void {
    if (this.system$.value !== newSystem) {
      this.system$.next(newSystem);
    }
  }

  public tryParse(input: string): Coordinate | null {
    // Remove superficial characters
    const cleanedInput = input.trim().replace(/[°'’"NE]/g, '').replace(/[,;]/, '.');

    // Split the string into two parts
    const parts = cleanedInput.split(/[\s\t]+/);

    if (parts.length !== 2) {
      return null;
    }

    // Parse numbers
    const [a, b] = parts.map(parseFloat);

    // Check if the parsed numbers are within Swiss boundaries
    const isWGS84 = (lat: number, lon: number) => lat >= 45.8 && lat <= 47.8 && lon >= 5.9 && lon <= 10.5;
    const isLV03 = (lon: number, lat: number) => lon >= 450000 && lon <= 950000 && lat >= 0 && lat <= 350000;
    const isLV95 = (lon: number, lat: number) => lon >= 2000000 && lon <= 3000000 && lat >= 1000000 && lat <= 1400000;

    if (isLV95(a, b)) {
      return { lon: a, lat: b, system: CoordinateSystem.LV_95 };
    }

    if (isLV95(b, a)) {
      return { lon: b, lat: a, system: CoordinateSystem.LV_95 };
    }

    if (isWGS84(a, b)) {
      return { lat: a, lon: b, system: CoordinateSystem.WGS_84 };
    }

    if (isWGS84(b, a)) {
      return { lat: b, lon: a, system: CoordinateSystem.WGS_84 };
    }

    if (isLV03(a, b)) {
      return { lon: a, lat: b, system: CoordinateSystem.LV_03 };
    }

    if (isLV03(b, a)) {
      return { lon: b, lat: a, system: CoordinateSystem.LV_03 };
    }

    return null;
  }
}
