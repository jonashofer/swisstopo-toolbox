import { Component, EventEmitter, Inject, Output, TemplateRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ObIUploadEvent, ObNotificationService } from '@oblique/oblique';
import { AddressService, DownloadService } from '../../services';
import saveAs from 'file-saver';
import { FEATURE_SERVICE_TOKEN, FeatureService } from '../../services/features';

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
      this.addressService.multiAddOrUpdateAddresses(r);
      this.lines = [];
      this.finished.emit();
    });
  }
  
  downloadExampleTxt() {
    const result = this.featureService.getExampleFileContent();
    const file = new Blob([result], { type: 'text/plain' });
    const name = `SwisstopoToolbox_${this.translate.instant(
      `toolbar.download.filename.${this.featureService.labelType}`
    )}_${this.translate.instant(`fileInput.exampleFile.name`)}.txt`;
    saveAs(file, name);
  }
}

