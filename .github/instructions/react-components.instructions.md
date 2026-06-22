---
description: 'Conventions for React components in /components.'
applyTo: 'components/**/*.tsx'
---

# Component conventions

- **Presentation only.** Components render props; they don't fetch data or own app state. Conversion/state logic belongs in `hooks/` and `utils/`.
- **Small and composable.** Keep each component focused (one input, one control, one display). Compose them in `ConverterForm`; don't grow a single mega-component.
- **Typed props.** Declare an explicit `interface <Name>Props`; default-export the component.
- **Accessibility is part of the markup.** Every control needs an accessible name: inputs/selects carry `aria-label` (or a visible `<label>`), the swap control keeps `aria-label="Swap currencies"` and a matching `title`, and error containers use `role="alert"`.
- **Keep test anchors stable.** Some tests assert exact text/classes — the `Enter amount` placeholder, the `You receive` label, and the `border-alert` / `text-alert` error classes. If you change them, update the co-located test in the same change.
- **Styling** uses the design tokens; money values use `font-mono tabular`. Add `'use client'` only when the component has interactivity beyond receiving props (e.g. `SwapButton` manages its own rotation state).
