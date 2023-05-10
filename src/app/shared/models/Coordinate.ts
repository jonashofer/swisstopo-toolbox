import { CoordinateSystem } from "./CoordinateSystem";

export interface Coordinate {
	/**Latitude / Northing */
  lat: number;

	/**Longtitude / Easting */
	lon: number;

  system: CoordinateSystem
}
