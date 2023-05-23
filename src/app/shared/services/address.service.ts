import { Inject, Injectable, InjectionToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ObNotificationService } from '@oblique/oblique';
import { BehaviorSubject, EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import { catchError, filter, flatMap, map, mergeMap, tap } from 'rxjs/operators';
import { ApiDetailService, ApiService } from '.';
import { AddressCoordinateTableEntry, AddressSelectionResult } from '../models/AddressCoordinateTableEntry';
import { ColumnDefinitions } from '../models/ColumnConfiguration';
import { CoordinateSystem } from '../models/CoordinateSystem';
import { StorageService } from './storage.service';
import { FEATURE_TAB_CONFIG, FeatureTabConfig } from 'src/app/feature-tab.config';

@Injectable()
export class AddressService {
  private readonly _addresses = new BehaviorSubject<AddressCoordinateTableEntry[]>(
    StorageService.get<AddressCoordinateTableEntry[]>(this.featureIdentifier.name) || []
  );
  public addresses$ = this._addresses.asObservable();
  public validAddresses$ = this.addresses$.pipe(map(a => a.filter(a => a.isValid)));
  public hasAddresses$ = this.addresses$.pipe(map(a => a.length > 0));

  public featureName = this.featureIdentifier.name;

  get hasAddresses() {
    return this.addresses.length > 0;
  }

  get addresses() {
    return this._addresses.value;
  }
  get validAddresses() {
    return this.addresses.filter(a => a.isValid);
  }

  constructor(
    private readonly api: ApiService,
    private readonly apiDetail: ApiDetailService,
    private readonly notificationService: ObNotificationService,
    private readonly translate: TranslateService,
    @Inject(FEATURE_TAB_CONFIG) public featureIdentifier: FeatureTabConfig
  ) {
    this.addresses$
      .pipe(
        map(addresses => {
          StorageService.save(this.featureIdentifier.name, addresses);
        })
      )
      .subscribe();
  }

  public addOrUpdateAddress(addressResult: AddressSelectionResult) {
    if (addressResult.updatedId && this._addresses.value.some(a => a.id === addressResult.updatedId)) {
      const addresses = this._addresses.value.slice();
      const indexToReplace = addresses.findIndex(e => e.id == addressResult.updatedId);
      addresses[indexToReplace] = addressResult.result;
      this._addresses.next(addresses);
      this.notificationService.success(this.translate.instant('notifications.entryEdited'));
    } else if (!this._addresses.value.some(a => a.id === addressResult.result.id)) {
      this._addresses.next(this._addresses.value.concat(addressResult.result));
    } else {
      this.notificationService.info(
        this.translate.instant('notifications.entryAlreadyExists', {
          address: addressResult.result.address
        })
      );
    }
  }

  public removeAddress(address: AddressCoordinateTableEntry) {
    const newAddresses = this._addresses.value.slice();
    const index = newAddresses.indexOf(address);
    newAddresses.splice(index, 1);
    this._addresses.next(newAddresses);
  }

  public deleteAllAddresses() {
    this._addresses.next([]);
  }

  public enrichAddresses$ = (
    addresses: AddressCoordinateTableEntry[],
    coordinateSystem: CoordinateSystem,
    columns: ColumnDefinitions[]
  ) =>
    from(addresses).pipe(
      filter(address => address.isValid),
      mergeMap(address => forkJoin(this.enrichAddress$(address, coordinateSystem, columns))),
      catchError(err => {
        return of([]);
      })
    );

  //TODO generalize-refactoring
  //TODO optional: rework together with c2a to fetch wgs84 here and not in mapReverseApiResultToAddress(?)
  /** requires the address entry to have wgs84 coordinates */
  private readonly enrichAddress$ = (
    address: AddressCoordinateTableEntry,
    newCoordinateSystem: CoordinateSystem,
    columns: ColumnDefinitions[]
  ) => {
    const queries: Observable<any>[] = [];

    // GWR data
    if ((address.id && columns.includes(ColumnDefinitions.EGID)) || columns.includes(ColumnDefinitions.EGRID)) {
      const gwrQuery = this.apiDetail.getBuildingInfo(address.id).pipe(
        map(r => {
          address.egid = r.feature.attributes.egid;
          address.egrid = r.feature.attributes.egrid;
          return address;
        })
      );
      queries.push(gwrQuery);
    }

    // LV95 data plus dependent Height data
    if (columns.includes(ColumnDefinitions.HEIGHT) || columns.includes(ColumnDefinitions.LV_95)) {
      const lv95Query = this.api.convert(address.wgs84!, CoordinateSystem.LV_95).pipe(
        map(r => {
          address.lv95 = r;
          return address;
        })
      );

      if (columns.includes(ColumnDefinitions.HEIGHT)) {
        const lv95AndHeightQuery = lv95Query.pipe(
          mergeMap(r =>
            this.apiDetail.getHeight(r.lv95!.lon, r.lv95!.lat).pipe(
              map(r => {
                address.height = r;
                return r;
              })
            )
          )
        );

        queries.push(lv95AndHeightQuery);
      } else {
        queries.push(lv95Query);
      }
    }

    if (columns.includes(ColumnDefinitions.LV_03)) {
      const lv03Query = this.api.convert(address.wgs84!, CoordinateSystem.LV_03).pipe(
        map(r => {
          address.lv03 = r;
          return r;
        })
      );
      queries.push(lv03Query);
    }

    return queries;
  };
}
