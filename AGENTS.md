# Repository Guidelines

> Last updated: 2025-11-05 — Tóm tắt: Hướng dẫn repository cho `cms-english` (MUI + Vite): cấu trúc, lệnh, style và security.

## Overview & Architecture
- Vite + React (TypeScript) with MUI and Tailwind v4.
- Server data via Axios (`src/config/axiosConfig.ts`) and TanStack Query.
- Auth: `localStorage.cms_auth` (Bearer token). 401 clears token and routes to `/login`.

## Project Structure & Module Organization
- `src/pages/`, `src/routes/` — page views and routing.
- `src/components/` — UI components; feature groups: `schedule/`, `course/`, `forms/`, `student/`, `classroom/`, `teacher/`, `ui/`.
- `src/apis/` — API clients; `src/interface/` — TypeScript types.
- `src/context/`, `src/hooks/`, `src/assets/`, `src/styles/`.
  Example: `src/components/course/CourseTable.tsx`.

## Build, Test, and Development Commands
- `npm run dev` — start local dev server.
- `npm run build` — production build output.
- `npm run preview` — serve dist for quick smoke test.
- `npm run lint` — run ESLint.
Environment: create `.env` with `VITE_API_URL=http://localhost:3000/api`.

## Coding Style & Naming Conventions
- TypeScript; follow ESLint rules. Prefer 2‑space indent and project defaults.
- React components: PascalCase files (e.g., `StudentCard.tsx`).
- Hooks: `useX.ts` in `src/hooks/` (e.g., `useCourses.ts`).
- APIs: `*.api.ts` grouped by resource (e.g., `student.api.ts`).
- Types/interfaces: PascalCase in `src/interface/` (`Student`, `PaginationParams`).
- Styling: combine MUI components with Tailwind utilities; keep shared styles in `src/styles/`.

## Testing Guidelines
- If adding tests, use Vitest + React Testing Library.
- Name files `*.test.ts(x)` next to the unit or in `__tests__/`.
- Example: `src/components/ui/Button.test.tsx`.
- Run with `npm test` (if configured) or `npx vitest`.

## Commit & Pull Request Guidelines
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
- Before PR: `npm run lint`, `npm run build`, then `npm run preview` to smoke test screens.
- PRs should include: clear description, linked issues, UI screenshots, and notes on API contract changes; update `src/interface/` and `src/apis/` accordingly.

## Security & Configuration Tips
- Do not commit `.env` or tokens. Use `VITE_`‑prefixed env vars only.
- Do not log `cms_auth`. Axios interceptor injects `Authorization` automatically.
- Prefer HTTPS for production API URLs.

