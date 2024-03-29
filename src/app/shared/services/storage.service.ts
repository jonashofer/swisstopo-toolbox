import { Injectable } from '@angular/core';
import { AddressCoordinateTableEntry } from '../models/AddressCoordinateTableEntry';

@Injectable()
export class StorageService {
  constructor() { }
  
  public static save<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  public static get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
    return null;
  }
}
