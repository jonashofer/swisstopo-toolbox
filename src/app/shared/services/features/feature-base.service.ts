import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { ColumnConfigItem } from '../../models/ColumnConfiguration';

export interface SearchResultItem<T>{
  data: T;
  text: string;
  originalInput?: string;
}

//TODO refactor to just use string | null
export interface ValidationResult {
  valid: boolean;
  messageLabel?: string;
}

@Injectable()
export abstract class BaseFeatureService<ParsedInputType, AutocompleteData> {

  abstract validateSearchInput(input: string): ValidationResult;

  abstract parseInput(validInput: string): ParsedInputType;

  abstract search(input: ParsedInputType): Observable<SearchResultItem<AutocompleteData>[]>;

  // TODO re-add if needed, currently defaulting to option.text
  // abstract displayFn(input: SearchResultItem<AutocompleteData>): string;

  abstract transformInput(input: SearchResultItem<AutocompleteData>): AddressCoordinateTableEntry;

  abstract transformEntryForEdit(entry: AddressCoordinateTableEntry): string;

  abstract getDefaultColumns(): ColumnConfigItem[];

  abstract getExampleFileContent() : string;

  // TODO probably refactor to [] plus abstract away via single-functions
  abstract searchMultiple(lines: string[]): Observable<AddressCoordinateTableEntry>
}
