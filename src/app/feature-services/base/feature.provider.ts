import { Type } from '@angular/core';
import { Provider } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FEATURE_SERVICE_TOKEN, FeatureService } from './feature-base.service';
import { CoordinatePipe } from 'src/app/shared/components/coordinate.pipe';
import { AddressService, ApiDetailService, ApiService, ColumnService, CoordinateService, DownloadService, MapInteractionService } from '../..';

export function getFeatureProviders(featureService: Type<FeatureService>): Provider[] {
  return [
    {
      provide: FEATURE_SERVICE_TOKEN,
      useClass: featureService,
    },
    AddressService,
    ColumnService,
    ApiService,
    ApiDetailService,
    CoordinateService,
    DownloadService,
    DecimalPipe,
    CoordinatePipe,
    MapInteractionService
  ];
}
