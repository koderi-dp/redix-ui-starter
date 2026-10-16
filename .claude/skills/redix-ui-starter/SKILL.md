---
name: redix-ui-starter
description: How to change and verify the redix-ui-starter SPA (Vite + TanStack Router + TanStack Query, UI from the @koderi shadcn registry). Use for work on the example pages, the API client, the mock, or pulling a UI update from the registry.
---

# Working on redix-ui-starter

`CLAUDE.md` has the commands and the layout. This skill is the working knowledge on top of it.

## Where a change goes

| The request is about | Start in |
| --- | --- |
| A page, a route, a dialog | `src/features/` and `src/main.tsx` |
| The API client or its error handling | `src/lib/api.ts` (test beside it) |
| The mock API | `mock/mock-api.ts` |
| The shell, nav, header | `src/shell.tsx`, `src/nav.ts`, `src/header.tsx` |
| A UI component | `shared-ui` (the registry), then `npx shadcn add @koderi/<item> --overwrite` |

## Rules

- The UI in `src/ui/` is generated. Change it in `shared-ui`, rebuild the registry, and pull it
  here with `--overwrite`; do not edit the files in place.
- A `.tsx` file exports only components. Logic lives in a `.ts` with its test beside it.
- The mock and the real API speak the same 400 body: `{ title, detail, errors: [{ path, code, message }] }`.
  `errorMessage` and `fieldErrors` in `src/lib/api.ts` turn that into a toast and field errors.

## Checking

`npm run build`, `npm test`, `npm run lint` (zero warnings), `npm run format:check`. The mock is
exercised by running `npm run dev` and hitting `/api/items` and `/api/overview`.

## References

- [references/web.md](references/web.md): the page structure and the conventions it follows.
