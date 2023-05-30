import { Injectable, InjectionToken } from '@angular/core';
import { Observable, forkJoin, from, mergeMap, of, switchMap } from 'rxjs';
import { AddressCoordinateTableEntry } from '../models/AddressCoordinateTableEntry';
import { ColumnConfigItem } from '../models/ColumnConfiguration';

export interface SearchResultItem {
  data: any;
  text: string;
  originalInput?: string;
}

export interface SearchResultItemTyped<T> extends SearchResultItem {
  data: T;
}

export enum LabelType {
  ADDRESS = 'address',
  COORDINATE = 'coordinate',
  EGID = 'egid',
}

export const FEATURE_SERVICE_TOKEN = new InjectionToken<FeatureService>('FEATURE_SERVICE_TOKEN');

export interface FeatureService {
  name: string;
  labelType: LabelType;
  showCoordinateSystemSwitch: boolean;
  disableInactivationOfOldSystemWhenSwitching: boolean;

  validateSearchInput(input: string): string | null;

  search(validInput: string): Observable<SearchResultItem[]>;

  // TODO remove observable need by moving dynamic things (reverse wgs84 search) into enrich
  transformInput(input: SearchResultItem): Observable<AddressCoordinateTableEntry>;

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string;

  getDefaultColumns(): ColumnConfigItem[];

  getExampleFileContent(): string;

  searchMultiple(lines: string[]): Observable<AddressCoordinateTableEntry[]>;
}

@Injectable()
export abstract class FeatureServiceBase<AutocompleteData> implements FeatureService {
  showCoordinateSystemSwitch: boolean = true;
  disableInactivationOfOldSystemWhenSwitching: boolean = false;
  
  private bulkAddId = -1;
  protected messageForMultipleResults: string | null = null;

  constructor(public name: string, public labelType: LabelType) {}

  abstract validateSearchInput(input: string): string | null;

  abstract search(validInput: string): Observable<SearchResultItemTyped<AutocompleteData>[]>;

  abstract transformInput(input: SearchResultItemTyped<AutocompleteData>): Observable<AddressCoordinateTableEntry>;

  abstract transformEntryForEdit(entry: AddressCoordinateTableEntry): string;

  abstract getDefaultColumns(): ColumnConfigItem[];

  abstract getExampleFileContent(): string;

  public searchMultiple(lines: string[]): Observable<AddressCoordinateTableEntry[]> {
    const observables = lines.map(userInput => {
        const validation = this.validateSearchInput(userInput);
        if (validation !== null) {
            const entry: AddressCoordinateTableEntry = {
                address: userInput,
                id: (--this.bulkAddId).toString(),
                isValid: false,
                warningTranslationKey: validation,
                wgs84: null,
                lv95: null,
                lv03: null,
                originalInput: userInput
            };
            return of(entry);
        } else {
            return this.search(userInput).pipe(
                switchMap(r => {
                    // if there are no results, return an invalid entry with "noResults" message
                    if (r.length == 0) {
                        const entry: AddressCoordinateTableEntry = {
                            address: userInput,
                            id: (--this.bulkAddId).toString(),
                            isValid: false,
                            warningTranslationKey: `search.${this.labelType}.noResults`,
                            wgs84: null,
                            lv95: null,
                            lv03: null,
                            originalInput: userInput
                        };
                        return of(entry);
                    }

                    // if there is exactly one result, take that
                    // also take the first result if no messageForMultipleResults is set, which indicates we also want the first
                    // for e.g. reverse geocoding where we want the nearest address
                    if (r.length == 1 || this.messageForMultipleResults === null) {
                        return this.transformInput(r[0]);
                    }

                    // if there is more than one result (and messageForMultipleResults is not null, e.g. AddressSearch)
                    // return an invalid entry with the provided message
                    const entry: AddressCoordinateTableEntry = {
                        address: userInput,
                        id: (--this.bulkAddId).toString(),
                        isValid: false,
                        warningTranslationKey: this.messageForMultipleResults,
                        wgs84: null,
                        lv95: null,
                        lv03: null,
                        originalInput: userInput
                    };
                    return of(entry);
                })
            );
        }
    });
    return forkJoin(observables);
}

}
