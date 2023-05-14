import { CoordinateSystem } from "./CoordinateSystem";

// object to enable future expansion such as width, sorts etc.
export interface ColumnConfigItem {
  key: ColumnDefinitions;
  isSystemColumn: boolean;
}

export function userCol(definition: ColumnDefinitions): ColumnConfigItem {
  return { key: definition, isSystemColumn: false };
}

export function sysCol(definition: ColumnDefinitions): ColumnConfigItem {
  return { key: definition, isSystemColumn: true }; 
}

// hardcoded columns currently: trash, address, edit
export enum ColumnDefinitions {
  EGID = 'egid',
  EGRID = 'egrid',
  HEIGHT = 'height',
	WGS_84 = 'wgs84',
	LV_95 = 'lv95',
	LV_03 = 'lv03',

  // TRASH = 'trash',
  ADDRESS = 'address',
  EDIT_ADDRESS = 'edit-address',
  // COORDINATE_CHIPS = 'coordinate-chips',
}

export function getColumnDefinition(coordinateSystem: CoordinateSystem) {
  switch (coordinateSystem) {
    case CoordinateSystem.WGS_84:
      return ColumnDefinitions.WGS_84;
    case CoordinateSystem.LV_95:
      return ColumnDefinitions.LV_95;
    case CoordinateSystem.LV_03:
      return ColumnDefinitions.LV_03;
  }
}
