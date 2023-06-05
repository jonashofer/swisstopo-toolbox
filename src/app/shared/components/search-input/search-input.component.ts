import { Component, Inject, Input, TemplateRef } from '@angular/core';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ObNotificationService } from '@oblique/oblique';
import { AddressService, FEATURE_SERVICE_TOKEN, FeatureService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import { map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent {
  selectedInputType = 0; // 0 = text, 1 = file
  progress = 0;
  progressText = '';

  @Input()
  addressToEdit: AddressCoordinateTableEntry | null = null;

  lines: string[] = [];

  constructor(
    private readonly addressService: AddressService,
    private readonly dialog: MatDialog,
    private readonly notificationService: ObNotificationService,
    private readonly translate: TranslateService,
    @Inject(FEATURE_SERVICE_TOKEN) private readonly featureService: FeatureService
  ) {}

  addAll() {
    this.featureService.progressUpdates.subscribe(progress => {
      this.progress = (100 / this.lines.length) * progress;
      this.progressText = `${progress} / ${this.lines.length}`;
    });

    this.featureService.searchMultiple(this.lines).subscribe(r => {
      this.addressService.multiAddOrUpdateAddresses(r);
      this.selectedInputType = 0;
      this.progress = 0;
      this.dialog.closeAll();
      this.notificate(r.length);
      this.lines = [];
    });
  }

  multiAdd(lines: string[], replaceDialogRef: TemplateRef<any>, tooManyDialogRef: TemplateRef<any>) {
    if (!this.addressService.hasAddresses) {
      if (lines.length > 2) {
        this.lines = lines;
        this.dialog.open(tooManyDialogRef, { disableClose: true });
        return;
      }
      this.featureService.searchMultiple(lines).subscribe(r => {
        this.addressService.multiAddOrUpdateAddresses(r);
        this.selectedInputType = 0;
        this.notificate(r.length);
      });
      return;
    }

    if (this.addressService.hasAddresses) {
      this.dialog
        .open(replaceDialogRef)
        .afterClosed()
        .pipe(
          map((replace: boolean | null) => {
            if (replace === null) {
              return;
            }
            if (replace) {
              this.addressService.deleteAllAddresses();
            }
            if (lines.length > 2) {
              this.lines = lines;
              this.dialog.open(tooManyDialogRef, { disableClose: true });
              return;
            }
            this.featureService.searchMultiple(lines).subscribe(r => {
              this.addressService.multiAddOrUpdateAddresses(r);
              this.selectedInputType = 0;
              this.notificate(r.length);
            });
            return;
          })
        ).subscribe();
        return;
    }
  }

  private notificate(count: number) {
    this.notificationService.info(
      this.translate.instant('notifications.entriesAdded', {
        count: count
      })
    );
  }
}
