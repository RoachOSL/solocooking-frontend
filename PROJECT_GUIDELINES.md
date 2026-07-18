# Project guidelines

SoloCookingFrontend-specific guidance. Keep reusable engineering rules in
`AI_GUIDELINES.md`; keep domain and product decisions for this repository here.

## Backend contract

- Backend: Spring Boot, servlet path `/api`, local port 8080.
- Endpoints `/recipes` and `/ingredients` are paginated via
  `PageResponse{content, page{number, size, totalElements, totalPages}}`
  (mirrored in `src/shared/types/page.ts`).
- Dev CORS: Vite proxy `/api -> http://localhost:8080`. No CORS config on the
  backend. Production: reverse proxy serves the same path layout.

## OpenAPI codegen flow

- Spec snapshot committed as `openapi.json` in this repo:
  - `npm run spec:update` — pulls `http://localhost:8080/api/v3/api-docs`
    (backend must be running; note the `/api` servlet path).
  - `npm run generate` — Hey API reads the local snapshot; works offline.
  - Snapshot + generated output are committed, so PR diffs show contract
    changes and CI never needs a running Spring app.
- Until the first `spec:update` + `generate`, hand-written typed API modules
  matching the Hey API shape live in `features/*/api`.

## Decisions queued for later (with leaning)

| When | Decision | Leaning |
|---|---|---|
| Create-recipe form | form library | react-hook-form + zod (schema validation, free types) |
| Auth | token storage | httpOnly cookie > localStorage (XSS); interceptor ready |
| UI state pain | store | Zustand, smallest possible |
| Deploy | hosting | static hosting + reverse proxy `/api`; `VITE_API_URL` only if proxy stops sufficing |
| Errors | UX | route-level Error Boundaries + global Query error handler |
| i18n | PL/EN | undecided; do not hardcode-scatter strings in shared components |
