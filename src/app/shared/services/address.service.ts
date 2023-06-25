import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ObNotificationService } from '@oblique/oblique';
import { BehaviorSubject, combineLatest, forkJoin, from, Observable, of } from 'rxjs';
import { catchError, concatMap, delay, filter, last, map, mergeMap, shareReplay, switchMap, tap, toArray } from 'rxjs/operators';
import { ColumnService, StorageService } from '.';
import { AddressCoordinateTableEntry, AddressSelectionResult } from '../models/AddressCoordinateTableEntry';
import { ColumnDefinitions } from '../models/ColumnConfiguration';
import { FEATURE_SERVICE_TOKEN, FeatureService } from './feature.service';
import { HttpClient } from '@angular/common/http';
import { getEnrichQueries } from './enrich-api-calls';

@Injectable()
export class AddressService {
  public featureName = this.featureService.name;;

  private readonly _bareAddresses = new BehaviorSubject<AddressCoordinateTableEntry[]>(
    StorageService.get<AddressCoordinateTableEntry[]>(this.featureService.name) || []
  );

  public addresses$ = combineLatest([this._bareAddresses, this.columnService.activeColumnsKeys$]).pipe(
    switchMap(([adresses, columns]) => this.enrichAddresses$(adresses, columns)),
    shareReplay(1)
  );

  public validAddresses$ = this.addresses$.pipe(map(a => a.filter(a => a.isValid)));
  public hasAddresses$ = this.addresses$.pipe(map(a => a.length > 0));

  constructor(
    private readonly notificationService: ObNotificationService,
    private readonly translate: TranslateService,
    @Inject(FEATURE_SERVICE_TOKEN) private featureService: FeatureService,
    private readonly http: HttpClient,
    private readonly columnService: ColumnService
  ) {
    this.addresses$
      .pipe(
        map(addresses => {
          StorageService.save(this.featureName, addresses);
        })
      )
      .subscribe();
  }

  get hasAddresses() {
    return this.addresses.length > 0;
  }

  get addresses() {
    return this._bareAddresses.value;
  }

  get hasInvalidAddresses() {
    return this.addresses.some(a => !a.isValid);
  }

  get validAddresses() {
    return this.addresses.filter(a => a.isValid);
  }

  public multiAddOrUpdateAddresses(addressResults: AddressCoordinateTableEntry[]) {
    this._bareAddresses.next(this._bareAddresses.value.concat(addressResults));
  }

  public addOrUpdateAddress(addressResult: AddressSelectionResult) {
    if (addressResult.updatedId && this._bareAddresses.value.some(a => a.id === addressResult.updatedId)) {
      const addresses = this._bareAddresses.value.slice();
      const indexToReplace = addresses.findIndex(e => e.id == addressResult.updatedId);
      addresses[indexToReplace] = addressResult.result;
      this._bareAddresses.next(addresses);
      this.notificationService.success(this.translate.instant('notifications.entryEdited'));
    } else if (!this._bareAddresses.value.some(a => a.id === addressResult.result.id)) {
      this._bareAddresses.next(this._bareAddresses.value.concat(addressResult.result));
    } else {
      this.notificationService.info(
        this.translate.instant('notifications.entryAlreadyExists', {
          address:
            addressResult.result.address && addressResult.result.address.length > 0
              ? `(${addressResult.result.address})`
              : ''
        })
      );
    }
  }

  public removeAddress(address: AddressCoordinateTableEntry) {
    const newAddresses = this._bareAddresses.value.slice();
    const index = newAddresses.indexOf(address);
    newAddresses.splice(index, 1);
    this._bareAddresses.next(newAddresses);
  }

  public deleteAllAddresses() {
    this._bareAddresses.next([]);
  }

  public enrichAddresses$ = (addresses: AddressCoordinateTableEntry[], columns: ColumnDefinitions[]) => {
    return from(addresses.entries()).pipe(
      mergeMap(([index, address]) => 
        this.enrichAddress$(address, columns).pipe(
          map(enrichedAddress => ({index, enrichedAddress})) // pass along index to keep order
        )
      ),
      toArray(),
      map(arr => arr.sort((a, b) => a.index - b.index)),
      map(arr => arr.map(item => item.enrichedAddress)),
      catchError(err => {
        return of([]);
      })
    );
  };

  private static getPresentValues(entry: AddressCoordinateTableEntry): (keyof AddressCoordinateTableEntry)[] {
    return Object.keys(entry).filter(
      key => entry[key as keyof AddressCoordinateTableEntry] != null
    ) as (keyof AddressCoordinateTableEntry)[];
  }

  private static getKeyOf(column: ColumnDefinitions): keyof AddressCoordinateTableEntry | null {
    switch (column) {
      case ColumnDefinitions.ADDRESS:
        return 'id'; //the graph works with id, not address
      case ColumnDefinitions.WGS_84:
        return 'wgs84';
      case ColumnDefinitions.LV_95:
        return 'lv95';
      case ColumnDefinitions.LV_03:
        return 'lv03';
      case ColumnDefinitions.HEIGHT:
        return 'height';
      case ColumnDefinitions.EGID:
        return 'egid';
      case ColumnDefinitions.EGRID:
        return 'egrid';
      default:
        return null;
    }
  }

  private readonly enrichAddress$ = (address: AddressCoordinateTableEntry, columns: ColumnDefinitions[]) : Observable<AddressCoordinateTableEntry> => {
    if(!address.isValid) {
      return of(address);
    }

    const presentValues = AddressService.getPresentValues(address);
    const targetValues = columns
      .map(c => AddressService.getKeyOf(c))
      .filter((s): s is keyof AddressCoordinateTableEntry => Boolean(s)); //translate ColumnDefinitions to AddressCoordinateTableEntry keys

    // wgs84 always needed for the map
    if (!targetValues.includes('wgs84')) {
      targetValues.push('wgs84');
    }

    const chain = getEnrichQueries(presentValues, targetValues);

    if (chain.length === 0) {
      return of(address);
    } 
    
    return from(chain).pipe(
      concatMap(apiCall => apiCall(address, this.http)), //concatMap to ensure the order and dependencies of the api calls
      last()
    );
  };
}
