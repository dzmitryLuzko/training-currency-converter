# AGENTS.md

Cross-agent instructions for this repository (read by Claude, Gemini, Cursor, Windsurf, and other agents that support the `AGENTS.md` convention). GitHub Copilot reads the equivalent `.github/copilot-instructions.md`; keep the two aligned. Claude Code also has `CLAUDE.md`.

## Working agreement

- Start multi-step tasks with a to-do list; keep a scratch log in `copilot_session.log` (git-ignored) and clean it up when done.
- Verify with real command output before reporting success.
- Keep changes scoped to the task / challenge at hand.

## Architecture (where things live)

- `utils/` — pure logic, no React. `currency.ts` (`CURRENCIES`, `convertCurrency` via USD base, `validateAmount`, formatters), `storage.ts` (localStorage history, capped at 10, SSR-guarded).
- `hooks/` — `useExchangeRates` (fetches `/api/rates`) and `useConverter` (amount/from/to/result/validation/history, auto-convert, URL sync).
- `components/` — presentation only; small components compose into `ConverterForm`; `ConversionResult` is the animated board. `app/page.tsx` wires it together.
- `app/api/rates/route.ts` — provider fallback chain with payload validation and `MOCK_RATES` fallback; cached 1 hour.

## Non-negotiable patterns

- Conversion is **automatic** (effect-driven) — no convert button.
- State is **URL-first** via `useSearchParams`, so the converter tree must stay inside `<Suspense>` (build fails otherwise).
- The API route **validates the payload** (rejects `200 OK` responses with no usable rates) before accepting a source — keep that guard.
- Tests are **co-located**; the route test uses `/** @jest-environment node */`.
- Use **design tokens** (`ink/paper/brass/muted/alert/line`), not raw Tailwind colors; `muted` shadows the built-in `slate` scale on purpose.
- Import via the `@/*` alias (repo root).

## Commands

`npm run dev` · `npm run build` · `npm run lint` · `npm test` · `npx jest <path>` · `npx jest -t "<name>"`.
`npm start` serves the build and won't reflect `app/api/**` source edits — use `npm run dev` while iterating.
