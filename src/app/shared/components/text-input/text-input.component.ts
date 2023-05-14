import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent } from '@angular/material/legacy-autocomplete';
import { ErrorStateMatcher } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { ObNotificationService } from '@oblique/oblique';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../services';
import { ApiSearchResult } from '../../services/api.service';
import { AddressCoordinateTableEntry, AddressSelectionResult } from '../../models/AddressCoordinateTableEntry';
import { InputSearchMode } from '../../models/InputSearchMode';
import { GWRSearchResult, ReverseApiService } from '../../services/reverse-api.service';
import { Observable, of } from 'rxjs';
import { Coordinate } from '../../models/Coordinate';
import { FEATURE_TAB_CONFIG, FeatureTabConfig } from 'src/app/feature-tab.config';

export interface SearchResultItem {
  text: string;
  originalInput?: string;
  a2c_data?: ApiSearchResult;
  c2a_data?: { gwr: GWRSearchResult; addressText: string; distance: number; lv95: Coordinate };
}

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss']
})
export class TextInputComponent {
  public inputFormControl = new FormControl<string>('', {
    validators: this.searchInputValidator(),
    updateOn: 'change'
  });
  instantErrorStateMatcher = new InstantErrorStateMatcher();
  noResults = false;

  results$: Observable<SearchResultItem[]> = this.inputFormControl.valueChanges.pipe(
    debounceTime(300),
    switchMap(value => {
      console.log('letsgo');
      if (this.inputFormControl.valid && typeof value === 'string' && value !== '') {
        if (this.mode === InputSearchMode.Coordinate) {
          return this.reverseApi.search(value).pipe(
            catchError(err => {
              return of([]);
            })
          );
        } else {
          return this.api.searchLocationsList(value).pipe(
            map(r => r.map(x => ({ text: x.attrs.label, originalInput: value, a2c_data: x } as SearchResultItem))),
            catchError(err => {
              return of([]);
            })
          );
        }
      } else {
        return of([]);
      }
    }),
    tap(r => (this.noResults = r.length === 0 && this.inputFormControl.valid && !!this.inputFormControl.value))
  );

  existingEntryId: string | null = null;

  @Input()
  mode = InputSearchMode.All;

  searchLabel = '';

  @Input()
  set addressToEdit(existingEntry: AddressCoordinateTableEntry | null) {
    if (existingEntry) {
      if (existingEntry.originalInput) {
        this.inputFormControl.setValue(existingEntry.originalInput);
      } else {
        this.inputFormControl.setValue(existingEntry.address);
      }
      this.existingEntryId = existingEntry.id;
      document.getElementsByTagName('input')[0].focus();
    }
  }

  @Output()
  resultSelected = new EventEmitter<AddressSelectionResult>();

  constructor(
    private readonly api: ApiService,
    private readonly reverseApi: ReverseApiService,
    private readonly notificationService: ObNotificationService,
    private readonly translate: TranslateService,
    @Inject(FEATURE_TAB_CONFIG) public featureConfig: FeatureTabConfig
  ) {
    this.searchLabel = `search.${featureConfig.shortName}.`;
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    this.inputFormControl.setValue(null);
    const selectedValue = event.option.value as SearchResultItem;
    if (selectedValue.a2c_data) {
      const entry = this.api.mapApiResultToAddress(selectedValue.a2c_data);
      this.emitEntry(entry);
    } else if (selectedValue.c2a_data) {
      const entry = this.reverseApi.mapReverseApiResultToAddress(selectedValue);
      entry.subscribe(e => this.emitEntry(e));
    }
  }

  clearInput() {
    this.existingEntryId = null;
  }

  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData!.getData('text');
    if (pastedText.includes('\r') && !this.existingEntryId) {
      event.preventDefault();
      const lines = pastedText
        .split('\r')
        .map(l => l.trim())
        .filter(l => l.length > 0);
      this.notificationService.info(
        this.translate.instant('notifications.entriesAdded', {
          count: lines.length
        })
      );
      if (this.mode === InputSearchMode.Coordinate) {
        this.reverseApi.searchMultiple(lines).subscribe(r => this.emitEntry(r));
      } else {
        this.api.searchMultiple(lines).subscribe(r => this.emitEntry(r));
      }
    }
  }

  private emitEntry(entry: AddressCoordinateTableEntry) {
    this.resultSelected.emit({
      result: entry,
      updatedId: this.existingEntryId
    });
    this.existingEntryId = null;
  }

  private searchInputValidator(): ValidatorFn {
    switch (this.mode) {
      case InputSearchMode.Address:
    }

    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && typeof control.value === 'string') {
        let validation: { valid: boolean; messageLabel?: string } = { valid: true };
        switch (this.mode) {
          case InputSearchMode.Address:
            validation = this.api.validateSearchInput(control.value);
            break;
          case InputSearchMode.Coordinate:
            validation = this.reverseApi.validateSearchInput(control.value);
            break;
        }
        if (!validation.valid) {
          return { searchInput: validation.messageLabel! };
        }
      }
      return null;
    };
  }
}

// Custom Matcher needed to fire mat-error directly on change, as with updateOn: 'change'
class InstantErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
