# Project notes

SoloCookingFrontend-specific facts and decisions. Keep reusable engineering
and architecture rules in `ARCHITECTURE.md`; keep decisions specific to this
repository here.

## Backend contract

- Backend: Spring Boot, servlet path `/api`, local port 8080.
- Endpoints `/recipes` and `/ingredients` are paginated via
  `PageResponse{content, page{number, size, totalElements, totalPages}}`
  (generated `PageResponse*Dto` types).
- Dev CORS: Vite proxy `/api -> http://localhost:8080`. No CORS config on the
  backend. Production: reverse proxy serves the same path layout.

## OpenAPI codegen flow

- Spec snapshot committed as `openapi.json` in this repo:
  - `npm run spec:update` — pulls
    `http://localhost:8080/api/v3/api-docs/soloprogramming` (backend must be
    running; note the `/api` servlet path and the grouped-spec suffix — the
    bare `/v3/api-docs` path serves a different document).
  - Spring returns minified JSON, so run `npm run format` straight after:
    the snapshot is committed Prettier-formatted, which is what keeps contract
    diffs readable.
  - `npm run generate` — Hey API reads the local snapshot; works offline.
  - Snapshot + generated output are committed, so PR diffs show contract
    changes and CI never needs a running Spring app.
- Features consume the generated TanStack Query options directly; there are
  no hand-written API modules.
- Backend DTO schemas mark response fields as `required` and declare explicit
  `operationId`s (`createRecipe`, `deleteRecipe`, ...), so generated types are
  non-optional and generated names are stable — no defensive guards in the UI
  for fields the contract guarantees.

## CI / licensing

- Proprietary `LICENSE` (same text as backend). Every owned `src/**/*.{ts,tsx}`
  file carries a copyright header enforced by ESLint
  (`eslint-plugin-license-header`, rule `license-header/header`, autofixable
  with `eslint --fix`). Generated API output under
  `src/shared/lib/api/__generated__` is excluded. Frontend equivalent of the
  backend's Spotless `licenseHeader`.
- GitHub Actions `.github/workflows/ci.yml`: `code-quality`
  (`format:check` + `lint`) and `tests` (`test:ci`) run in parallel, `build`
  gates on both. `concurrency` cancels superseded runs. No unit/integration
  split — on the frontend the Vitest+RTL+MSW suite is already the integration
  layer (Testing Trophy); a separate job is added only when Playwright e2e
  lands.
- `test:ci` writes `test-results/junit.xml` (gitignored); the `tests` job
  publishes it via `dorny/test-reporter` (`reporter: jest-junit`, Vitest's
  junit output is jest-compatible). Third-party actions are pinned to a full
  commit SHA with a version comment, never a mutable tag.

## Theming

- Two palettes ship long-term: `ember` (cast iron, flame orange) and
  `soloCookingSystem` (navy, neon blue). `ember` has light and dark;
  `soloCookingSystem` is dark only — its neon reads as ordinary blue on white.
  Three looks to keep, not four.
- Palette and theme are therefore paired, not independent: the pot forces dark
  on the way in, and switching to light drops back to `ember`. `PALETTE_MODES`
  in `src/app/theme/palettes.ts` is the single source of that rule — the inline
  script, `App`, and both test files read it rather than restating it.
  Coordination lives in `App`; components stay dumb and never branch on the
  palette.
- `ember` is the product identity; `soloCookingSystem` is a skin. Anything that cannot be
  expressed as a token — illustrations, logo, screenshots, marketing — targets
  `ember` only, so the second palette costs minutes rather than days.
  Red line: the first time a component needs `if (palette === ...)` or a
  per-palette asset, the skin has stopped being free and one palette is cut.
- There is no palette picker. `soloCookingSystem` is reached only by clicking the pot in
  the header, which flashes COOK! across the screen; clicking it again returns
  to `ember`. Theming is not a setting users are asked to manage — the choice
  on offer is light/dark, and that is all.
- Identifiers stay generic on purpose: palette values, token names, component
  and file names carry no game vocabulary, and never name the franchise that
  seeded the idea. The palette is "System", the easter egg is "COOK!", ranks
  are difficulty ranks. Renaming a palette value means touching CSS, the inline
  script and both test files, so the cost of a themed identifier is real.
- User-facing copy is the exception: light RPG flavour is wanted there, and
  "Daily quest", "+50 XP" and "Chef Lv. 3" on the home page are deliberate
  seasoning, not leftovers. Keep it to generic progression vocabulary — level,
  quest, XP, rank, streak — never a name or phrase lifted from a specific
  work.
- The palette lives in `data-palette` on `<html>`, the mode in the `.dark`
  class. All four blocks in `src/index.css` are standalone and declare the full
  token set — none inherits from or overrides another. The earlier layered
  setup (default palette in `:root`/`.dark`, the other in classes on top) let a
  light-mode block outrank a dark-mode one on equal specificity and silently
  shipped a light card shadow in dark mode.
- `src/app/theme/__tests__/palettes.test.ts` compares the token names across the four blocks
  and fails when they diverge. Adding a token means adding it four times; the
  test is what makes that safe instead of a matter of memory.
- `index.html` applies the stored theme and palette in an inline script before
  first paint. Its storage keys and values must stay in sync with
  `src/app/theme/useTheme.ts` and `src/app/theme/palettes.ts`.
- Background embers are part of the palette (`EMBER_PRESETS`), not a user
  setting: fire over cast iron, mana over navy. Users only get an on/off
  toggle; `prefers-reduced-motion` disables them regardless.

## UI work

- New UI or a visual reshape of existing UI starts with the
  `frontend-design` skill, before writing markup. It covers aesthetic
  direction, typography and spacing choices, and keeps output from settling
  into templated defaults — which matters here because the look is the
  product identity, not a wrapper around the API.
- Applies to visual work only. Plumbing changes — codegen refresh, query
  wiring, routing, tests — skip it.
- Skill guidance never outranks this file: the palette rules under _Theming_
  win when the two disagree.

## Palette changes need approval

- Nobody edits a palette value without the owner agreeing to it first. This
  covers every color token in `src/index.css` — `--background`, `--card`,
  `--muted`, `--border`, `--primary`, `--accent`, `--highlight`, the flash
  gradient, the card shadow — in any palette or mode. The palette is the
  product identity, not a variable to tune while fixing something else.
- Design feedback about contrast or hierarchy is a reason to **propose** a
  change, never to make one. Feedback like "too many similar browns" gets a
  proposal, not a commit.
- A proposal states, per token: current value, proposed value, what visibly
  changes, and which screens it touches. Palette tokens are global — one value
  moves every page at once, so "it looked better on this screen" is not a
  justification on its own.
- Layout, spacing, typography, and which token an element references are
  ordinary work and need no approval. Changing what a token _is_ does.
  Swapping `bg-muted` for `bg-card` on one element: fine. Changing what
  `--muted` means: ask.

## Loading feedback

- `src/app/GlobalLoadingBar.tsx` sits on the header's bottom border and is the
  app's only global "working" signal. It shows after 250 ms and stays at least
  400 ms. Colour comes from `--primary`, so all three looks are covered with no
  branching on the palette; the sweep is `.loading-sweep` in `src/index.css`.
- `shared/components/ui/skeleton.tsx` is the placeholder primitive. The
  ingredient catalog uses it via `CatalogSkeleton`, which shares `CARD_GRID`
  with the real list and hides placeholders past each breakpoint's screenful
  (6 / 8 / 12 / 24). `SKELETON_COUNT` is `PAGE_SIZE`, never a literal.
- Ingredient list and search hold previous results (`KEEP_LIST_ON_SCREEN` in
  `hooks/useIngredients.ts`) and dim to 60% while stale. The skeleton is then
  reached only on a genuine first load. Covered by "keeps the previous results
  on screen while the next search loads" — removing `keepPreviousData` has no
  other visible symptom.
- The home page shows no bar because it issues no requests: everything below
  its hero is still mocked.

## Decisions queued for later (with leaning)

| When               | Decision      | Leaning                                                                             |
| ------------------ | ------------- | ----------------------------------------------------------------------------------- |
| Create-recipe form | form library  | react-hook-form + zod (schema validation, free types)                               |
| Auth               | token storage | httpOnly cookie > localStorage (XSS); interceptor ready                             |
| UI state pain      | store         | Zustand, smallest possible                                                          |
| Deploy             | hosting       | static hosting + reverse proxy `/api`; `VITE_API_URL` only if proxy stops sufficing |
| Errors             | UX            | route-level Error Boundaries + global Query error handler                           |
| i18n               | PL/EN         | undecided; do not hardcode-scatter strings in shared components                     |
