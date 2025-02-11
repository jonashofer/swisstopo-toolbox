import { AfterViewInit, Component, ElementRef, Input, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { AddressCoordinateTableEntry } from '../../models/AddressCoordinateTableEntry';
import { filter } from 'rxjs/operators';
import { DownloadService } from '../../services';
import { StorageService } from '../../services/storage.service';
import { MapInteractionService } from '../../services/map-interaction.service';
import { Geometry } from 'ol/geom';
import { MatDialog } from '@angular/material/dialog';
import { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import { Map } from 'maplibre-gl';

enum BackgroundLayers {
  Standard = 'basemap',
  Pixel = 'landeskarte',
  Satellite = 'satellite',
  Hybrid = 'hybrid'
}

const layerDict = {
  [BackgroundLayers.Standard]: 'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.basemap.vt/style.json',
  [BackgroundLayers.Hybrid]: 'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.imagerybasemap.vt/style.json',
  [BackgroundLayers.Satellite]: {
    version: 8,
    sources: {
      swissimage_wmts: {
        type: 'raster',
        tiles: ['https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg'],
        minzoom: 0,
        maxzoom: 20,
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'swissimage',
        type: 'raster',
        source: 'swissimage_wmts'
      }
    ]
  } as StyleSpecification,
  [BackgroundLayers.Pixel]: {
    version: 8,
    sources: {
      pixelkarte: {
        type: 'raster',
        tiles: ['https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg'],
        minzoom: 0,
        maxzoom: 20,
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'swissimage',
        type: 'raster',
        source: 'pixelkarte'
      }
    ]
  } as StyleSpecification
};

const svg = (hexFill: string, hexStroke: string) =>
  encodeURIComponent(`
<svg version="1.1" id="marker" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
	width="40" height="40" viewBox="0 0 256 256" xml:space="preserve">
	<style type="text/css">
		<![CDATA[
			.st0{fill:${hexFill};}
			.st1{fill:${hexStroke};}
		]]>
	</style>
	<path class="st1" d="M128.18,249.042c-4.252,0-8.151-2.365-10.114-6.137L64.648,140.331c-0.082-0.156-0.159-0.313-0.233-0.474
		C55.837,121.342,47.9,101.865,47.9,84.859c0-20.079,8.655-40.271,23.747-55.4c15.512-15.549,35.68-24.113,56.787-24.113
		c21.099,0,41.188,8.579,56.57,24.155c14.904,15.093,23.453,35.271,23.454,55.358c0,18.868-9.282,38.867-16.062,53.47l-0.707,1.526
		c-0.07,0.152-0.146,0.306-0.224,0.453l-53.159,102.574c-1.959,3.778-5.859,6.151-10.116,6.156
		C128.188,249.042,128.184,249.042,128.18,249.042z"/>
	<path class="st0" d="M128.052,16.75c-37.729,0-69.129,32.667-69.129,68.109c0,15.947,8.973,36.204,15.459,50.204l53.417,102.574
		l53.162-102.574c6.484-13.999,15.711-33.242,15.711-50.203C196.671,49.418,165.773,16.75,128.052,16.75z M127.025,113.857
		c-16.585,0-30.031-13.445-30.031-30.03s13.445-30.03,30.031-30.03c16.584,0,30.03,13.445,30.03,30.03
		S143.609,113.857,127.025,113.857z"/>
</svg>`);

const svgSrc = (hexFill: string, hexStroke: string) => `data:image/svg+xml;charset=utf-8,${svg(hexFill, hexStroke)}`;

// const iconStyle = new Style({
//   image: new Icon({
//     anchor: [0.5, 1],
//     src: svgSrc('#fa011c', '#ffffff')
//   })
// });

// const selectedIconStyle = new Style({
//   image: new Icon({
//     anchor: [0.5, 1],
//     src: svgSrc('#ffffff', '#fa011c')
//   })
// });

// const markerLayer = new VectorLayer({
//   style: iconStyle
// });

const storageKey = 'map-background';

@Component({
  selector: 'app-result-map',
  templateUrl: './result-map.component.html',
  styleUrls: ['./result-map.component.scss']
})
export class ResultMapComponent implements AfterViewInit {

  map: Map | null = null;
  _addresses: AddressCoordinateTableEntry[] = [];

  @Input()
  set addresses(value: AddressCoordinateTableEntry[]) {
    this._addresses = value.sort((a, b) => (b.wgs84?.lat || 0) - (a.wgs84?.lat || 0)); // sort addresses based on latitude
  }

  BackgroundLayers = BackgroundLayers;
  LayerDict = layerDict;
  currentLayer: BackgroundLayers = BackgroundLayers.Standard;

  lastHighlightedFeature: Feature<Geometry> | null = null;
  constructor(
    private readonly mapInteractionService: MapInteractionService,
    private readonly downloadService: DownloadService,
    private readonly dialog: MatDialog
  ) {
    this.currentLayer = StorageService.get<BackgroundLayers>(storageKey) || BackgroundLayers.Standard;

    this.mapInteractionService.tableToMap$.subscribe(x => this.hightlightFeature(x.id, x.end));
  }

  ngAfterViewInit() {
      this.registerMapPointerMove();
  }

  // fitView() {
  //   const extent = markerLayer.getSource()?.getExtent();
  //   if (extent == null) {
  //     return;
  //   }
  //   if (extent[0] == Infinity && extent[1] == Infinity) {
  //     view.setCenter([910000, 5910000]);
  //     view.setZoom(8);
  //   } else {
  //     view.fit(extent, {
  //       duration: 1000,
  //       padding: [70, 50, 50, 70],
  //       maxZoom: 15
  //     });
  //   }
  // }

  persistBackgroundLayer() {
    StorageService.save<BackgroundLayers>(storageKey, this.currentLayer);
  }

  openMapAdminDialog(templateRef: TemplateRef<any>) {
    const dialogRef = this.dialog.open(templateRef);

    dialogRef
      .afterClosed()
      .pipe(filter(r => r))
      .subscribe(_ => {
        this.downloadService.downloadKml();
        setTimeout(() => window.open('https://map.geo.admin.ch', '_blank'));
      });
  }

  private hightlightFeature(id: string, end: boolean) {
    // const feature = markerLayer
    //   .getSource()
    //   ?.getFeatures()
    //   .find(f => f.get('id') === id);
    // feature?.setStyle(end ? selectedIconStyle : iconStyle);
  }

  private registerMapPointerMove() {
    this.map?.on('pointermove', evt => {
      const features = this.map?.queryRenderedFeatures(evt.pixel);
			console.log(features)

      if (features == null) {
        return;
      }

      const isLeave =
        (features.length === 0 || features[0] !== this.lastHighlightedFeature) && this.lastHighlightedFeature != null;
      const isEnter = features.length > 0 && features[0] !== this.lastHighlightedFeature;
      const isSame = features.length > 0 && features[0] === this.lastHighlightedFeature;

      if (!isLeave && !isEnter && !isSame) {
        return;
      }

      if (isLeave) {
        this.mapInteractionService.sendToTable(this.lastHighlightedFeature?.get('id'), true);
        // this.lastHighlightedFeature?.setStyle(iconStyle);
        // this.map!.getTargetElement().style.cursor = '';
        this.lastHighlightedFeature = null;
        return;
      }
      if (isEnter) {
        const feature = features[0];
        this.lastHighlightedFeature = feature as Feature<Geometry>;
        // this.lastHighlightedFeature.setStyle(selectedIconStyle);
        // this.map!.getTargetElement().style.cursor = 'pointer';
        // this.mapInteractionService.sendToTable(feature.get('id'), false);
        return;
      }
    });
  }
}
