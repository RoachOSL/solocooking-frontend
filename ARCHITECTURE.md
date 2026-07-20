# Architecture guidelines

Reusable engineering and architecture frontend rules for this repository.
Project-specific facts and decisions belong in `PROJECT_NOTES.md`. Agent
workflow rules live in `CLAUDE.md` / `AGENTS.md`. When a reusable
architectural or engineering decision is agreed, add it here in the relevant
section.

## Repository hygiene

- Do not add AI attribution anywhere in the repository or its Git history.
  Do not add AI co-author trailers, generation footers, or similar attribution
  to commits, pull requests, source files, or documentation.

## Architecture

Repository structure — feature-based colocation:

```
src/
  features/
    recipes/
      components/   # feature-private UI
      hooks/        # feature-private hooks
      api/          # API calls + query key factories for this feature
      types.ts      # mirrors backend DTOs (until generated types take over)
      index.ts      # PUBLIC BARREL — the only import surface for other code
    ingredients/
  shared/
    components/ui/  # shadcn/ui primitives (owned source)
    lib/
      api/
        __generated__/  # Hey API output (committed)
        client.ts       # single axios instance + interceptors
      utils.ts          # cn()
    types/              # cross-feature contract types (PageResponse)
  app/                  # composition root: App, routes, providers, main
```

- Something used by exactly one feature lives inside that feature. Move to
  `shared/` at the **second** consumer, not before (no premature abstraction).
- Never deep-import across features — only through the feature `index.ts`.
  Same philosophy as the backend's package-private modules + facades.
- Barrels are the feature's public API only; inside a feature import files
  directly (avoids circular imports).
- Alias `@` -> `src` (vite + tsconfig `paths`; no `baseUrl` — deprecated in
  TS 6).

State management — server state vs UI state:

| State          | Owner                     | Examples                              |
| -------------- | ------------------------- | ------------------------------------- |
| Server / async | TanStack Query v5         | recipe list, recipe detail, auth user |
| Local / UI     | `useState` + `useContext` | modal open, form inputs, filters      |

- Server data is **cache**, not app state. Never copy query data into
  `useState`/Context/Redux.
- Never fetch with `useEffect` — that is what Query replaces.
- No Redux. Zustand only if shared UI state becomes painful to thread —
  a decision to make when the pain is real, not before.
- 2–3 levels of prop passing is normal; not a reason for global state.

API layer:

- Contract = the backend OpenAPI spec. No hand-written service classes
  long-term; generated client via Hey API (see `PROJECT_NOTES.md` for the
  codegen flow).
- **axios over fetch** (decided 2026-07-18): single instance in
  `shared/lib/api/client.ts`. Request interceptor = the one place to attach
  the JWT once auth lands; response interceptor reserved for 401 refresh.
  Hey API uses the `@hey-api/client-axios` plugin so generated code shares
  the instance.
- Query keys and query options come from the generated
  `@tanstack/react-query.gen` output; feature hooks wrap them
  (`useQuery(getRecipesOptions(...))`). No hand-written query key factories.
- The generated client must use a **relative** `baseURL` (`/api`). The spec's
  server URL is relative already; `shared/lib/api/hey-api.ts` additionally
  pins it, because an absolute URL would bypass the Vite dev proxy and MSW's
  relative path matching.

UI and styling — Tailwind v4 + shadcn/ui:

- Tailwind v4 via `@tailwindcss/vite`; theme tokens in `src/index.css`
  (`@theme inline`), no `tailwind.config.js`.
- shadcn/ui copies component source into `src/shared/components/ui` — we own
  it. No component-library lock-in, no breaking library migrations. Style
  `new-york`, base color `neutral`, aliases in `components.json` point at
  `@/shared/*`.
- Avoid mega component libraries (MUI/AntD): styling fights + upgrade
  lock-in are exactly what shadcn avoids.
- Every page must be responsive (RWD): mobile-first layout with flex/grid and
  relative units, no fixed pixel widths for layout, wrapping instead of
  overflow (`flex-wrap`). Verify down to ~320 px viewport width.
- Theme colors live exclusively in the design tokens in `src/index.css`
  (`:root` + `.dark`); components reference tokens (`bg-primary`,
  `text-muted-foreground`), never raw color values.

Routing — React Router v7, library mode:

- `react-router` package, `createBrowserRouter` in `app/routes.tsx`, layout
  route in `app/App.tsx`.
- Routes are centralized on purpose: a future migration to TanStack Router
  (if typed search params become a real pain) stays cheap.
- No SSR/Next.js: app sits behind a login eventually, no SEO need. Vite SPA
  is the right weight.

Known traps (do not do):

1. `useEffect` for data fetching — old-tutorial pattern, Query replaces it.
2. Copying server data into local state / Context.
3. Premature abstraction — extract to `shared/` at the second use.
4. Deep imports across features / barrels inside a feature.
5. Adding a component mega-library alongside shadcn.

## Code style

- Use descriptive variable and component names that clearly communicate
  meaning and purpose.
- After code changes, run lint and formatting (`npm run lint`, Prettier) and
  fix findings before presenting the change.
- Keep components dumb where possible: data fetching lives in hooks, HTTP in
  `api/` modules — a component should not know about axios.
- Single responsibility (SRP): one component/hook/module does one thing.
  Split a component when it accumulates a second concern (fetching + layout,
  form + list), not when it merely gets long.
- Comments are the exception, not the norm. Write one only when it states a
  non-obvious constraint or reason the code itself cannot show (for example:
  why a no-op interceptor exists, that a type mirrors a backend DTO, why a
  lint rule is disabled for a path). Never narrate what the next line does,
  restate a rule already documented in these md files, or leave tool/template
  boilerplate links. Short section labels in config files (`# Test output` in
  `.gitignore`) are fine.

## Test style

- Vitest + React Testing Library + MSW.
- MSW intercepts at the network level (axios rides XHR in jsdom), so tests
  exercise the real request path and survive internal refactors.
- `onUnhandledRequest: 'error'` — unmocked calls fail loudly.
- Priorities: hooks with logic > forms and validation > API hooks via MSW >
  critical flows. Skip snapshot/styling tests and dumb display components.
- Playwright e2e: later, 3–5 happy paths in CI only.
- No unit/integration split on the frontend (unlike the backend's Gradle
  `test` vs `integrationTest`). Following the Testing Trophy, the
  Vitest/RTL/MSW suite already _is_ the integration layer — it drives the real
  request path through mocked HTTP in one fast run. Split into a separate CI
  job only when Playwright e2e lands.

## CI and quality gates

- Every owned source file carries a proprietary copyright header, enforced in
  CI and autofixable locally (ESLint `license-header/header`). Generated output
  is excluded. This is the frontend equivalent of the backend's Spotless
  `licenseHeader`; concrete header text and exclusions live in
  `PROJECT_NOTES.md`.
- CI runs on every PR and on push to `main`. Fast checks (format, lint) and the
  test suite run as **parallel jobs**; the build job gates on both. Each job
  pays its own checkout + dependency install, so parallelize independent checks
  rather than chaining every step — chain only true dependencies (build needs
  green checks first).
- Use a `concurrency` group per ref with `cancel-in-progress: true` so a newer
  push on the same branch cancels the in-flight run for the older commit.
  Different branches keep separate runs; this only stops wasted work on
  superseded commits and stale results.
- Pin **all** GitHub Actions — official `actions/*` included — to a full
  commit SHA with a version comment, never a mutable tag
  (`uses: actions/checkout@<full-sha> # v5.0.1`). A tag is a movable pointer:
  the action owner can repoint it and the workflow silently starts executing
  different code with access to the repo token (supply-chain vector).
  Upgrading an action = consciously bumping the SHA in a reviewed diff.
- CI never needs a running backend: the OpenAPI snapshot and generated client
  are committed, and tests mock HTTP with MSW.
