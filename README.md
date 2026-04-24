# beat-vs

Scratch-style beat builder powered by the real Strudel runtime.

## What this prototype does

- React + TypeScript web app built with Vite
- drag blocks from a palette into a workspace
- snap blocks into ordered pattern lanes and modifier lanes
- nest beat blocks inside repeat containers
- compile the visual arrangement into real Strudel code
- play the generated Strudel code in the browser with the real `@strudel/web` runtime
- show transport controls for play, stop, and tempo
- keep playback, editor state, and persistence concerns separated for future sync work

## Stack

- React 19
- TypeScript
- Vite
- Zustand for editor state
- `@dnd-kit` for drag/drop and snapping
- `@strudel/web` for the actual Strudel runtime and browser playback

## Local setup

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

To create a production build:

```bash
npm run build
```

## How to use it

1. Press **Play** once to unlock browser audio and load Strudel's dirt samples.
2. Drag beat blocks from the palette into a track's **Pattern** lane.
3. Drag modifier blocks into the **Modifiers** lane.
4. Drag a **Repeat** block into the pattern lane, then drop beat blocks inside it.
5. Click blocks to edit them in the inspector.
6. Change the tempo slider to regenerate the Strudel code.
7. Watch the generated code in the code panel while you build.

When playback is already running, workspace edits automatically recompile and retrigger the current Strudel pattern.

## Architecture

The app is intentionally split into small modules so future collaboration or sync work can be added without rewriting the editor:

- `src/editor/*`
  - block/tree types
  - default block templates
  - immutable tree operations
  - visual-to-Strudel compiler
  - Zustand editor state
- `src/engine/*`
  - Strudel runtime setup and playback control only
- `src/sync/*`
  - persistence/sync boundary
  - currently implemented as localStorage draft persistence
- `src/components/*`
  - presentational UI for palette, workspace, inspector, transport, and code preview

This makes it straightforward to swap local persistence for a remote sync adapter later, such as Convex, without tightly coupling sync concerns to the editor or playback engine.

## Visual blocks -> Strudel mapping

The current compiler keeps the mapping intentionally simple and valid:

- sample blocks -> `bd`, `sd`, `hh`, etc. inside `s("...")`
- rest blocks -> `~`
- repeat blocks -> `[ ... ]*N`
- multiple tracks -> `stack(...)`
- gain block -> `.gain(value)`
- pan block -> `.pan(value)`
- fast block -> `.fast(value)`
- slow block -> `.slow(value)`
- tempo slider -> `setcpm(bpm / 4)` so the UI BPM matches Strudel's cycles-per-minute timing in 4/4

Example generated code:

```js
setcpm(120 / 4)
stack(
  s("bd hh sd hh [bd hh]*2").gain(0.95),
  s("~ ~ cp ~").gain(0.7).pan(0.35)
)
```

## Pragmatic implementation notes

- The UI uses explicit snap slots between blocks to make placement predictable in a prototype.
- Repeat blocks support nested beat sequences, but modifier nesting is track-level only for now.
- Playback uses the real Strudel runtime via `evaluate(...)`, not a mock engine.
- Audio still depends on a user gesture because browsers require a click before Web Audio can start.
- The production build currently emits a large bundle warning because Strudel ships substantial runtime code; this does not block local use of the prototype.
