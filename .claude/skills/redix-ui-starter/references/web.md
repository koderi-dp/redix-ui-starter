# Web UI (`src`)

The UI is installed from the `@koderi` registry (`shared-ui`), so the shell, primitives, page
frames, charts and status all match Pylon. This repo adds the app around them.

## Structure

| File | Holds |
| --- | --- |
| `main.tsx` | Routes: `/` dashboard, `/items` (list, `$id` opens the detail), `/settings` |
| `shell.tsx` | The `AppShell` from the registry, with the app's nav, brand and header |
| `nav.ts` | The nav config and brand the shell and the command palette read |
| `header.tsx` | The status chip and the placeholder account menu |
| `lib/api.ts` | Typed client for every route, plus `errorMessage` and `fieldErrors` |
| `features/dashboard/dashboard.tsx` | KPI cards, a sample chart, recent items |
| `features/items/items.tsx` | The list, the create dialog, the delete confirm |
| `features/items/detail.tsx` | The detail frame with pause/resume and delete |
| `features/settings/settings.tsx` | The settings frame with a dirty-aware footer |
| `mock/mock-api.ts` | The in-memory API, loaded when `API_PROXY` is unset |

Imports from outside the feature use the `@/` alias; files in the same feature import each other
with `./`.

## Conventions

- Status text and colour come from the item's `status`; `ui/status-text.ts` maps the word to a
  tone. Do not derive status in a component.
- Dialogs send the form and show server errors on the matching fields through `fieldErrors`.
- Grid children that hold wide content need `min-w-0`, or the page scrolls sideways.

## Checking

`npm run build` type-checks and builds, `npm test` runs the Vitest unit tests, `npm run format`
runs Prettier and `npm run lint` runs ESLint. A `.tsx` file exports components only; logic lives
in a `.ts` beside it, and that is the file the unit test sits next to.
