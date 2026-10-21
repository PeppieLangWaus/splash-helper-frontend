export interface MapPosition {
  x: number;
  y: number;
  plane?: number;
}

export interface MapPath {
  positions: MapPosition[];

  color?: string;
  weight?: number;
  opacity?: number;
}

export interface MapRectangle {
  start: MapPosition;
  end: MapPosition;

  color?: string;
  fillOpacity?: number;
}
