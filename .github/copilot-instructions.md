# Copilot Instructions – cms-english Admin

## Mission Context
- Internal admin CMS built with Vite + React, TypeScript, MUI, Tailwind v4, TanStack Query.
- Communicates with NestJS backend (`english-learning`) using Axios instance in `src/config/axiosConfig.ts`.

## Core Workflows
- Env setup: create `.env` with `VITE_API_URL=http://localhost:3000/api`.
- Install & run: `npm install`, `npm run dev`.
- QA checklist: `npm run lint`, `npm run build`, `npm run preview` before PRs.

## Architecture Patterns
- Routing in `src/routes/`; pages in `src/pages/` grouped by feature (dashboard, course, schedule, etc.).
- Feature components live under `src/components/<feature>/`. UI primitives in `src/components/ui/` combine MUI + Tailwind utilities.
- API clients under `src/apis/` organized by resource (`course.api.ts`, `student.api.ts`). Types/interfaces colocated in `src/interface/`.
- Global state contexts in `src/context/`; shared hooks in `src/hooks/`.

## Auth & Networking
- Axios config attaches bearer token from `localStorage.cms_auth`. 401 triggers token removal and routes to `/login` (see `axiosConfig.ts`).
- Maintain consistent response parsing using backend `ResponseMessage` envelope (`data.data`).
- When adding protected routes, ensure login guard checks presence of `cms_auth` token.

## Styling & UI
- Prefer MUI components styled via `sx` + Tailwind classes. Keep theme tokens centralized in `src/styles/`.
- Data tables and forms adhere to existing patterns (see `src/components/course/CourseTable.tsx`, `src/components/forms/`).

## Data Fetching & Caching
- TanStack Query handles server state; define query keys per resource, use `queryClient.invalidateQueries` after mutations.
- For paginated endpoints, use interface types in `src/interface/pagination.ts` and follow existing pagination components.

## Testing & Validation
- If adding tests, use Vitest/RTL. Place as `*.test.tsx`. Not mandatory but align with `AGENTS.md` if shipping critical features.
- Run ESLint and TypeScript checks before merge.

## Productivity Tips
- Consult `AGENTS.md` for current TODOs (e.g., `DashboardPage` still using mock data; replace with API calls).
- Sync schema changes with backend `english-learning` to ensure enum/value consistency.
- Document new env vars or permissions in README/PR to help admin operators.
