import { Component, OnDestroy, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ObIAutocompleteInputOption } from '@oblique/oblique';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { ColumnService } from '../../services/column.service';
import { ColumnConfigItem, ColumnDefinitions } from '../models/ColumnConfiguration';

@Component({
  selector: 'app-column-config-dialog',
  templateUrl: './column-config-dialog.component.html',
  styleUrls: ['./column-config-dialog.component.scss']
})
export class ColumnConfigDialogComponent implements OnInit {
  constructor(private readonly columnService: ColumnService, private readonly translate: TranslateService) {}
  activeColumns: ColumnConfigItem[] = [];
  inactiveColumns: ObIAutocompleteInputOption[] = [];
  formControl = new FormControl('');

  labelCache: any;

  ngOnInit() {
    this.activeColumns = [...this.columnService.getCurrentConfig().columns];
    this.calculateInactive();

    //ugly hack to workaround obliques restriction that we cannot use objects for autocomplete
    //so we need to be able to back-translate the column labels to make everything work
    //labelCache is a object with the current languages label as key with the value of the column definition key
    this.translate.getTranslation(this.translate.currentLang).subscribe(r => {
      this.labelCache = Object.fromEntries(
        Object.entries(r)
          .filter(r => r[0].startsWith('columns.'))
          .map(([key, value]) => [value, key.replace('columns.', '')])
      );
    });
  }

  save() {
    this.columnService.setConfig({ key: 'default', columns: this.activeColumns });
  }

  dropItem(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.activeColumns, event.previousIndex, event.currentIndex);
  }

  remove(item: ColumnConfigItem) {
    const index = this.activeColumns.indexOf(item);
    this.activeColumns.splice(index, 1);
    this.calculateInactive();
    this.formControl.setValue('');
    this.formControl.enable();
  }

  updateSelection(item: ObIAutocompleteInputOption): void {
    const index = this.inactiveColumns.indexOf(item);
    this.inactiveColumns.splice(index, 1);
    this.activeColumns.push({ key: this.labelCache[item.label] });

    if (this.inactiveColumns.length == 0) {
      this.formControl.disable();
    }
    this.formControl.setValue('');
    this.calculateInactive();
  }

  private calculateInactive() {
    this.inactiveColumns = Object.values(ColumnDefinitions)
      .filter(i => !this.activeColumns.find(c => i == c.key))
      .map(i => {
        return { label: this.translate.instant('columns.' + i), disabled: false };
      });
  }
}
