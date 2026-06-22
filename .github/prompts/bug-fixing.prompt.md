---
description: 'Systematic bug diagnosis and fix — reproduce, find root cause, fix, verify.'
---

# Fix a bug

Bug report: ${input:bug:describe the symptom, or paste the error}

Work the problem in order — do not jump to a fix:

1. **Reproduce.** Establish the exact steps and the expected vs actual behaviour. If it's testable, write a failing test that captures it first.
2. **Find the root cause.** Trace the data through the layers (`components` → `hooks` → `utils` / `app/api`). Read the actual values — don't assume. Common culprits here:
   - State not updating because conversion is effect-driven (no button) — check the effect deps in `useConverter`.
   - A provider returning `200 OK` with no rates — confirm `/api/rates` payload validation isn't being bypassed.
   - URL/`useSearchParams` usage outside a `<Suspense>` boundary.
3. **Fix at the root**, in the layer that owns the logic. Keep the change minimal and consistent with surrounding code.
4. **Verify with real output:** run `npx jest <relevant path>` (and `npm run dev` / a manual check if it's UI). Paste the command output.
5. Summarise the root cause and the fix in one or two sentences.

State your hypothesis before editing, and confirm it against evidence before committing to the fix.
