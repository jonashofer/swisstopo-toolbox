import { Component, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent,
  MatLegacyAutocompleteTrigger as MatAutocompleteTrigger
} from '@angular/material/legacy-autocomplete';
import { ErrorStateMatcher } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { ObNotificationService } from '@oblique/oblique';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../services';
import { ApiSearchResult } from '../../services/api.service';
import { AddressCoordinateTableEntry, AddressSelectionResult } from '../../models/AddressCoordinateTableEntry';
import { InputSearchMode } from '../../models/InputSearchMode';
import { GWREntry, GWRSearchResult, ReverseApiService } from '../../services/reverse-api.service';
import { Observable } from 'rxjs';
import { Coordinate } from '../../models/Coordinate';
import { FEATURE_TAB_CONFIG, FeatureTabConfig } from 'src/app/feature-tab.config';

export interface SearchResultItem {
  text: string;

  a2c_data?: ApiSearchResult;
  c2a_data?: {gwr: GWRSearchResult, addressText: string, distance: number, lv95: Coordinate};
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

  results$: Observable<SearchResultItem[]> = this.inputFormControl.valueChanges.pipe(
    filter(v => this.inputFormControl.valid && typeof v === 'string'),
    filter((v): v is string => !!v),
    debounceTime(300),
    switchMap(value => {
      console.log
      if (this.mode === InputSearchMode.Coordinate) {
        return this.reverseApi.search(value);
      } else {
        return this.api.searchLocationsList(value).pipe(map(r => r.results.map(x => ({ text: x.attrs.label, a2c_data: x }))));
      }
    }),
    tap(_ => this.trigger?.openPanel())
  );

  existingEntryId: string | null = null;

  @Input()
  mode = InputSearchMode.All;

  searchLabel = "";

  @Input()
  set addressToEdit(existingEntry: AddressCoordinateTableEntry | null) {
    if (existingEntry) {
      this.inputFormControl.setValue(existingEntry.address);
      document.getElementsByTagName('input')[0].focus();
      this.existingEntryId = existingEntry.id;
    }
  }

  @Output()
  resultSelected = new EventEmitter<AddressSelectionResult>();

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger | undefined;

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
      this.api.searchMultiple(lines).subscribe(r => this.emitEntry(r));
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
