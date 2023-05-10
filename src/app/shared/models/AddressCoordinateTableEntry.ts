import { ColumnDefinitions } from './ColumnConfiguration';
import { Coordinate } from './Coordinate';
import { CoordinateSystem } from './CoordinateSystem';

export interface AddressCoordinateTableEntry {
  id: string; // id of the api feature if isValid, otherwise arbitary negative number
  address: string;

	[CoordinateSystem.WGS_84]: Coordinate | null;
	[CoordinateSystem.LV_95]: Coordinate | null;
	[CoordinateSystem.LV_03]: Coordinate | null;

  originalInput?: string;

  featureId?: string;
  [ColumnDefinitions.EGID]?: string | null;
  [ColumnDefinitions.EGRID]?: string | null;
  [ColumnDefinitions.HEIGHT]?: string | null;

  isValid: boolean;
}

export interface AddressSelectionResult {
  result: AddressCoordinateTableEntry;
  updatedId: string | null;
}
