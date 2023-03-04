import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ObNotificationService } from '@oblique/oblique';
import { BehaviorSubject, EMPTY, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ApiService } from '.';
import { AddressCoordinateTableEntry, AddressSelectionResult } from '../components/models/AddressCoordinateTableEntry';
import { CooridnateSystem } from '../components/models/CoordinateSystem';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'addresses';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly _addresses = new BehaviorSubject<AddressCoordinateTableEntry[]>(StorageService.get<AddressCoordinateTableEntry[]>(STORAGE_KEY) ||[]);
  public addresses$ = this._addresses.asObservable();
  public validAddresses$ = this.addresses$.pipe(map(a => a.filter(a => a.isValid)));
  public hasAddresses$ = this.addresses$.pipe(map(a => a.length > 0));

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
    private readonly notificationService: ObNotificationService,
    private readonly translate: TranslateService
  ) {
    this.addresses$
      .pipe(
        map(addresses => {
          StorageService.save(STORAGE_KEY, addresses);
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

  public convertAddresses$ = (addresses: AddressCoordinateTableEntry[], newCoordinateSystem: CooridnateSystem) =>
    from(addresses).pipe(mergeMap(address => this.convertAddress$(address, newCoordinateSystem)));

  private readonly convertAddress$ = (address: AddressCoordinateTableEntry, newCoordinateSystem: CooridnateSystem) => {
    // if (address[newCoordinateSystem] != null) {
    //   StorageService.save(STORAGE_KEY, this.addresses);
    //   return EMPTY;
    // }

    return this.api.convertFromWgs84({lat: address.wgs84_lat!, lon: address.wgs84_lon!}, newCoordinateSystem).pipe(
      map(coordinate => {
        // address[newCoordinateSystem] = coordinate;
        StorageService.save(STORAGE_KEY, this.addresses);
      })
    );
  };
}
