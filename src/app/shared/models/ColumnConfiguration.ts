import { CoordinateSystem } from "./.";

export interface ColumnConfigItem {
  key: ColumnDefinitions;
  isSystemColumn: boolean;
  active: boolean;
}

export function userCol(definition: ColumnDefinitions): ColumnConfigItem {
  return { key: definition, isSystemColumn: false, active: true };
}

export function inactiveUserCol(definition: ColumnDefinitions): ColumnConfigItem {
  return { key: definition, isSystemColumn: false, active: false };
}

export function sysCol(definition: ColumnDefinitions): ColumnConfigItem {
  return { key: definition, isSystemColumn: true, active: true }; 
}

export enum ColumnDefinitions {
  EGID = 'egid',
  EGRID = 'egrid',
  HEIGHT = 'height',
	WGS_84 = 'wgs84',
	LV_95 = 'lv95',
	LV_03 = 'lv03',
  ADDRESS = 'address',
  EDIT = 'edit',
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
