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
  - `npm run spec:update` — pulls `http://localhost:8080/api/v3/api-docs`
    (backend must be running; note the `/api` servlet path).
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
  in `src/app/palettes.ts` is the single source of that rule — the inline
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
- `src/app/palettes.test.ts` compares the token names across the four blocks
  and fails when they diverge. Adding a token means adding it four times; the
  test is what makes that safe instead of a matter of memory.
- `index.html` applies the stored theme and palette in an inline script before
  first paint. Its storage keys and values must stay in sync with
  `src/app/useTheme.ts` and `src/app/palettes.ts`.
- Background embers are part of the palette (`EMBER_PRESETS`), not a user
  setting: fire over cast iron, mana over navy. Users only get an on/off
  toggle; `prefers-reduced-motion` disables them regardless.

## Decisions queued for later (with leaning)

| When               | Decision      | Leaning                                                                             |
| ------------------ | ------------- | ----------------------------------------------------------------------------------- |
| Create-recipe form | form library  | react-hook-form + zod (schema validation, free types)                               |
| Auth               | token storage | httpOnly cookie > localStorage (XSS); interceptor ready                             |
| UI state pain      | store         | Zustand, smallest possible                                                          |
| Deploy             | hosting       | static hosting + reverse proxy `/api`; `VITE_API_URL` only if proxy stops sufficing |
| Errors             | UX            | route-level Error Boundaries + global Query error handler                           |
| i18n               | PL/EN         | undecided; do not hardcode-scatter strings in shared components                     |
