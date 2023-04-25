import { CooridnateSystem } from "./CoordinateSystem";

export interface Coordinate {
  lat: number; // northing
  lon: number; // easting

  system?: CooridnateSystem
}
