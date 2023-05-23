import { Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { ColumnConfigItem } from '../../models/ColumnConfiguration';

export interface SearchResultItem {
  data: any;
  text: string;
  originalInput?: string;
}

export interface SearchResultItemTyped<T> extends SearchResultItem {
  data: T;
}


export const FEATURE_SERVICE_TOKEN = new InjectionToken<FeatureService>('FEATURE_SERVICE_TOKEN');

export interface FeatureService {

  name: string;
  shortName: string;
  
  validateSearchInput(input: string): string | null;

  parseInput(validInput: string): any;

  search(input: any): Observable<SearchResultItem[]>;

  // TODO re-add if needed, currently defaulting to option.text
  // abstract displayFn(input: SearchResultItem<AutocompleteData>): string;

  // TODO remove observable need by moving dynamic things (reverse wgs84 search) into enrich
  transformInput(input: SearchResultItem): Observable<AddressCoordinateTableEntry>;

  transformEntryForEdit(entry: AddressCoordinateTableEntry): string;

  getDefaultColumns(): ColumnConfigItem[];

  getExampleFileContent() : string;

  // TODO probably refactor to [] plus abstract away via single-functions
  searchMultiple(lines: string[]): Observable<AddressCoordinateTableEntry>
}

@Injectable()
export abstract class FeatureServiceBase<ParsedInputType, AutocompleteData> implements FeatureService {

  constructor(public name: string, public shortName: string) { }

  abstract validateSearchInput(input: string): string | null;

  abstract parseInput(validInput: string): ParsedInputType;

  abstract search(input: ParsedInputType): Observable<SearchResultItemTyped<AutocompleteData>[]>;

  // TODO re-add if needed, currently defaulting to option.text
  // abstract displayFn(input: SearchResultItem<AutocompleteData>): string;

  abstract transformInput(input: SearchResultItemTyped<AutocompleteData>): Observable<AddressCoordinateTableEntry>;

  abstract transformEntryForEdit(entry: AddressCoordinateTableEntry): string;

  abstract getDefaultColumns(): ColumnConfigItem[];

  abstract getExampleFileContent() : string;

  // TODO probably refactor to [] plus abstract away via single-functions
  abstract searchMultiple(lines: string[]): Observable<AddressCoordinateTableEntry>
}
