---
description: 'Onboard a new contributor — explain the architecture and how to run the project.'
---

# Project introduction

Give me a guided tour of this repository as if onboarding a new contributor. Use the actual code, not assumptions.

Cover:

1. **What it is** in two sentences (see `README.md`).
2. **The layered architecture** — what `utils/`, `hooks/`, `components/`, and `app/api/rates/route.ts` each own, and how data flows from a keystroke to the result board. Name the key files (`useConverter`, `useExchangeRates`, `currency.ts`, `storage.ts`).
3. **The non-negotiable patterns** from `.github/copilot-instructions.md`: automatic conversion, URL-first state + `<Suspense>`, payload validation in the API route, co-located tests, design tokens.
4. **How to run it:** `npm install`, `npm run dev`, and how to run a single test.
5. **Where to start** for a first contribution and which gotchas to watch for.

Keep it concise and link claims to specific files.
