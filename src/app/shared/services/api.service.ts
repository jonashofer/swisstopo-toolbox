import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ObNotificationService } from '@oblique/oblique';
import { Observable, from, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { AddressCoordinateTableEntry } from '../models/AddressCoordinateTableEntry';
import { Coordinate } from '../models/Coordinate';
import { CoordinateSystem } from '../models/CoordinateSystem';

export interface Attrs {
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

export interface ApiSearchResult {
  id: number;
  weight: number;
  attrs: Attrs;
}

export interface RootObject {
  results: ApiSearchResult[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private bulkAddId = -1;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly notificationService: ObNotificationService,
    private readonly translate: TranslateService
  ) {}

  public searchLocationsList(input: string): Observable<{ input: string; results: ApiSearchResult[] }> {
    input = input.trim();
    if (!input) {
      return of({ input, results: [] });
    }

    // same validation as in search input for catching multiline or fileinputs
    const validation = this.validateSearchInput(input);
    if (!validation.valid) {
      this.notificationService.warning(this.translate.instant(validation.messageLabel!));
      return of({ input, results: [] });
    }

    const request = `https://api3.geo.admin.ch/rest/services/api/SearchServer?lang=de&searchText=${encodeURIComponent(
      input
    )}&lang=de&type=locations&origins=address`;
    return this.httpClient.get<RootObject>(request).pipe(
      map((data: RootObject) => {
        const resultWeightDesc = (a: ApiSearchResult, b: ApiSearchResult) => b.weight - a.weight;
        return { results: data.results.sort(resultWeightDesc), input };
      })
    );
  }

  public validateSearchInput(input: string): { valid: boolean; messageLabel: string | null } {
    const length = input.trim().length;
    const wordCount = input.split(' ').filter((w: string) => w.trim().length >= 1).length;
    if (length > 4000) {
      return { valid: false, messageLabel: 'notifications.inputTooLong' };
    }
    if (wordCount > 10) {
      return { valid: false, messageLabel: 'notifications.inputTooManyWords' };
    }
    return { valid: true, messageLabel: null };
  }

  public searchMultiple(inputs: string[]): Observable<AddressCoordinateTableEntry> {
    return from(inputs).pipe(
      mergeMap(address =>
        this.searchLocationsList(address).pipe(
          map(r => {
            if (r.results.length == 1) {
              return this.mapApiResultToAddress(r.results[0]);
            }
            const entry: AddressCoordinateTableEntry = {
              address: r.input,
              id: this.bulkAddId--,
              isValid: false,
              wgs84_lat: null,
              wgs84_lon: null
            };
            return entry;
          })
        )
      )
    );
  }

  public mapApiResultToAddress(result: ApiSearchResult): AddressCoordinateTableEntry {
    return {
      address: this.sanitize(result.attrs.label),
      id: result.id,
      featureId: result.attrs.featureId,
      wgs84_lat: result.attrs.lat,
      wgs84_lon: result.attrs.lon,
      isValid: true
    };
  }

  public convert(coordinate: Coordinate, targetSystem: CoordinateSystem): Observable<Coordinate> {
    if (coordinate.system == targetSystem || coordinate.system == null) {
      return of(coordinate);
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
