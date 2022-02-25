export enum CooridnateSystem {
	WGS_84 = 'wgs84',
	LV_95 = 'lv95',
	LV_03 = 'lv03'
}

export const CoordinateSystemNames = {
	[CooridnateSystem.WGS_84]: 'WGS 84 (GPS)',
	[CooridnateSystem.LV_95]: 'CH1903+ / LV95',
	[CooridnateSystem.LV_03]: 'CH1903 / LV03'
};
