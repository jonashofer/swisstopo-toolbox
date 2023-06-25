import { Coordinate } from ".";

export interface AddressCoordinateTableEntry {
  id: string; // featureId of the GWR api feature if available and valid, otherwise arbitrary id
  address?: string;

	wgs84?: Coordinate;
	lv95?: Coordinate;
	lv03?: Coordinate;

  originalInput?: string;
  egid?: string | null;
  egrid?: string | null;
  height?: number | null;

  isValid: boolean;
  warningTranslationKey?: string;
}

export interface AddressSelectionResult {
  result: AddressCoordinateTableEntry;
  updatedId: string | null;
}
