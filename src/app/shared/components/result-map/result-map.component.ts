import Map from 'ol/Map';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Feature, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
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
import { StorageService } from '../../services/storage.service';

enum BackgroundLayers {
  Standard = 'pixel_farbig',
  Satellite = 'satellite'
}

const layers = [
  new TileLayer({
    source: new XYZ({
      url: `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg`
    }),
    properties: { name: BackgroundLayers.Standard }
  }),
  new TileLayer({
    source: new XYZ({
      url: `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg`
    }),
    properties: { name: BackgroundLayers.Satellite }
  })
];

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

const storageKey = "map-background";

@Component({
  selector: 'app-result-map',
  templateUrl: './result-map.component.html',
  styleUrls: ['./result-map.component.scss']
})
export class ResultMapComponent implements AfterViewInit, OnDestroy {
  map: Map | null = null;
  _addresses: AddressCoordinateTableEntry[] = [];

  @Input()
  set addresses(value: AddressCoordinateTableEntry[]) {
    this._addresses = value.sort((a, b) => (b.wgs84?.lat || 0) - (a.wgs84?.lat || 0)); // sort addresses based on latitude
    const newFeatures = this._addresses.map(
      c =>
        new Feature({
          geometry: new Point(fromLonLat([c.wgs84?.lon!, c.wgs84?.lat!]))
        })
    );
    markerLayer.setSource(
      new VectorSource({
        features: newFeatures
      })
    );
    this.fitView();
  }

  @ViewChild('map')
  mapDiv: ElementRef | undefined;

	BackgroundLayers = BackgroundLayers;
	currentLayer: BackgroundLayers = BackgroundLayers.Standard;

  get kmlFunctionLink() {
    const coords: any = {};
    this._addresses.forEach((adr, index) => {
      coords[index] = `${adr.wgs84?.lon},${adr.wgs84?.lat}`;
    });
    return `${window.location.protocol}//${window.location.host}/.netlify/functions/kml?${new URLSearchParams(coords)}`;
  }

  get mapGeoAdminLink() {
    return `https://map.geo.admin.ch/?layers=KML%7C%7C${encodeURIComponent(this.kmlFunctionLink)}`;
  }

  constructor(private readonly downloadService: DownloadService, private readonly dialog: MatDialog) {
		this.currentLayer = StorageService.get<BackgroundLayers>(storageKey) || BackgroundLayers.Standard;
	}

  ngAfterViewInit() {
    if (this.mapDiv) {
      this.map = new Map({
        controls: [new FullScreen()],
        layers: this.getLayers(),
        view,
        target: this.mapDiv.nativeElement
      });
      this.fitView();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.setTarget(undefined);
    }
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

  changeBackground() {
    this.map?.setLayers(this.getLayers());
		StorageService.save<BackgroundLayers>(storageKey, this.currentLayer)
  }

	getLayers() {
		return [...layers.filter(l => l.getProperties().name == this.currentLayer), markerLayer];
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
