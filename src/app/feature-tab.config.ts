import { InjectionToken } from '@angular/core';
import { Provider } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CoordinatePipe } from './shared/components/coordinate.pipe';
import { AddressService, ApiService, ApiDetailService, CoordinateService, DownloadService } from './shared/services';
import { ColumnService } from './shared/services/column.service';
import { ReverseApiService } from './shared/services/reverse-api.service';
import { MapInteractionService } from './shared/services/map-interaction.service';

export interface FeatureTabConfig {
  shortName: string;
  name: string;
}

export const FEATURE_TAB_CONFIG = new InjectionToken<FeatureTabConfig>('feature-config');

export function getFeatureTabComponentProviders(featureName: string, shortName: string): Provider[] {
  return [
    AddressService,
    {
      provide: FEATURE_TAB_CONFIG,
      useValue: {
        shortName: shortName,
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
    ReverseApiService,
    MapInteractionService
  ];
}
