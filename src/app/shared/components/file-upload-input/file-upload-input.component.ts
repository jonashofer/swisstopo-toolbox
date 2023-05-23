import { Component, EventEmitter, Inject, Input, Output, TemplateRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ObIUploadEvent, ObNotificationService } from '@oblique/oblique';
import { AddressService, ApiService, DownloadService } from '../../services';
import { ReverseApiService } from '../../services/reverse-api.service';
import { FEATURE_SERVICE_TOKEN, FeatureService } from '../../services/features/feature.service';

@Component({
  selector: 'app-file-upload-input',
  templateUrl: './file-upload-input.component.html',
  styleUrls: ['./file-upload-input.component.scss']
})
export class FileUploadInputComponent {
  @Output()
  finished = new EventEmitter<void>();

  // @Input()
  // mode = InputSearchMode.All;

  private lines: string[] = [];

  constructor(
    private readonly api: ApiService,
    private readonly reverseApi: ReverseApiService,
    private readonly addressService: AddressService,
    public downloadService: DownloadService,
    private readonly dialog: MatDialog,
    private readonly notificationService: ObNotificationService,
    private readonly translate: TranslateService,
    @Inject(FEATURE_SERVICE_TOKEN) private readonly featureService: FeatureService
  ) {}

  uploadEvent($event: ObIUploadEvent, dialogRef: TemplateRef<any>) {
    if ($event?.files?.length != 1) {
      return;
    }
    const file = $event.files[0];
    const reader = new FileReader();
    reader.onload = _ => {
      const content = reader.result as string;
      this.lines = content
        .split('\r')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (this.addressService.hasAddresses) {
        this.dialog.open(dialogRef);
      } else {
        this.emitResults(false);
      }
    };
    reader.readAsText(file as File);
  }

  //TODO generalize-refactoring
  emitResults(replace: boolean) {
    if (replace) {
      this.addressService.deleteAllAddresses();
    }
    this.notificationService.info(
      this.translate.instant('notifications.entriesAdded', {
        count: this.lines.length
      })
    );

    this.featureService.searchMultiple(this.lines).subscribe(r => {
      this.addressService.addOrUpdateAddress({ result: r, updatedId: null });
      this.lines = [];
      this.finished.emit();
    });

    // if (this.mode === InputSearchMode.Address) {
    //   this.api
    //     .searchMultiple(this.lines)
    //     .subscribe(r => this.addressService.addOrUpdateAddress({ result: r, updatedId: null }));
    // } else {
    //   this.reverseApi.searchMultiple(this.lines).subscribe(r => this.addressService.addOrUpdateAddress({ result: r, updatedId: null }));
    // }
    // this.lines = [];
    // this.finished.emit();
  }
}

