---
description: 'Next.js 14 App Router + TypeScript conventions for this project.'
applyTo: '**'
---

# Next.js 14 App Router

Apply these whenever you touch app code.

## Server vs Client Components

- Components are **Server Components by default**. Only add `'use client'` when the file uses state, effects, browser APIs, or event handlers.
- Keep `'use client'` as low in the tree as possible. `app/page.tsx` is a client component because it drives the converter; favour pushing client-only logic into hooks/leaf components rather than marking large trees.
- `app/layout.tsx` stays a Server Component — it only sets metadata and wires fonts via `next/font`.

## Data fetching & routing

- Server data lives in Route Handlers under `app/api/**/route.ts` (use the `GET`/`POST` exports, `NextRequest`/`NextResponse`).
- Cache with `export const revalidate = <seconds>` plus an explicit `Cache-Control` header when the handler builds the response itself.
- Anything reading `useSearchParams`/`usePathname` must be inside a `<Suspense>` boundary, or the production build fails. The converter tree already relies on this.

## TypeScript & imports

- Import with the `@/*` alias (repo root), e.g. `@/hooks/useConverter`, `@/utils/currency`.
- Share types from `types/index.ts`; don't redeclare `Currency`, `ExchangeRates`, `ConversionResult` locally.
- Prefer `interface` for object/prop shapes; type component props explicitly.

## Styling

- Tailwind only, using the project design tokens (`ink`, `paper`, `brass`, `muted`, `alert`, `line`). Do not use Tailwind's `slate-*` — `muted` deliberately shadows it.
- Monetary figures use `font-mono` + the `tabular` utility so columns stay aligned.
- Respect `prefers-reduced-motion` (already handled in `globals.css`); don't add motion that ignores it.
