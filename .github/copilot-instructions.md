# Copilot Instructions — Change Bureau (Currency Converter)

Project-wide custom instructions for GitHub Copilot. These apply to every request in this repository. For path-scoped rules see `.github/instructions/`; for reusable workflows see `.github/prompts/`.

## Session Management

- For any multi-step task, **create a to-do list first** and keep it updated as you complete each item.
- Maintain a temporary scratch log at `copilot_session.log` (git-ignored) while working: record the plan, key decisions, and commands run. Delete or empty it when the task is done.
- Before claiming something works, **run the relevant command and read its output** — don't assert success from inspection alone.

## Project Overview

A Next.js 14 (App Router) + TypeScript + Tailwind currency converter. It converts between 10 currencies at live mid-market rates with automatic (button-less) conversion, history, and URL-shareable state. This repo is also a training ground; `docs/` holds 8 challenges. Keep work scoped to the challenge being worked on.

## Core Architecture

Respect the layering — put logic in the layer it belongs to:

- **`utils/` — pure logic, no React.** `currency.ts` owns `CURRENCIES` (single source of truth for the 10 currencies), `convertCurrency` (always via the USD base), `validateAmount`, formatters. `storage.ts` is the localStorage history (capped at 10, guarded with `typeof window`).
- **`hooks/` — state + side-effects.** `useExchangeRates` fetches `/api/rates`. `useConverter(rates)` is the brain: amount/from/to/result/validation/history, auto-convert on every change, URL sync (`?amount&from&to`) read on load and written on change.
- **`components/` — presentation only.** Small pieces (`AmountInput`, `CurrencySelect`, `SwapButton`) compose into `ConverterForm`; `ConversionResult` is the animated result board. Composed by `app/page.tsx`.
- **`app/api/rates/route.ts` — server route.** Tries each provider in `API_SOURCES` in order, normalises, then **validates the payload** before accepting it; falls back to `MOCK_RATES` so the app runs with no keys. Cached 1 hour.

## Critical Patterns & Gotchas

- **Automatic conversion, no convert button.** Conversion runs in an effect on input/selection change. Don't add a submit button.
- **URL-first state.** `useConverter` mirrors state into the query string with `useSearchParams`; because of that, the converter tree **must stay wrapped in `<Suspense>`** in `app/page.tsx` or `npm run build` fails.
- **Validate API payloads, not just HTTP status.** Some providers return `200 OK` with an error body and no rates. The route treats a normalised result with ≤1 rate as a failure and falls through. Preserve this guard.
- **Co-located tests** (`Component.tsx` + `Component.test.tsx`). The API-route test opts into Node with a `/** @jest-environment node */` docblock; everything else uses jsdom.
- **Design tokens, not ad-hoc colors.** Palette lives in `tailwind.config.ts` + `app/globals.css` (`ink`, `paper`, `brass`, `muted`, `alert`, `line`). The custom `muted` color intentionally shadows Tailwind's built-in `slate` scale — don't use `slate-*`. Money figures use the `font-mono` + `tabular` treatment.
- **Path alias `@/*` maps to the repo root** (see `tsconfig.json` and the jest `moduleNameMapper`), not `src/`.

## Commands

```bash
npm run dev            # dev server on http://localhost:3000
npm run build          # production build (also type-checks)
npm run lint           # next lint
npm test               # all unit + API-route tests
npx jest <path>        # a single test file
npx jest -t "<name>"   # tests matching a name
```

`npm start` serves the built output, so it does not reflect source changes to `app/api/**` — iterate with `npm run dev`.

> **Note:** This is the GitHub Copilot instructions file. A root-level `AGENTS.md` mirrors these rules for other agents (Claude, Gemini, Cursor, Windsurf). Keep the two in sync when you change project conventions.
