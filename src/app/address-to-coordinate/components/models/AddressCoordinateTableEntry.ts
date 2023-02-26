import { Coordinate } from './Coordinate';
import { CooridnateSystem } from './CoordinateSystem';

export interface AddressCoordinateTableEntry {
  id: number; // id of the api feature if isValid, otherwise arbitary negative number
  address: string;
  [CooridnateSystem.WGS_84]: Coordinate | null;
  [CooridnateSystem.LV_95]: Coordinate | null;
  [CooridnateSystem.LV_03]: Coordinate | null;
  isValid: boolean;
  featureId: string | null;
  egid?: string;
  egrid?: string;

}

export interface AddressSelectionResult {
  result: AddressCoordinateTableEntry;
  updatedId: number | null;
}
