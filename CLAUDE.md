# redix-ui-starter

A Vite SPA starter that looks and works like Pylon. The UI comes from the `@koderi` shadcn
registry (`shared-ui`); this repo owns the app around it: routing, the API client, the example
pages and the mock.

## Commands

- `npm run dev` — Vite, with an in-memory API mock so the pages render with no backend.
- `npm run build` — type-check and build.
- `npm test` — Vitest, node environment, `*.test.ts` beside the file it tests.
- `npm run lint` — ESLint, zero warnings.
- `npm run format` / `npm run format:check` — Prettier.

## Layout

- `src/main.tsx` — the route tree (code routes) and the providers.
- `src/shell.tsx` — the app shell around every page; `src/nav.ts` and `src/header.tsx` feed it.
- `src/lib/api.ts` — the typed fetch client, `errorMessage` and `fieldErrors`.
- `src/features/` — one folder per feature: `dashboard`, `items` (list + detail), `settings`.
- `src/ui/` — installed from the registry. Do not edit by hand; update it with
  `npx shadcn add @koderi/<item> --overwrite`.
- `mock/mock-api.ts` — the in-memory API, loaded by `vite.config.ts` when `API_PROXY` is unset.

## Rules

- A `.tsx` file exports only components. Logic lives in a `.ts` with its test beside it.
- Point `API_PROXY` at a real API to replace the mock with a proxy (`/api` → the target).
- To pull a UI update: `npx shadcn add @koderi/<item> --overwrite`, then run the checks.

## Checking

`npm run build`, `npm test` and `npm run lint` (zero warnings), plus `npm run format:check`.
