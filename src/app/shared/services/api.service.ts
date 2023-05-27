import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AddressCoordinateTableEntry } from '../models/AddressCoordinateTableEntry';
import { Coordinate } from '../models/Coordinate';
import { CoordinateSystem } from '../models/CoordinateSystem';

interface Attrs {
  origin: string;
  geom_quadindex: string;
  zoomlevel: any;
  featureId: string;
  lon: number;
  detail: string;
  rank: number;
  geom_st_box2d: string;
  lat: number;
  num: number;
  y: number;
  x: number;
  label: string;
}

export interface AddressToCoordinateApiData {
  id: number;
  weight: number;
  attrs: Attrs;
}

interface RootObject {
  results: AddressToCoordinateApiData[];
}

@Injectable()
export class ApiService {

  constructor(
    private readonly httpClient: HttpClient,
  ) {}

  public searchLocationsList(input: string): Observable<AddressToCoordinateApiData[]> {
    input = input.trim();
    if (!input) {
      return of([]);
    }

    const request = `https://api3.geo.admin.ch/rest/services/api/SearchServer?lang=de&searchText=${encodeURIComponent(
      input
    )}&lang=de&type=locations&origins=address`;
    return this.httpClient.get<RootObject>(request).pipe(
      map((data: RootObject) => {
        const resultWeightDesc = (a: AddressToCoordinateApiData, b: AddressToCoordinateApiData) => b.weight - a.weight;
        return data.results.sort(resultWeightDesc);
      })
    );
  }

  public validateSearchInput(input: string): string | null {
    const length = input.trim().length;
    const wordCount = input.split(' ').filter((w: string) => w.trim().length >= 1).length;
    if (length > 4000) {
      return 'notifications.inputTooLong';
    }
    if (wordCount > 10) {
      return 'notifications.inputTooManyWords';
    }
    return null;
  }

  public mapApiResultToAddress(result: AddressToCoordinateApiData): AddressCoordinateTableEntry {
    return {
      address: this.sanitize(result.attrs.label),
      id: result.attrs.featureId,
			wgs84: {
				system: CoordinateSystem.WGS_84,
				lat: result.attrs.lat,
				lon: result.attrs.lon,
			},
			lv95: null,
			lv03: null,
      isValid: true
    };
  }

  public convert(coordinate: Coordinate, targetSystem: CoordinateSystem): Observable<Coordinate> {
    if (coordinate.system == targetSystem || coordinate.system == null) {
      return of(coordinate)
    }

    const mode = this.buildReframeApiMode(coordinate.system, targetSystem);
    const request = `https://geodesy.geo.admin.ch/reframe/${mode}?northing=${encodeURIComponent(
      coordinate.lat
    )}&easting=${encodeURIComponent(coordinate.lon)}&format=json`;

    return this.httpClient.get<{ easting: string; northing: string }>(request).pipe(
      map(r => {
        return { lat: +r.northing, lon: +r.easting, system: targetSystem };
      })
    );
  }

  private sanitize(htmlInput: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlInput;
    return div.textContent || div.innerText || '';
  }

  private buildReframeApiMode(from: CoordinateSystem, to: CoordinateSystem): string {
    const dict = {
      [CoordinateSystem.WGS_84]: 'wgs84',
      [CoordinateSystem.LV_95]: 'lv95',
      [CoordinateSystem.LV_03]: 'lv03'
    };

    return `${dict[from]}to${dict[to]}`;
  }
}
