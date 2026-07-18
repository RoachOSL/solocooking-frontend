# SoloCooking Frontend

React SPA for the SoloCooking recipe app. Talks to the Spring Boot backend
(`../solocooking`) through a generated OpenAPI client.

## Stack

React 19, Vite 8, TypeScript, TanStack Query v5, React Router v7 (library
mode), Tailwind CSS v4, shadcn/ui, axios, Vitest + React Testing Library +
MSW. Architecture rules live in `ARCHITECTURE.md`, project-specific facts in
`PROJECT_NOTES.md`.

## Requirements

- Node 24 (see `.nvmrc`; `nvm use` picks it up)
- Backend running on `http://localhost:8080` — only for live data and
  `npm run spec:update`; dev server, tests and build work without it

## Getting started

```bash
npm ci
npm run dev        # http://localhost:5173, /api proxied to :8080
```

## Scripts

| Script                 | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | dev server with HMR, `/api` proxy to the backend          |
| `npm run build`        | typecheck (`tsc -b`) + production build to `dist/`        |
| `npm test`             | Vitest run (MSW mocks HTTP — no backend needed)           |
| `npm run test:watch`   | Vitest in watch mode                                      |
| `npm run lint`         | ESLint (includes license header check)                    |
| `npm run format`       | Prettier write                                            |
| `npm run format:check` | Prettier check (CI)                                       |
| `npm run spec:update`  | refresh `openapi.json` from the live backend              |
| `npm run generate`     | generate the API client from the committed `openapi.json` |

## API codegen

The OpenAPI spec snapshot (`openapi.json`) is committed. `npm run generate`
(Hey API) writes the typed client to `src/shared/lib/api/__generated__` and
reuses the shared axios instance from `src/shared/lib/api/client.ts`, so
interceptors apply to generated calls. Refresh the snapshot with
`npm run spec:update` whenever the backend contract changes.

## Testing

Vitest + React Testing Library, HTTP mocked at the network level with MSW
(`src/test/msw`). Unmocked requests fail loudly. See `ARCHITECTURE.md` for
test priorities.
