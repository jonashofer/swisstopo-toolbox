import { Injectable, InjectionToken } from '@angular/core';
import { Observable, Subject, concatMap, forkJoin, from, map, mergeMap, of, reduce, switchMap, tap, toArray } from 'rxjs';
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
  EGID = 'egid'
}

export const FEATURE_SERVICE_TOKEN = new InjectionToken<FeatureService>('FEATURE_SERVICE_TOKEN');

export interface FeatureService {
  name: string;
  labelType: LabelType;
  showCoordinateSystemSwitch: boolean;
  disableInactivationOfOldSystemWhenSwitching: boolean;
  progressUpdates: Observable<number>;

  validateSearchInput(input: string): string | null;

  search(validInput: string): Observable<SearchResultItem[]>;

  transformInput(input: SearchResultItem): AddressCoordinateTableEntry;

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

  public progressUpdates = new Subject<number>();

  constructor(public name: string, public labelType: LabelType) {}

  abstract validateSearchInput(input: string): string | null;

  abstract search(validInput: string): Observable<SearchResultItemTyped<AutocompleteData>[]>;

  abstract transformInput(input: SearchResultItemTyped<AutocompleteData>): AddressCoordinateTableEntry;

  abstract transformEntryForEdit(entry: AddressCoordinateTableEntry): string;

  abstract getDefaultColumns(): ColumnConfigItem[];

  abstract getExampleFileContent(): string;

  public searchMultiple(lines: string[]): Observable<AddressCoordinateTableEntry[]> {
    let progress = 0;
    const concurrencyLimit = 10;

    // Split the lines array into chunks
    const chunks = [];
    for (let i = 0; i < lines.length; i += concurrencyLimit) {
      chunks.push(lines.slice(i, i + concurrencyLimit));
    }

    return from(chunks).pipe(
      concatMap(chunkLines =>
        // Within each chunk, process lines concurrently with forkJoin
        forkJoin(
          chunkLines.map(userInput => this.processLine(userInput).pipe(tap(x => this.progressUpdates.next(++progress))))
        )
      ),
      // Use reduce to concatenate the results of all chunks into a single array
      reduce((acc, val) => [...acc, ...val]),
      tap(() => this.progressUpdates.next(0)),
    );
  }
  private processLine(userInput: string): Observable<AddressCoordinateTableEntry> {
    const validation = this.validateSearchInput(userInput);
    if (validation !== null) {
      const entry: AddressCoordinateTableEntry = {
        address: userInput,
        id: (--this.bulkAddId).toString(),
        isValid: false,
        warningTranslationKey: validation,
        originalInput: userInput
      };
      return of(entry);
    } else {
      return this.search(userInput).pipe(
        map(r => {
          // if there are no results, return an invalid entry with "noResults" message
          if (r.length == 0) {
            const entry: AddressCoordinateTableEntry = {
              address: userInput,
              id: (--this.bulkAddId).toString(),
              isValid: false,
              warningTranslationKey: `search.${this.labelType}.noResults`,
              originalInput: userInput
            };
            return entry;
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
            originalInput: userInput
          };
          return entry;
        })
      );
    }
  }
}
