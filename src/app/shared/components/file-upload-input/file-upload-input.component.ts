import { Component, EventEmitter, Inject, Output, TemplateRef } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ObIUploadEvent, ObNotificationService } from '@oblique/oblique';
import { AddressService, DownloadService, FEATURE_SERVICE_TOKEN, FeatureService } from '../../services';
import saveAs from 'file-saver';

@Component({
  selector: 'app-file-upload-input',
  templateUrl: './file-upload-input.component.html',
  styleUrls: ['./file-upload-input.component.scss']
})
export class FileUploadInputComponent {
  @Output()
  uploaded = new EventEmitter<string[]>();

  // @Input()
  // mode = InputSearchMode.All;

  private lines: string[] = [];

  constructor(
    public downloadService: DownloadService,
    private readonly translate: TranslateService,
    @Inject(FEATURE_SERVICE_TOKEN) private readonly featureService: FeatureService
  ) { }

  uploadEvent($event: ObIUploadEvent) {
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

        this.uploaded.emit(this.lines);
    };
    reader.readAsText(file as File);
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

