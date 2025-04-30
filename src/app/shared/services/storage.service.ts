import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
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
