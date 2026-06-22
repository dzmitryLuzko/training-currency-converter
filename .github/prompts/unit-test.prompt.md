---
description: 'Write or extend co-located Jest + React Testing Library tests for a file.'
---

# Write unit tests

Create or extend the co-located test for the target: `${input:target:path to the component/hook/util, or leave blank to use the open file}` (defaults to `${file}`).

Steps:

1. Read the target and any existing `*.test.*` beside it. Identify the public surface: exported functions, component props, and observable behaviour.
2. Follow `.github/instructions/tests.instructions.md`:
   - Query by role/label/text; interact with `@testing-library/user-event`.
   - Co-locate the test (`X.tsx` → `X.test.tsx`).
   - For a Route Handler, start the file with `/** @jest-environment node */` and mock `global.fetch`.
   - Mock `next/navigation` for anything using the URL.
3. Cover: the happy path, edge cases (empty/zero/invalid input, missing rates), and at least one failure/fallback path.
4. Run `npx jest <path>` for just this file, then fix until green. Report the final pass/fail summary.

Do not change production code to make a test pass unless you find a real bug — if you do, call it out explicitly.
