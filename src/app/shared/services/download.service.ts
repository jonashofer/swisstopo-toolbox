import { Inject, Injectable } from '@angular/core';
import saveAs from 'file-saver';
import { CoordinateService } from '.';
import { CoordinatePipe } from '../components/coordinate.pipe';
import { AddressCoordinateTableEntry } from '../models/AddressCoordinateTableEntry';
import { CoordinateSystem } from '../models/CoordinateSystem';
import { AddressService } from './address.service';

@Injectable()
export class DownloadService {
  constructor(
    @Inject(AddressService) private readonly addressService: AddressService,
    private readonly coordinateService: CoordinateService
  ) {}

  public getCopyToClipboardText(): string {
    return this.addressService.addresses.map(a => this.getLine(a, '\t', true)).join('\r\n');
  }

  public downloadExampleTxt() {
    const result = `Bundesplatz 1 3011 Bern\r\nSeftigenstrasse 264 3084 Wabern\r\nParadeplatz 2\r\n`;
    const file = new Blob([result], { type: 'text/plain' });
    saveAs(file, 'example.txt');
  }

  public downloadCsv() {
    const result = this.addressService.validAddresses.map(a => this.getLine(a, ';', false)).join('\r\n');
    const file = new Blob([result], { type: 'text/csv' });
    saveAs(file, 'addresses.csv');
  }

  public downloadKml() {
    const result = `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2">${this.addressService.validAddresses
      .map(this.toKmlPlacemark)
      .join('')}</kml>`;
    const file = new Blob([result], {
      type: 'application/vnd.google-earth.kml+xml;charset=utf-8'
    });
    saveAs(file, 'addresses.kml');
  }

  private getLine(entry: AddressCoordinateTableEntry, separator: string, usePipe: boolean) {
    return usePipe
      ? `${entry.address}${separator}${this.coordinateService.stringify(entry.wgs84, separator)}` //TODO fix
      : `${entry.address}${separator}${entry.wgs84?.lon}${separator}${entry.wgs84?.lat}`; //TODO fix
  }

  private toKmlPlacemark(entry: AddressCoordinateTableEntry) {
    return `<Placemark><Point><coordinates>${entry.wgs84?.lon},${entry.wgs84?.lat}</coordinates></Point></Placemark>`;
  }
}
