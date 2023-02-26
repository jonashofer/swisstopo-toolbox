import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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
import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent, MatLegacyAutocompleteTrigger as MatAutocompleteTrigger } from '@angular/material/legacy-autocomplete';
import { ErrorStateMatcher } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { ObNotificationService } from '@oblique/oblique';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../services';
import { ApiSearchResult } from '../../services/api.service';
import { AddressCoordinateTableEntry, AddressSelectionResult } from '../models/AddressCoordinateTableEntry';

@Component({
  selector: 'app-address-search-input',
  templateUrl: './address-search-input.component.html',
  styleUrls: ['./address-search-input.component.scss']
})
export class AddressSearchInputComponent {
  public inputFormControl = new FormControl<string>('', { validators: this.searchInputValidator(), updateOn: 'change' });
  instantErrorStateMatcher = new InstantErrorStateMatcher();

  results$ = this.inputFormControl.valueChanges.pipe(
    filter(v => this.inputFormControl.valid && typeof v === 'string'),
    debounceTime(300),
    switchMap(value =>
      this.api.searchLocationsList(value as unknown as string).pipe(
        tap(_ => this.trigger?.openPanel()),
        map(r => r.results)
      )
    )
  );

  existingEntryId: number | null = null;

  @Input()
  set input(existingEntry: AddressCoordinateTableEntry | null) {
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
    private readonly notificationService: ObNotificationService,
    private readonly translate: TranslateService
  ) {}

  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    this.inputFormControl.setValue(null);
    const selectedValue = event.option.value as ApiSearchResult;
    const entry = this.api.mapApiResultToAddress(selectedValue);
    
    this.emitEntry(entry);
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
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && typeof control.value === 'string') {
        const validation = this.api.validateSearchInput(control.value);
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
