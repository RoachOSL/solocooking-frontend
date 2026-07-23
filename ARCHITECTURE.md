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

- Never commit secrets: API keys, tokens, passwords, connection strings,
  private keys or any other credential. Not in source, not in config, not in
  tests, not in fixtures, not in committed docs — and never as a value in
  `.env` files that are tracked. Anything a build needs at runtime comes from
  the environment (`import.meta.env` for Vite, repository secrets for GitHub
  Actions), with only the variable **name** appearing in the repository.
- Anything shipped to the browser is public. A Vite `VITE_*` variable is
  inlined into the bundle at build time, so it may carry a public identifier
  or a URL, never a secret. A value that must stay secret belongs behind the
  backend, not in a frontend build.
- A credential that lands in a commit is compromised even after the commit is
  amended or the file deleted — Git history keeps it. Rotate it first, then
  clean up.

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
    theme/              # palettes, theme hook, toggles, ember canvas
```

- Something used by exactly one feature lives inside that feature. Move to
  `shared/` at the **second** consumer, not before (no premature abstraction).
- `app/` holds the shell only. A cross-cutting concern that grows to three or
  more files gets its own subfolder there rather than a `features/` entry with
  a barrel — theming is app-wide plumbing, not a domain with its own data.
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

State placement — put it where the decision is made:

- **State lives where the decision that reads it is made.** When two
  components need the same fact, lift it to their nearest common parent rather
  than duplicating it. State stranded below the component that must act on it
  cannot be acted on: a dialog's `busy` flag kept inside the form could gate
  the submit button but not the close paths owned by the parent `Dialog`, so
  Escape / X / backdrop closed the dialog while the mutation kept running.
- **Irreversible action (delete, payment) + an interruptible UI = ask what
  happens to the in-flight request when the user closes or navigates away
  mid-request.** The request does not cancel itself; decide deliberately
  whether to block the exit or let the operation finish.
- **While a request is in flight, every exit path must behave the same.**
  Either all of them are blocked, or the operation survives the close and
  reports its result somewhere that outlives the closed view (a toast, a
  page-level banner). A half-guarded set — submit disabled, Escape not — lets
  the user believe they cancelled an operation that still completes, and drops
  the error on the floor because its only render target unmounted.

Async mutation feedback — layers, then per-action choice:

Two layers sit under every write, and only above them do individual actions
differ. Do not reach for the fancy per-action pattern before the floor exists.

- **Floor (always): a request timeout and a place for the result to land.**
  The HTTP client carries a `timeout` so a stalled request settles as an error
  instead of hanging forever — without it, any UI gated on a mutation's pending
  state can lock permanently. Every mutation's success and failure must surface
  somewhere that outlives the component that triggered it. The canonical spot is
  the Query client's `MutationCache` (`onSuccess` / `onError`), which fires
  regardless of whether the triggering component is still mounted; a callback
  passed to `.mutate(vars, { onSuccess })` does **not** fire after its component
  unmounts, so it must never be the only path that reports an error.
- **Forms with server-side validation (create / edit): keep the form open
  until success.** The form does not close on submit; it closes only in the
  mutation's success path and renders the error inline on failure, so the typed
  input is never lost to a round trip that a unique-name or similar check can
  still reject. Closing on submit and reopening on error is a worse variant —
  it flickers and it is more code. Gate every close path while the request is
  in flight (see State placement above).
- **Instant, low-risk actions (delete, toggle, reorder): optimistic update.**
  The UI applies the change immediately against the Query cache, the request
  flies in the background, and the change is rolled back from a snapshot only
  if the server refuses (`onMutate` snapshots + writes, `onError` restores,
  `onSettled` invalidates). This is a **frontend-only** pattern — the backend
  receives the same request either way and stays the single source of truth;
  `onSettled` reconciles. Apply it selectively, where instant feedback pays and
  failure is rare — never blanket across every mutation, and not to creates
  (no server-assigned id yet) or to forms whose validation must stay in view.

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
- Page width is decided once, in `shared/components/PageSection.tsx`, and every
  page and the nav use it (`PageSection`, or `PAGE_CONTAINER` where the element
  is not a `<section>`). A page that sets its own `max-w-*` drifts from the
  header the day either side changes, and widening one screen silently makes
  the rest look narrow. Horizontal padding scales with the viewport
  (`px-4 sm:px-6`), never a single fixed value.
- Page width and line length are different problems: the container stays wide
  for grids, and prose caps itself on the element that holds it
  (`max-w-xl` on a paragraph). Do not narrow the page to fix a paragraph.
- Grids scale by breakpoint from one column up, so a card never relies on
  desktop width to stay readable
  (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
- A recurring visual element is defined once in `shared/components/ui/` and
  used from there — never assembled inline on a page and copied to the next
  one. Four hand-written copies of the same pill badge had already drifted on
  padding and weight before anyone noticed, and nothing could say which copy
  was correct. Reach for the primitive first; write the element inline only
  while it is genuinely single-use, and move it the moment a second page wants
  it.
- A control that must match an existing one references its styling rather than
  restating it (`FIELD_SHELL` in `ui/input.tsx`, shared by the text input and
  a native `<select>`). Two class lists that merely happen to agree today are
  not a relationship the next edit will respect.
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

Explicit boundaries — no behaviour arrives by inheritance or default:

- **One name, one meaning.** A token, prop, CSS class or type means the same
  thing everywhere it appears. When something needs a second meaning, it gets
  a second name. Overloading an existing name is how a change in one place
  surfaces somewhere nobody was looking.
- **Never repurpose a library's semantic slot.** shadcn's `--accent` is the
  neutral surface behind `outline` and `ghost` hovers, not a brand accent
  color. Painting it with the palette's decorative color turned every hover in
  the app green; the fix was a separate `--highlight` token that nothing
  hovers. The same applies to any borrowed vocabulary — adopt the library's
  meaning or pick your own name, never both.
- **Standalone over layered.** Where variants of a thing exist (palette/mode
  blocks, config profiles, environment overrides), each declares its full set
  rather than inheriting and patching another. Repetition is the price;
  the guarantee that no variant can leak into another is what it buys.
- **A shared default must fit every caller, or it is not shared.** A status
  code, error message or fallback that reads correctly at one call site and
  lies at another belongs at the call sites. Generic 409 copy fits "name
  taken" and misdescribes "still referenced".
- **Make divergence fail loudly.** When a rule spans several files, add the
  check that breaks the build when they drift (`palettes.test.ts` compares
  token names across every palette block). A convention nothing enforces is a
  convention that decays.
- Prefer explicit over implicit generally: pass the value rather than relying
  on a default, name the case rather than falling through to `else`.

Loading feedback — three jobs, three answers:

- **"Is anything happening?"** is one global answer, derived from the query
  layer (`useIsFetching` + `useIsMutating`), never wired per page. A new
  feature is covered the day it makes its first request.
- **"What is loading?"** is answered in place, by placeholders shaped like the
  content that is coming. Never more placeholders than the request can return.
- **"Are these results current?"** is answered by keeping the previous ones on
  screen and marking them stale, not by clearing the screen. Paginated and
  searched lists use `placeholderData: keepPreviousData`; a list that empties
  on every keystroke loses what the reader was reading.
- A loading state that can appear and vanish within a few frames must not
  appear at all: delay showing it, and once shown, hold it long enough to read.
- Placeholder counts are a layout question, so CSS answers them — render the
  full set and hide what does not fit each breakpoint. One fixed number cannot
  serve a phone and a desktop.

Known traps (do not do):

1. `useEffect` for data fetching — old-tutorial pattern, Query replaces it.
2. Copying server data into local state / Context.
3. Premature abstraction — extract to `shared/` at the second use.
4. Deep imports across features / barrels inside a feature.
5. Adding a component mega-library alongside shadcn.
6. Giving an existing name a second meaning instead of introducing a new one.

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
- Tests are colocated with the code they cover, in a `__tests__/` folder inside
  that module's own directory (`app/theme/__tests__/palettes.test.ts`) — the
  React and Vue layout. No mirrored tree: unlike Gradle nothing in the
  toolchain forces a split, and a test that lives beside its module moves and
  dies with it. The folder keeps source listings readable as a module grows.
- `src/test/` holds no tests — only the harness: Vitest setup and the MSW
  server and handlers. Playwright e2e gets a top-level `e2e/` when it lands,
  since those tests belong to no single module.
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
