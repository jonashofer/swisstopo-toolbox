export enum CoordinateSystem {
  WGS_84 = 'wgs84',
  LV_95 = 'lv95',
  LV_03 = 'lv03'
}

export const CoordinateSystemNames = {
  [CoordinateSystem.WGS_84]: 'WGS 84 (GPS)',
  [CoordinateSystem.LV_95]: 'CH1903+ / LV95',
  [CoordinateSystem.LV_03]: 'CH1903 / LV03'
};

export const CoordinateSystemSr = {
  [CoordinateSystem.WGS_84]: 4326,
  [CoordinateSystem.LV_95]: 2056,
  [CoordinateSystem.LV_03]: 21781
}
