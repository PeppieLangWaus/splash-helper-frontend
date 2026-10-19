# CLAUDE.md

React 19 + TypeScript + Vite. Web frontend for `../splash-helper-backend` (splasher.help).

## Commands

```bash
npm install
npm run dev        # vite dev server
npm run build       # tsc -b && vite build
npm run lint        # eslint .
npm run preview
```

## external-tools integration

- `src/components/ExplvMap.tsx` embeds `external-tools/Explv-s-map/` via `<ExplvMap>`; its base
  URL is set by a `VITE_EXPLV_MAP_URL`-style var in `.env.development`.
- `src/api/pathfinder.ts` calls `external-tools/osrs-pathfinder/`, which runs on port 3004.

See [../docs/architecture.md](../docs/architecture.md) for the full `external-tools/` picture.
