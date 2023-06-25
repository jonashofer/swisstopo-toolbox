import { HttpClient } from "@angular/common/http";
import { Observable, map, of } from "rxjs";
import { AddressCoordinateTableEntry, CoordinateSystem, GWREntry, Coordinate } from "../models";
import { coords } from "../models/Coordinate";

// this class helps to build the correct chain of API calls to enrich the table entries with the desired columns

type APICall = {
  source: keyof AddressCoordinateTableEntry;
  targets: (keyof AddressCoordinateTableEntry)[];
  call: (entry: AddressCoordinateTableEntry, httpClient: HttpClient) => Observable<AddressCoordinateTableEntry>;
};

const calls = {
  gwr: {
    source: 'id',
    targets: ['egid', 'egrid'],
    call: (entry: AddressCoordinateTableEntry, httpClient: HttpClient) =>
      EnrichApiCalls.enrichBuildingInfo(entry, httpClient)
  } as APICall,

  height: {
    source: 'lv95',
    targets: ['height'],
    call: (entry: AddressCoordinateTableEntry, httpClient: HttpClient) => EnrichApiCalls.enrichHeight(entry, httpClient)
  } as APICall,

  wgs84tolv95: {
    source: 'wgs84',
    targets: ['lv95'],
    call: (entry: AddressCoordinateTableEntry, httpClient: HttpClient) =>
      EnrichApiCalls.enrichCoordinates(entry, CoordinateSystem.WGS_84, CoordinateSystem.LV_95, httpClient)
  } as APICall,

  wgs84tolv03: {
    source: 'wgs84',
    targets: ['lv03'],
    call: (entry: AddressCoordinateTableEntry, httpClient: HttpClient) =>
      EnrichApiCalls.enrichCoordinates(entry, CoordinateSystem.WGS_84, CoordinateSystem.LV_03, httpClient)
  } as APICall,

  lv95tolv03: {
    source: 'lv95',
    targets: ['lv03'],
    call: (entry: AddressCoordinateTableEntry, httpClient: HttpClient) =>
      EnrichApiCalls.enrichCoordinates(entry, CoordinateSystem.LV_95, CoordinateSystem.LV_03, httpClient)
  } as APICall,

  lv95towgs84: {
    source: 'lv95',
    targets: ['wgs84'],
    call: (entry: AddressCoordinateTableEntry, httpClient: HttpClient) =>
      EnrichApiCalls.enrichCoordinates(entry, CoordinateSystem.LV_95, CoordinateSystem.WGS_84, httpClient)
  } as APICall,

  lv03towgs84: {
    source: 'lv03',
    targets: ['wgs84'],
    call: (entry: AddressCoordinateTableEntry, httpClient: HttpClient) =>
      EnrichApiCalls.enrichCoordinates(entry, CoordinateSystem.LV_03, CoordinateSystem.WGS_84, httpClient)
  } as APICall,

  lv03tolv95: {
    source: 'lv03',
    targets: ['lv95'],
    call: (entry: AddressCoordinateTableEntry, httpClient: HttpClient) =>
      EnrichApiCalls.enrichCoordinates(entry, CoordinateSystem.LV_03, CoordinateSystem.LV_95, httpClient)
  } as APICall
};

// this function returns the correctly chained observables to enrich the TableEntry with the desired columns based on the currently present columns
export function getEnrichQueries(
  sourceColumns: (keyof AddressCoordinateTableEntry)[],
  targetColumns: (keyof AddressCoordinateTableEntry)[]
) {
  targetColumns = targetColumns.filter(c => !sourceColumns.includes(c));

  if (targetColumns.every(target => sourceColumns.includes(target))) {
    return [];
  }

  const apiCalls: APICall[] = [];
  const stillNeeds = (target: keyof AddressCoordinateTableEntry) =>
    !sourceColumns.includes(target) &&
    targetColumns.includes(target) &&
    !apiCalls.some(c => c.targets.includes(target));
  const isPresent = (target: keyof AddressCoordinateTableEntry) =>
    sourceColumns.includes(target) || apiCalls.some(c => c.targets.includes(target));
  const ensure = (target: keyof AddressCoordinateTableEntry) => {
    if (!isPresent(target)) {
      targetColumns.push(target);
    }
  };
  const addCall = (call: APICall) => {
    if (!isPresent(call.source)) {
      throw new Error('Cannot add call, source not present. Please chain correctly');
    } else {
      apiCalls.push(call);
    }
  };

  //ensure lv95 if height is needed, before handling coordinate calls
  if (stillNeeds('height')) {
    ensure('lv95');
  }

  if (stillNeeds('wgs84')) {
    if (isPresent('lv95')) {
      addCall(calls.lv95towgs84);
    } else if (isPresent('lv03')) {
      addCall(calls.lv03towgs84);
    } else {
      throw new Error('Currently, at least one coordinate system must be present');
    }
  }

  if (stillNeeds('lv95')) {
    if (isPresent('wgs84')) {
      addCall(calls.wgs84tolv95);
    } else if (isPresent('lv03')) {
      addCall(calls.lv03tolv95);
    } else {
      throw new Error('Currently, at least one coordinate system must be present');
    }
  }

  if (stillNeeds('lv03')) {
    if (isPresent('wgs84')) {
      addCall(calls.wgs84tolv03);
    } else if (isPresent('lv95')) {
      addCall(calls.lv95tolv03);
    } else {
      throw new Error('Currently, at least one coordinate system must be present');
    }
  }

  if (stillNeeds('height')) {
    //lv95 ensured above
    addCall(calls.height);
  }

  //TODO check if non-present egrid triggers this here
  if (stillNeeds('egid') || stillNeeds('egrid')) {
    addCall(calls.gwr);
  }

  if (apiCalls.length === 0) {
    throw new Error('Some targets are unachievable from the current sources with the provided API calls.');
  }

  return apiCalls.map(i => i.call);
}


function apiGwr(featureId: string, httpClient: HttpClient) {
  const request = `https://api.geo.admin.ch/rest/services/api/MapServer/ch.bfs.gebaeude_wohnungs_register/${featureId}?returnGeometry=false`;
  return httpClient.get<{feature: {attributes: GWREntry}}>(request);
}

function apiHeight(lv95_east: number, lv95_north: number, httpClient: HttpClient) {
  const request = `https://api.geo.admin.ch/rest/services/height?easting=${lv95_east}&northing=${lv95_north}`;
  return httpClient.get<{ height: string }>(request).pipe(map(r => +r.height));
}

function buildReframeApiMode(from: CoordinateSystem, to: CoordinateSystem): string {
  const dict = {
    [CoordinateSystem.WGS_84]: 'wgs84',
    [CoordinateSystem.LV_95]: 'lv95',
    [CoordinateSystem.LV_03]: 'lv03'
  };

  return `${dict[from]}to${dict[to]}`;
}

export function apiConvert(
  coordinate: Coordinate,
  targetSystem: CoordinateSystem,
  httpClient: HttpClient
): Observable<Coordinate> {
  if (coordinate.system == targetSystem || coordinate.system == null) {
    return of(coordinate);
  }
  const mode = buildReframeApiMode(coordinate.system, targetSystem);
  const request = `https://geodesy.geo.admin.ch/reframe/${mode}?northing=${encodeURIComponent(
    coordinate.lat
  )}&easting=${encodeURIComponent(coordinate.lon)}&format=json`;

  return httpClient.get<{ easting: string; northing: string }>(request).pipe(
    map(r => {
      return coords(+r.northing, +r.easting, targetSystem);
    })
  );
}

const EnrichApiCalls = {
  enrichBuildingInfo: (
    entry: AddressCoordinateTableEntry,
    httpClient: HttpClient
  ): Observable<AddressCoordinateTableEntry> => {
    return apiGwr(entry.id, httpClient).pipe(
      map(r => {
        entry.egid = r.feature.attributes.egid;
        entry.egrid = r.feature.attributes.egrid;
        return entry;
      })
    );
  },

  enrichHeight: (
    entry: AddressCoordinateTableEntry,
    httpClient: HttpClient
  ): Observable<AddressCoordinateTableEntry> => {
    return apiHeight(entry.lv95!.lon, entry.lv95!.lat, httpClient).pipe(
      map(r => {
        entry.height = r;
        return entry;
      })
    );
  },

  enrichCoordinates: (
    entry: AddressCoordinateTableEntry,
    sourceSystem: CoordinateSystem,
    targetSystem: CoordinateSystem,
    httpClient: HttpClient
  ): Observable<AddressCoordinateTableEntry> => {
    return apiConvert(entry[sourceSystem]!, targetSystem, httpClient).pipe(
      map(r => {
        entry[targetSystem] = r;
        return entry;
      })
    );
  }
};
