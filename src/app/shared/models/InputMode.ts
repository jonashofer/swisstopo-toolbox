export enum InputMode {
    None = 0,
    Address = 1 << 0,
    wgs84 = 1 << 1,
    lv95 = 1 << 2,
    lv03 = 1 << 3,
    Egid = 1 << 4,

    Coordinate = wgs84 | lv95 | lv03,
    All = Address | Coordinate | Egid
}