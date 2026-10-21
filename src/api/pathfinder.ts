import type { MapPosition } from '../types/explvMap';

/** Base URL of an itsdax-compatible web-walker pathfinding API — the same one Explv's Map's
 *  own "Dax Path" tool calls (its `js/dax_walker/dax_walker.js`, hardcoded there to the public
 *  https://osrspathfinder.com/find-path). Defaults to a local instance
 *  (https://github.com/dQw4w9WgXcQ/osrs-pathfinder), which runs on :3004. */
const BASE = (import.meta.env.VITE_PATHFINDER_URL as string | undefined) || 'http://localhost:3004';

interface PathfinderStep {
  type: 'WALK' | 'LINK';
  plane: number;
  path?: { x: number; y: number }[];
  link?: { start: MapPosition; end: MapPosition };
}

interface PathfinderResponse {
  result: {
    type: 'SUCCESS' | 'BLOCKED' | 'UNREACHABLE' | 'UNKNOWN';
    steps: PathfinderStep[];
  };
}

// Flattens the response's steps (alternating WALK tile-runs and LINK jumps such as
// doors/stairs/ships/teleports) into a single ordered list of positions. Mirrors
// Explv-s-map's js/dax_walker/dax_walker.js so the two stay visually consistent.
function flattenSteps(steps: PathfinderStep[]): MapPosition[] {
  const positions: MapPosition[] = [];

  for (const step of steps) {
    if (step.type === 'WALK') {
      for (const point of step.path ?? []) {
        positions.push({ x: point.x, y: point.y, plane: step.plane });
      }
    } else if (step.type === 'LINK' && step.link) {
      positions.push(step.link.end);
    }
  }

  return positions;
}

/** Fetches a walkable route between two tiles from the pathfinder API. Throws if the API is
 *  unreachable or reports the tile as blocked/unreachable. */
export async function findPath(start: MapPosition, end: MapPosition): Promise<MapPosition[]> {
  const res = await fetch(`${BASE}/find-path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      start: { x: start.x, y: start.y, plane: start.plane ?? 0 },
      end: { x: end.x, y: end.y, plane: end.plane ?? 0 },
      algo: 'A_STAR',
    }),
  });

  if (!res.ok) throw new Error('No response from pathfinder server');

  const data = (await res.json()) as PathfinderResponse;
  if (data.result.type !== 'SUCCESS') throw new Error(`Pathfinder returned ${data.result.type}`);

  return flattenSteps(data.result.steps);
}

/** Fetches a "dax path" through an ordered list of waypoints — a route from the 1st to 2nd,
 *  then 2nd to 3rd, and so on, concatenated into one continuous route. Ready to hand straight
 *  to `<ExplvMap paths={[{ positions: await findDaxPath(waypoints) }]} />`. */
export async function findDaxPath(waypoints: MapPosition[]): Promise<MapPosition[]> {
  if (waypoints.length === 0) return [];

  const positions: MapPosition[] = [waypoints[0]];
  for (let i = 0; i < waypoints.length - 1; i++) {
    positions.push(...(await findPath(waypoints[i], waypoints[i + 1])));
  }

  return positions;
}
