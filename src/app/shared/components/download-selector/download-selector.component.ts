import { Component, TemplateRef } from '@angular/core';
import { AddressService, DownloadService } from '../../services';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-download-selector',
  templateUrl: './download-selector.component.html',
  styleUrls: ['./download-selector.component.scss']
})
export class DownloadSelectorComponent {
  constructor(
    public downloadService: DownloadService,
    private readonly addressService: AddressService,
    private readonly dialog: MatDialog
  ) {}

  public downloadCsv(dialogRef: TemplateRef<any>) {
    if (this.addressService.hasInvalidAddresses) {
      this.dialog.open(dialogRef);
    } else {
      this.downloadService.downloadCsv(false);
    }
  }
}
