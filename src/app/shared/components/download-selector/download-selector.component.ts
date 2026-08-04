import { Component, TemplateRef, inject } from '@angular/core';
import { AddressService, DownloadService } from '../../services';
import { MatDialog } from '@angular/material/dialog';
import { SharedStandaloneModule } from '../../shared-standalone.module';

@Component({
  selector: 'app-download-selector',
  templateUrl: './download-selector.component.html',
  styleUrls: ['./download-selector.component.scss'],
  imports: [SharedStandaloneModule]
})
export class DownloadSelectorComponent {
  downloadService = inject(DownloadService);
  private readonly addressService = inject(AddressService);
  private readonly dialog = inject(MatDialog);

  public downloadCsv(dialogRef: TemplateRef<unknown>) {
    if (this.addressService.hasInvalidAddresses) {
      this.dialog.open(dialogRef);
    } else {
      this.downloadService.downloadCsv(false);
    }
  }
}
