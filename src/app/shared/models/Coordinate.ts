import { CoordinateSystem } from '.';

export interface Coordinate {
  /**Latitude / Northing */
  lat: number;

  /**Longtitude / Easting */
  lon: number;

  system: CoordinateSystem;
}

export function coords(lat: number, lon: number, system: CoordinateSystem): Coordinate {
  switch (system) {
    case CoordinateSystem.LV_03:
    case CoordinateSystem.LV_95:
      return { lat: parseFloat(lat.toFixed(2)), lon: parseFloat(lon.toFixed(2)), system };
    case CoordinateSystem.WGS_84:
      return { lat: parseFloat(lat.toFixed(4)), lon: parseFloat(lon.toFixed(4)), system };
  }
}
