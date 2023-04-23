import Map from 'ol/Map';
import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { Feature, View } from 'ol';
import { Group, Tile as TileLayer } from 'ol/layer';
import { XYZ } from 'ol/source';
import { FullScreen } from 'ol/control';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Point from 'ol/geom/Point';
import { fromLonLat, transformExtent } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { filter } from 'rxjs/operators';
import { DownloadService } from '../../services';

const mapLayer = new TileLayer({
  source: new XYZ({
    url: `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg`
  })
});

const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg`
  })
});

const markerLayer = new VectorLayer({
  style: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'https://map.geo.admin.ch/f13b978/img/marker.png'
    })
  })
});

const view = new View({
  projection: 'EPSG:3857',
  maxZoom: 20,
  constrainOnlyCenter: true,
  minZoom: 7.5,
  extent: transformExtent([5.6, 48, 11, 45], 'EPSG:4326', 'EPSG:3857'),
  enableRotation: false
});

@Component({
  selector: 'app-result-map',
  templateUrl: './result-map.component.html',
  styleUrls: ['./result-map.component.scss']
})
export class ResultMapComponent implements OnInit {
  map: Map | null = null;
  _addresses: AddressCoordinateTableEntry[] = [];

  @Input()
  set addresses(value: AddressCoordinateTableEntry[]) {
    this._addresses = value;
    const newFeatures = value.map(
      c =>
        new Feature({
          geometry: new Point(fromLonLat([c.wgs84_lon!, c.wgs84_lat!]))
        })
    );
    markerLayer.setSource(
      new VectorSource({
        features: newFeatures
      })
    );
    this.fitView();
  }

  get kmlFunctionLink() {
    const coords: any = {};
    this._addresses.forEach((adr, index) => {
      coords[index] = `${adr.wgs84_lon},${adr.wgs84_lat}`;
    });
    return `${window.location.protocol}//${window.location.host}/.netlify/functions/kml?${new URLSearchParams(coords)}`;
  }

  get mapGeoAdminLink() {
    return `https://map.geo.admin.ch/?layers=KML%7C%7C${encodeURIComponent(this.kmlFunctionLink)}`;
  }

  constructor(private readonly downloadService: DownloadService, private readonly dialog: MatDialog) {}

  ngOnInit(): void {
    this.map = new Map({
      controls: [new FullScreen()],
      layers: [mapLayer, markerLayer],
      view,
      target: 'map'
    });
    this.fitView();
  }

  fitView() {
    const extent = markerLayer.getSource()?.getExtent();
    if (extent == null) {
      return;
    }
    if (extent[0] == Infinity && extent[1] == Infinity) {
      view.setCenter([910000, 5910000]);
      view.setZoom(8);
    } else {
      view.fit(extent, {
        duration: 1000,
        padding: [70, 50, 50, 70],
        maxZoom: 15
      });
    }
  }

  switchToMapBackground() {
    this.map?.setLayerGroup(new Group({ layers: [mapLayer, markerLayer] }));
  }

  switchToSatelliteBackground() {
    this.map?.setLayerGroup(new Group({ layers: [satelliteLayer, markerLayer] }));
  }

  openMapAdminDialog(templateRef: TemplateRef<any>) {
    const dialogRef = this.dialog.open(templateRef);

    dialogRef
      .afterClosed()
      .pipe(filter(r => r))
      .subscribe(_ => {
        this.downloadService.downloadKml();
        window.open('https://map.geo.admin.ch', '_blank');
      });
  }
}
