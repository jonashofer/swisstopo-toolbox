import { Inject, Injectable } from '@angular/core';
import saveAs from 'file-saver';
import { AddressService, ColumnService } from '.';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AddressCoordinateTableEntry } from '../models';
import { FEATURE_SERVICE_TOKEN, FeatureService } from './features';

@Injectable()
export class DownloadService {
  public addressesCopied$ = new Subject<void>();

  constructor(
    private readonly addressService: AddressService,
    @Inject(FEATURE_SERVICE_TOKEN) private readonly featureService: FeatureService,
    private readonly translate: TranslateService,
    private readonly columnService: ColumnService
  ) {}

  public getCopyToClipboardText(): string {
    return this.joinAddressesWithHeader(this.addressService.addresses, '\t');
  }

  public downloadCsv(onlyValidAddresses: boolean) {
    const addresses = onlyValidAddresses ? this.addressService.validAddresses : this.addressService.addresses;
    const result = this.joinAddressesWithHeader(addresses, ';');
    const file = new Blob([result], { type: 'text/csv' });
    saveAs(file, `${this.getFilename()}.csv`);
  }

  public downloadKml() {
    const result = `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2">
    ${this.addressService.validAddresses.map(this.toKmlPlacemark).join('')}</kml>`;
    const file = new Blob([result], {
      type: 'application/vnd.google-earth.kml+xml;charset=utf-8'
    });
    saveAs(file, `${this.getFilename()}.kml`);
  }

  private joinAddressesWithHeader(addresses: AddressCoordinateTableEntry[], seperator: string) {
    const header = this.getHeader(seperator);
    return header + addresses.map(a => this.getLine(a, seperator)).join('\r\n');
  }

  private getHeader(seperator: string) {
    return (
      this.getCurrentColumns()
        .map(c => this.translate.instant(`columns.${c}`))
        .join(seperator) + '\r\n'
    );
  }

  private getLine(entry: AddressCoordinateTableEntry, separator: string) {
    return this.getCurrentColumns()
      .map(c => this.getNestedProperty(entry, c.toString()))
      .join(separator);
  }

  private getCurrentColumns() {
    return this.columnService
      .getCurrentConfig()
      .filter(c => c.active && !c.isSystemColumn)
      .flatMap(c => this.columnService.expandCoordinateColumnOrDefault(c.key, '.'));
  }

  private toKmlPlacemark(entry: AddressCoordinateTableEntry) {
    return `<Placemark><Point><coordinates>${entry.wgs84?.lon},${entry.wgs84?.lat}</coordinates></Point></Placemark>`;
  }

  private getFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}-${hours}${minutes}`;

    return `${formattedDate}_SwisstopoToolbox_${this.translate.instant(
      `toolbar.download.filename.${this.featureService.labelType}`
    )}`;
  }

  private getNestedProperty(obj: any, path: string) {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }
}
