# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Frontend for **Centro Médico Del Valle**, a hospital management system (Spanish UI, `lang="es"`). Next.js 16 App Router + React 19 + TypeScript + Tailwind v4 + shadcn/ui (new-york style, Radix primitives).

## Commands

```bash
npm run dev     # Next dev server on port 3001 (not 3000)
npm run build   # Production build (standalone output)
npm run start   # Serve built app
npm run lint    # ESLint
```

No test runner is configured. `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `next build` will not catch type errors — run `npx tsc --noEmit` when you need a type check.

Both `package-lock.json` and `pnpm-lock.yaml` are committed; `package-lock.json` is the source of truth (pnpm lock is a 92-byte stub). Use npm.

## Environment

`NEXT_PUBLIC_API_URL` points at the backend (default `http://localhost:8000/api/v1`). The frontend expects every endpoint to return `{ success, code, message, data }` (see `ApiResponse<T>` in `lib/api/config.ts`); list endpoints return `data` shaped like `PaginatedResponse<T>`.

## Architecture

### Auth and request flow

Authentication is **cookie-based, client-side**. Tokens live in three cookies set from the browser (`lib/utils/cookies.ts`): `access_token` (24h), `refresh_token` (30d), `user_data` (serialized user, 30d). There is no server action / Route Handler involved — the login form calls the external API directly and writes cookies.

- `middleware.ts` guards every non-public route by checking the `access_token` cookie and redirects to `/login`. Only `/login` is public. The matcher skips `api`, `_next/*`, and static assets. Refresh token rotation is **not** implemented yet — a 401 will not auto-refresh.
- `lib/context/auth-context.tsx` hydrates `user` from the `user_data` cookie on mount, exposes `login` / `logout` / `isAuthenticated`. Wrap the app in `<AuthProvider>` (already done in `app/layout.tsx`). Consume via `useAuth()` re-exported from `hooks/use-auth.ts`.
- `lib/api/client.ts` is the single fetch wrapper. It reads the token **dynamically** per request via `API_CONFIG.getToken()` (reads the cookie), attaches `Authorization: Bearer …`, parses JSON, and throws `ApiError(message, statusCode, response)` on non-2xx. Always use `api.get/post/put/patch/delete` from `lib/api/client.ts` — do not call `fetch` directly in services.

### API layer conventions

The API layer is organized by domain under `lib/api/`:

```
lib/api/
├── client.ts                 # fetch wrapper + typed api.{get,post,…}
├── config.ts                 # API_CONFIG, ApiError, ApiResponse, PaginatedResponse
├── services/
│   ├── auth-services/        # authService
│   ├── core-services/        # userService, roleService
│   └── inventory-services/   # productService, supplierService, warehouseService
└── types/
    ├── auth.types.ts
    ├── core-types/
    └── inventory-types/
```

`lib/api/services/index.ts` re-exports the services by name. `lib/api/index.ts` re-exports `api`, `API_CONFIG`, types, and services — most imports should come from `@/lib/api`.

Pattern for a service: define the endpoint as a const, write a `transformQueryParams` that converts the frontend-friendly query shape to the backend's (drop `"all"`, coerce `"active"` → `true`, etc.), then export a plain object of async methods. See `lib/api/services/core-services/user.service.ts` for the canonical example.

### Hooks mirror services

`hooks/` contains one file per domain entity (`use-users.ts`, `use-roles.ts`, `hooks/inventory-hooks/use-products.ts`, …). Each hook owns local `{ data, pagination, isLoading, error }` state, wraps the corresponding service, and catches `ApiError` to produce a Spanish error message. When adding a new entity, follow this shape — components should not call services directly.

**Note:** the service layer is mid-reorg. Older files like `lib/api/services/auth.service.ts` and `inventory-services/product.service.ts` are being replaced by `authService.ts` / `productService.ts` under the new subfolders. When adding files, follow the new `{domain}-services/{entity}Service.ts` convention and update `services/index.ts`. `lib/api/index.ts` currently has one direct re-export (`warehouseService`) that bypasses `services/index.ts` — prefer adding new exports to `services/index.ts`.

### App structure

Routes under `app/` mirror domains: `admin/` (users, roles, system, tools), `billing/`, `medical/`, `pharmacy/`, `inventory/` (products, suppliers, warehouses, movements, purchase-orders, payments-suppliers), `reports/`, `login/`. Pages are client components that pair a route with a hook from `hooks/` and UI from `components/<domain>/`.

Layout composition: `components/layout/dashboard-layout.tsx` wraps authenticated pages with `Sidebar` + `Header`. `components/ui/` is shadcn/ui output — edit freely but keep Radix primitives intact.

### Path alias

`@/*` resolves from the repo root (see `tsconfig.json`). Also mirrored in `components.json` (`@/components`, `@/lib`, `@/hooks`, `@/components/ui`).
