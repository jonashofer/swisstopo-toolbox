import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { AddressCoordinateTableEntry, ColumnDefinitions, Coordinate, CoordinateSystem } from '../shared/models';
import { ColumnConfigItem, userCol, sysCol, inactiveUserCol } from '../shared/models/ColumnConfiguration';
import { CoordinateService } from '../shared/services';
import { FeatureServiceBase, LabelType, SearchResultItemTyped } from '../shared/services/feature.service';
import { CoordinateSystemNames, CoordinateSystemSr } from '../shared/models/CoordinateSystem';
import { HttpClient } from '@angular/common/http';
import { apiConvert } from '../shared/services/enrich-api-calls';

@Injectable()
export class CoordinateToCoordinateService extends FeatureServiceBase<Coordinate> {
  disableInactivationOfOldSystemWhenSwitching = true;

  constructor(private readonly httpClient: HttpClient) {
    super('coordinate-to-coordinate', LabelType.COORDINATE);
  }

  validateSearchInput(input: string): string | null {
    return CoordinateService.tryParse(input) === null ? 'notifications.inputNotCoordinate' : null;
  }

  search(validInput: string): Observable<SearchResultItemTyped<Coordinate>[]> {
    const coords = CoordinateService.tryParse(validInput)!;
    let text = '';
    switch (coords.system) {
      case CoordinateSystem.LV_03:
      case CoordinateSystem.LV_95:
        text = `${coords.lon}, ${coords.lat}`;
        break;
      case CoordinateSystem.WGS_84:
        text = `${coords.lat}, ${coords.lon}`;
    }

    // query gemeinde to have some indication of location
    const url = `https://api.geo.admin.ch/rest/services/api/MapServer/identify?geometryType=esriGeometryPoint&geometry=${
      coords.lon
    },${coords.lat}&sr=${
      CoordinateSystemSr[coords.system]
    }&imageDisplay=0,0,0&mapExtent=0,0,0,0&tolerance=0&layers=all:ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill&returnGeometry=false`;
    return this.httpClient.get<{ results: Result[] }>(url).pipe(
      map(r => [
        {
          text: `${text} (${r?.results[0]?.attributes?.label}) <i>- ${CoordinateSystemNames[coords.system]}</i>`,
          originalInput: validInput,
          data: coords
        }
      ]),
      catchError(() => // fallback without server - notification from  mnbm comes nonetheless..
        of([
          {
            text: `${text} <i>- ${CoordinateSystemNames[coords.system]}</i>`,
            originalInput: validInput,
            data: coords
          }
        ])
      )
    );
  }

  transformInput(input: SearchResultItemTyped<Coordinate>): AddressCoordinateTableEntry {
    return {
      originalInput: input.originalInput,
      id: `${input.data.lat}_${input.data.lon}`,
      isValid: true,
      [input.data.system]: input.data,
    }
  }

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string {
    return entry.originalInput || '';
  }

  getDefaultColumns(): ColumnConfigItem[] {
    return [
      userCol(ColumnDefinitions.WGS_84),
      userCol(ColumnDefinitions.LV_95),
      inactiveUserCol(ColumnDefinitions.LV_03),
      sysCol(ColumnDefinitions.EDIT),

      inactiveUserCol(ColumnDefinitions.HEIGHT)

      // DO NOT setup these columns, otherwise the enrichement will fail
      // inactiveUserCol(ColumnDefinitions.ADDRESS),
      // inactiveUserCol(ColumnDefinitions.EGID),
      // inactiveUserCol(ColumnDefinitions.EGRID)
    ];
  }

  getExampleFileContent(): string {
    return `46.7591	7.6292\r\n636'810.21, 136'435.22\r\n2'642'580.0, 1'136'725.0`;
  }
}

interface Result {
  layerBodId: string;
  layerName: string;
  featureId: number;
  id: number;
  attributes: Attributes;
}

interface Attributes {
  gemname: string;
  gemflaeche: number;
  perimeter: number;
  kanton: string;
  objektart: number;
  label: string;
}
