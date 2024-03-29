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
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { AddressCoordinateTableEntry, AddressSelectionResult } from '../../models/AddressCoordinateTableEntry';
import { Observable, of } from 'rxjs';
import { AddressService, FEATURE_SERVICE_TOKEN, FeatureService, SearchResultItem } from '../../services';


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
      if (this.inputFormControl.valid && typeof value === 'string' && value !== '') {
        return this.featureService.search(value);
      } else {
        return of([]);
      }
    }),
    tap(r => (this.noResults = r.length === 0 && this.inputFormControl.valid && !!this.inputFormControl.value))
  );

  existingEntryId: string | null = null;

  searchLabel = '';
  

  @Output()
  linesPasted = new EventEmitter<string[]>();

  @Input()
  set addressToEdit(existingEntry: AddressCoordinateTableEntry | null) {
    if (existingEntry) {
      const value = this.featureService.transformEntryForEdit(existingEntry);
      this.inputFormControl.setValue(value);
      this.existingEntryId = existingEntry.id;
      document.getElementsByTagName('input')[0].focus();
    }
  }

  constructor(
    private readonly addressService: AddressService,
    @Inject(FEATURE_SERVICE_TOKEN) public featureService: FeatureService
  ) {
    this.searchLabel = `search.${featureService.labelType}.`;
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    this.inputFormControl.setValue(null);
    const selectedValue = event.option.value as SearchResultItem;
    this.addressService.addOrUpdateAddress({
      result: this.featureService.transformInput(selectedValue),
      updatedId: this.existingEntryId
    });
    this.existingEntryId = null;
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
        
      this.linesPasted.emit(lines);
    }
  }

  private searchInputValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && typeof control.value === 'string') {
        const validation = this.featureService.validateSearchInput(control.value);
        if (validation) {
          return { searchInput: validation };
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
