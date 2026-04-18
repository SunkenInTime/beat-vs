# AGENTS.md

## Cursor Cloud specific instructions

This is a React + TypeScript + Vite web app — a Scratch-style beat builder powered by the Strudel runtime. See `README.md` for architecture overview and visual-blocks-to-Strudel mapping.

### Quick reference

| Task | Command |
|---|---|
| Install deps | `npm install` |
| Dev server | `npm run dev` (Vite, default port 5173) |
| Type check | `tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.node.json` |
| Production build | `npm run build` (runs type check then `vite build`) |
| Preview prod build | `npm run preview` |

- No lint or test scripts are configured yet. Type checking via `tsc --noEmit` is the only static analysis available.
- The production build emits a large chunk warning because `@strudel/web` ships substantial runtime code — this is expected and does not indicate a problem.
- Audio playback requires a user gesture (click "Play") before Web Audio can start in the browser.
- The app uses `localStorage` for draft persistence (`src/sync/persistence.ts`).
