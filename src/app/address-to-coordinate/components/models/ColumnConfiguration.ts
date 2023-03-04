// object to enable future expansion such as width, sorts etc.
export interface ColumnConfigItem {
  key: string;
}

// object to enable future support for multiple profiles
export interface ColumnConfig {
    columns: ColumnConfigItem[];
    key: string;
}

// hardcoded columns currently: trash, address, edit
export enum ColumnDefinitions {
  EGID = 'egid',
  EGRID = 'egrid',
  HEIGHT = 'height',
  WGS_84_lon = 'wgs84_lon',
  WGS_84_lat = 'wgs84_lat',
  LV_95_north = 'lv95_north',
  LV_95_east = 'lv95_east',
  LV_03_north = 'lv03_north',
  LV_03_east = 'lv03_east',
}
