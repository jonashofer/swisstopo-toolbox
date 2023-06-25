import { DecimalPipe } from "@angular/common";
import { Type, Provider } from "@angular/core";
import { FEATURE_SERVICE_TOKEN, FeatureService } from ".";
import { CoordinatePipe } from "../shared/components/coordinate.pipe";
import { AddressService, ColumnService, CoordinateService, DownloadService, MapInteractionService } from "../shared/services";

export function getFeatureProviders(featureService: Type<FeatureService>): Provider[] {
  return [
    {
      provide: FEATURE_SERVICE_TOKEN,
      useClass: featureService,
    },
    AddressService,
    ColumnService,
    CoordinateService,
    DownloadService,
    DecimalPipe,
    CoordinatePipe,
    MapInteractionService
  ];
}
