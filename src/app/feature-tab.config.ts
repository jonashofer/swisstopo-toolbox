import { InjectionToken } from '@angular/core';
import { Provider } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CoordinatePipe } from './shared/components/coordinate.pipe';
import { AddressService, ApiService, ApiDetailService, CoordinateService, DownloadService } from './shared/services';
import { ColumnService } from './shared/services/column.service';
import { ReverseApiService } from './shared/services/reverse-api.service';

export interface FeatureTabConfig {
  name: string;
}

export const FEATURE_TAB_CONFIG = new InjectionToken<FeatureTabConfig>('feature-config');

export function getFeatureTabComponentProviders(featureName: string): Provider[] {
  return [
    AddressService,
    {
      provide: FEATURE_TAB_CONFIG,
      useValue: {
        name: featureName
      }
    },
    ColumnService,
    ApiService,
    ApiDetailService,
    CoordinateService,
    DownloadService,
    DecimalPipe,
    CoordinatePipe,
    ReverseApiService
  ];
}
