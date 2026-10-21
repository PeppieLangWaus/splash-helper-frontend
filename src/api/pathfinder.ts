import type { MapPosition } from '../types/explvMap';

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

export async function findDaxPath(waypoints: MapPosition[]): Promise<MapPosition[]> {
  if (waypoints.length === 0) return [];

  const positions: MapPosition[] = [waypoints[0]];
  for (let i = 0; i < waypoints.length - 1; i++) {
    positions.push(...(await findPath(waypoints[i], waypoints[i + 1])));
  }

  return positions;
}
