import { InjectionToken, Type } from '@angular/core';
import { Provider } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CoordinatePipe } from '../../components/coordinate.pipe';
import { AddressService, ApiService, ApiDetailService, CoordinateService, DownloadService } from '..';
import { ColumnService } from '../column.service';
import { ReverseApiService } from '../reverse-api.service';
import { MapInteractionService } from '../map-interaction.service';
import { FEATURE_SERVICE_TOKEN, FeatureService, FeatureServiceBase } from './feature.service';

export function getFeatureProviders(feature: Type<FeatureService>): Provider[] {
  return [
    {
      provide: FEATURE_SERVICE_TOKEN,
      useClass: feature,
    },
    AddressService,
    ColumnService,
    ApiService,
    ApiDetailService,
    CoordinateService,
    DownloadService,
    DecimalPipe,
    CoordinatePipe,
    ReverseApiService,
    MapInteractionService
  ];
}
