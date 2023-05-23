import { ColumnDefinitions, Coordinate, CoordinateSystem } from ".";

export interface AddressCoordinateTableEntry {
  id: string; // featureId of the GWR api feature if available and valid, otherwise arbitrary id
  address: string;

	[CoordinateSystem.WGS_84]: Coordinate | null;
	[CoordinateSystem.LV_95]: Coordinate | null;
	[CoordinateSystem.LV_03]: Coordinate | null;

  originalInput?: string;
  [ColumnDefinitions.EGID]?: string | null;
  [ColumnDefinitions.EGRID]?: string | null;
  [ColumnDefinitions.HEIGHT]?: string | null;

  isValid: boolean;
  warningTranslationKey?: string;
}

export interface AddressSelectionResult {
  result: AddressCoordinateTableEntry;
  updatedId: string | null;
}
