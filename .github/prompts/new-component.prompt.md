---
description: 'Scaffold a new presentational component following project patterns, with a co-located test.'
---

# New component

Create a new presentational component: ${input:name:ComponentName} — purpose: ${input:purpose:what it displays/controls}.

Follow `.github/instructions/react-components.instructions.md`:

1. Create `components/${input:name}.tsx`:
   - Declare `interface ${input:name}Props` and default-export the component.
   - Presentation only — receive data/handlers via props; no fetching or app state (push that to `hooks/`/`utils/`).
   - Give every control an accessible name; use `role="alert"` for error text.
   - Style with design tokens (`ink/paper/brass/muted/alert/line`); money values use `font-mono tabular`. Add `'use client'` only if it needs interactivity.
2. Create the co-located `components/${input:name}.test.tsx` covering render + the main interaction (query by role/label/text).
3. If it's part of the converter UI, wire it into `ConverterForm` (or the relevant parent) and export it from `components/index.ts`.
4. Run `npx jest components/${input:name}.test.tsx` and fix until green.

Match the structure and Tailwind idiom of existing components (e.g. `AmountInput`, `SwapButton`) — read one before writing.
