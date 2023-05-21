import { Component, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ColumnService } from '../../services/column.service';
import { ColumnConfigItem } from '../../models/ColumnConfiguration';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';

@Component({
  selector: 'app-column-config-dialog',
  templateUrl: './column-config-dialog.component.html',
  styleUrls: ['./column-config-dialog.component.scss']
})
export class ColumnConfigDialogComponent implements OnInit {
  constructor(private readonly columnService: ColumnService) {}

  ngOnInit() {
    this.items = this.columnService.getCurrentConfig().map(x => Object.assign({}, x)); // deep copy to prevent setting original objects
  }

  items: ColumnConfigItem[] = [];

  @ViewChild('list')
  list: MatSelectionList | null = null;

  onSelectionChange(event: MatSelectionListChange) {
    event.options[0].value.active = event.options[0].selected
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }

  moveUp(index: number) {
    if (index > 0) {
      moveItemInArray(this.items, index, index - 1);
    }
  }

  moveDown(index: number) {
    if (index < this.items.length - 1) {
      moveItemInArray(this.items, index, index + 1);
    }
  }

  save() {
    this.columnService.setConfig(this.items);
  }

  reset() {
    this.items = this.columnService.getInitial()
  }
}
