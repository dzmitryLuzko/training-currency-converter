---
description: 'Jest + React Testing Library conventions.'
applyTo: '**/*.{test,spec}.{ts,tsx}'
---

# Testing conventions

- **Co-locate** the test next to its subject (`X.tsx` → `X.test.tsx`, `x.ts` → `x.test.ts`).
- **Test behaviour, not implementation.** Query by role/label/text (`getByRole`, `getByPlaceholderText`, `getByText`); drive interactions with `@testing-library/user-event`. Avoid asserting internal state.
- **`getByText` matches within a single element.** The result board keeps the currency symbol and amount in one text node (e.g. `€85.00`) precisely so `getByText(/€85.00/)` works — keep that in mind when writing or moving such assertions.
- **API route tests run in Node.** Start the file with `/** @jest-environment node */` and mock `global.fetch` (`mockResolvedValueOnce` / `mockRejectedValueOnce`); cover the success path, source fallback, and mock fallback. Everything else uses the default jsdom environment.
- **Mock framework boundaries**, not your own code: mock `next/navigation` (`useRouter`, `useSearchParams`) for components/hooks that use the URL.
- Run a single file with `npx jest <path>` and a single case with `npx jest -t "<name>"`. New logic should ship with its test in the same change.
