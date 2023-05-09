import { Inject, Injectable, InjectionToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ObNotificationService } from '@oblique/oblique';
import { BehaviorSubject, EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import { flatMap, map, mergeMap, tap } from 'rxjs/operators';
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
    @Inject(FEATURE_TAB_CONFIG) private featureIdentifier: FeatureTabConfig
  ) {
    console.log('AddressService constructed with:', featureIdentifier.name);
    this.addresses$
      .pipe(
        map(addresses => {
          StorageService.save(this.featureIdentifier.name, addresses);
        })
      )
      .subscribe();
  }

  public addOrUpdateAddress(addressResult: AddressSelectionResult) {
    if (addressResult.updatedId) {
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
    newCoordinateSystem: CoordinateSystem,
    columns: ColumnDefinitions[]
  ) => from(addresses).pipe(mergeMap(address => forkJoin(this.enrichAddress$(address, newCoordinateSystem, columns))));

  private readonly enrichAddress$ = (
    address: AddressCoordinateTableEntry,
    newCoordinateSystem: CoordinateSystem,
    columns: ColumnDefinitions[]
  ) => {
    const queries: Observable<any>[] = [];

    // GWR data
    if ((address.featureId && columns.includes(ColumnDefinitions.EGID)) || columns.includes(ColumnDefinitions.EGRID)) {
      const gwrQuery = this.apiDetail.getBuildingInfo(address.featureId!).pipe(
        map(r => {
          address.egid = r.feature.attributes.egid;
          address.egrid = r.feature.attributes.egrid;
          return address;
        })
      );
      queries.push(gwrQuery);
    }

    // LV95 data plus dependent Height data
    if (
      columns.includes(ColumnDefinitions.HEIGHT) ||
      columns.includes(ColumnDefinitions.LV_95_east) ||
      columns.includes(ColumnDefinitions.LV_95_north)
    ) {
      const lv95Query = this.api
        .convert({ lat: address.wgs84_lat!, lon: address.wgs84_lon!, system: CoordinateSystem.WGS_84 }, CoordinateSystem.LV_95)
        .pipe(
          map(r => {
            address.lv95_east = r.lon;
            address.lv95_north = r.lat;
            return address;
          })
        );

      if (columns.includes(ColumnDefinitions.HEIGHT)) {
        const heightQuery = lv95Query.pipe(
          mergeMap(r =>
            this.apiDetail.getHeight(r.lv95_east!, r.lv95_north!).pipe(
              map(r => {
                address.height = r;
                return r;
              })
            )
          )
        );

        queries.push(heightQuery);
      } else {
        queries.push(lv95Query);
      }
    }

    if (columns.includes(ColumnDefinitions.LV_03_east) || columns.includes(ColumnDefinitions.LV_03_north)) {
      const lv03Query = this.api
        .convert({ lat: address.wgs84_lat!, lon: address.wgs84_lon!, system: CoordinateSystem.WGS_84 }, CoordinateSystem.LV_03)
        .pipe(
          map(r => {
            address.lv03_east = r.lon;
            address.lv03_north = r.lat;
            return r;
          })
        );
      queries.push(lv03Query);
    }

    // console.log(queries)
    return queries;
  };
}
