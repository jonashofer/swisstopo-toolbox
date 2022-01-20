import { Injectable } from '@angular/core';
import saveAs from 'file-saver';
import { CoordinateService } from '.';
import { CoordinatePipe } from '../components/coordinate.pipe';
import { AddressCoordinateTableEntry } from '../components/models/AddressCoordinateTableEntry';
import { CooridnateSystem } from '../components/models/CoordinateSystem';
import { AddressService } from './address.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  constructor(
    private addressService: AddressService,
    private coordinateService: CoordinateService,
    private coordinatePipe: CoordinatePipe
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
    const system = this.coordinateService.currentSystem;
    const lat = usePipe ? this.coordinatePipe.transform(entry[system]?.lat, system) : entry[system]?.lat;
    const lon = usePipe ? this.coordinatePipe.transform(entry[system]?.lon, system) : entry[system]?.lon;

    //column order like in the table
    if (system == CooridnateSystem.WGS_84) {
      return [entry.address, lat, lon].join(separator);
    } else {
      return [entry.address, lon, lat].join(separator);
    }
  }

  private toKmlPlacemark(entry: AddressCoordinateTableEntry) {
    return `<Placemark><Point><coordinates>${entry.wgs84!.lon},${entry.wgs84!.lat}</coordinates></Point></Placemark>`;
  }
}
