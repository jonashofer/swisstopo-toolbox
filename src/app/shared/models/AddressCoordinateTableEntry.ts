import { ColumnDefinitions } from './ColumnConfiguration';
import { Coordinate } from './Coordinate';
import { CoordinateSystem } from './CoordinateSystem';

export interface AddressCoordinateTableEntry {
  id: number; // id of the api feature if isValid, otherwise arbitary negative number
  address: string;
  [ColumnDefinitions.WGS_84_lon]: number | null;
  [ColumnDefinitions.WGS_84_lat]: number | null;

  featureId?: string;
  [ColumnDefinitions.EGID]?: string | null;
  [ColumnDefinitions.EGRID]?: string | null;
  [ColumnDefinitions.HEIGHT]?: string | null;
  [ColumnDefinitions.LV_95_north]?: number | null;
  [ColumnDefinitions.LV_95_east]?: number | null;
  [ColumnDefinitions.LV_03_north]?: number | null;
  [ColumnDefinitions.LV_03_east]?: number | null; 
  isValid: boolean;
}

export interface AddressSelectionResult {
  result: AddressCoordinateTableEntry;
  updatedId: number | null;
}
