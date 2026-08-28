/** An OSRS world tile. `plane` defaults to 0 (ground floor) wherever it's optional below. */
export interface MapPosition {
  x: number;
  y: number;
  plane?: number;
}

/** A "dax path" — a walkable route, drawn on the map as a line through `positions`. Named
 *  after Explv's Map's own "Dax Path" tool, which builds these from itsdax's web-walker
 *  pathfinding API (see src/api/pathfinder.ts). */
export interface MapPath {
  positions: MapPosition[];
  /** CSS color. Default: Explv's Map's usual `#33b5e5` accent. */
  color?: string;
  weight?: number;
  opacity?: number;
}

/** A rectangular area between two corner tiles. */
export interface MapRectangle {
  start: MapPosition;
  end: MapPosition;
  /** CSS color. Default: Explv's Map's usual `#33b5e5` accent. */
  color?: string;
  fillOpacity?: number;
}
