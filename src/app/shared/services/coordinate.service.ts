import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CooridnateSystem } from '../models/CoordinateSystem';
import { Coordinate } from '../models/Coordinate';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CoordinateService {
  private readonly system$: BehaviorSubject<CooridnateSystem> = new BehaviorSubject<CooridnateSystem>(
    CooridnateSystem.WGS_84
  );

  public readonly currentSystem$: Observable<CooridnateSystem> = this.system$.asObservable();
  get currentSystem() {
    return this.system$.value;
  }

  constructor(private apiService: ApiService) {}

  public changeCurrentSystem(newSystem: CooridnateSystem): void {
    if (this.system$.value !== newSystem) {
      this.system$.next(newSystem);
    }
  }

  public tryParse(input: string): Coordinate | null {
    // Remove superficial characters
    const cleanedInput = input.replace(/[°'"NE]/g, '').replace(/[,;]/, '.');

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
      return { lon: a, lat: b, system: CooridnateSystem.LV_95 };
    }

    if (isLV95(b, a)) {
      return { lon: b, lat: a, system: CooridnateSystem.LV_95 };
    }

    if (isWGS84(a, b)) {
      return { lat: a, lon: b, system: CooridnateSystem.WGS_84 };
    }

    if (isWGS84(b, a)) {
      return { lat: b, lon: a, system: CooridnateSystem.WGS_84 };
    }

    if (isLV03(a, b)) {
      return { lon: a, lat: b, system: CooridnateSystem.LV_03 };
    }

    if (isLV03(b, a)) {
      return { lon: b, lat: a, system: CooridnateSystem.LV_03 };
    }

    return null;
  }
}
