# AI guidelines

Reusable engineering and workflow rules for this repository. Project-specific
domain and product decisions belong in `PROJECT_GUIDELINES.md`. Work log lives
in `WORK_NOTES.md`.

Before presenting or running any executable command, the AI assistant first
explains to the user what the command does and what effects it may have.

Commits and pushes are done only by the user. The assistant prepares and tests
changes, and may suggest branch names and commit messages, but never runs
`git commit` or `git push` itself.

Do not add AI attribution anywhere in the repository or its history — no
`Co-Authored-By: Claude` trailers, no "Generated with Claude Code" footers in
commits or PR descriptions.

When the user adds GitHub code review comments, the assistant reads and
discusses them with the user in the local console first. Agreed changes are
then applied locally, tested, and summarized. The assistant does not publish
GitHub comments unless explicitly asked.

When the assistant and the user agree on a reusable architectural or
engineering decision, add it to this file in the relevant section.

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

| State | Owner | Examples |
|---|---|---|
| Server / async | TanStack Query v5 | recipe list, recipe detail, auth user |
| Local / UI | `useState` + `useContext` | modal open, form inputs, filters |

- Server data is **cache**, not app state. Never copy query data into
  `useState`/Context/Redux.
- Never fetch with `useEffect` — that is what Query replaces.
- No Redux. Zustand only if shared UI state becomes painful to thread —
  a decision to make when the pain is real, not before.
- 2–3 levels of prop passing is normal; not a reason for global state.

API layer:

- Contract = the backend OpenAPI spec. No hand-written service classes
  long-term; generated client via Hey API (see `PROJECT_GUIDELINES.md` for the
  codegen flow).
- **axios over fetch** (decided 2026-07-18): single instance in
  `shared/lib/api/client.ts`. Request interceptor = the one place to attach
  the JWT once auth lands; response interceptor reserved for 401 refresh.
  Hey API uses the `@hey-api/client-axios` plugin so generated code shares
  the instance.
- Query key factories (`recipeKeys` pattern in `features/*/api`) until the
  generated TanStack Query options take over.

UI and styling — Tailwind v4 + shadcn/ui:

- Tailwind v4 via `@tailwindcss/vite`; theme tokens in `src/index.css`
  (`@theme inline`), no `tailwind.config.js`.
- shadcn/ui copies component source into `src/shared/components/ui` — we own
  it. No component-library lock-in, no breaking library migrations. Style
  `new-york`, base color `neutral`, aliases in `components.json` point at
  `@/shared/*`.
- Avoid mega component libraries (MUI/AntD): styling fights + upgrade
  lock-in are exactly what shadcn avoids.

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

## Test style

- Vitest + React Testing Library + MSW.
- MSW intercepts at the network level (axios rides XHR in jsdom), so tests
  exercise the real request path and survive internal refactors.
- `onUnhandledRequest: 'error'` — unmocked calls fail loudly.
- Priorities: hooks with logic > forms and validation > API hooks via MSW >
  critical flows. Skip snapshot/styling tests and dumb display components.
- Playwright e2e: later, 3–5 happy paths in CI only.
