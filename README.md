# Change Bureau — Currency Converter

A responsive currency converter built with Next.js 14, TypeScript, and Tailwind CSS. Convert between 10 popular currencies at live mid-market rates, with a "foreign-exchange terminal" visual identity — an ivory ticket on a deep counter, monospaced figures, and a result board that updates as you type.

## Training Challenges

This repository is a hands-on learning platform for AI-assisted development with GitHub Copilot.

**[→ View all challenges](docs/challenges.md)** | **[📖 Copilot Best Practices](docs/copilot-reference.md)**

| Difficulty | Challenges |
|------------|-----------|
| 🟢 Beginner | [Project Creation](docs/1-challenge-project-creation.md), [Copilot Customisation](docs/2-challenge-customisation.md), [Unit Testing](docs/3-challenge-unit-test.md) |
| 🟡 Intermediate | [Bug Fixing](docs/4-challenge-bug-fix.md), [Feature Development](docs/5-challenge-feature.md), [GitHub Issues](docs/6-challenge-agent-issue.md) |
| 🔴 Advanced | [Spec-Kit](docs/7-challenge-spec-kit.md), [Optional Advanced](docs/8-challenge-optional-advanced.md) |

## Features

### Core functionality

- **Live exchange rates** fetched from multiple sources with automatic fallback, degrading to bundled mock rates so the app always works — no configuration or API key required.
- **10 currencies**: USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, INR, MXN.
- **Automatic conversion** — no convert button; the result updates on every input or selection change.
- **Currency swap** between the two dropdowns.
- **URL persistence** — the current conversion is reflected in `?amount&from&to` and restored on reload.

### Advanced

- **Conversion history** — the last 10 conversions, with reload-on-click and clear.
- **Input validation** with messages shown directly beneath the input row.
- **Responsive design**, visible keyboard focus, and `prefers-reduced-motion` support.
- **Graceful error handling** with 1-hour caching for performance.

## Design

The interface is themed as a **change bureau / FX terminal** rather than a generic card UI:

- **Palette** — `ink` #0C2A27 (counter backdrop), `paper` #F4EEE0 (ticket), `brass` #C2922E (accent), with red reserved for errors. Tokens live in `tailwind.config.ts` and `app/globals.css`.
- **Typography** — **Space Grotesk** for UI text and **IBM Plex Mono** (tabular) for every monetary figure, loaded via `next/font`.
- **Signature** — a "living board": the converted amount in large tabular mono that flips in on each change (keyed re-mount + CSS animation), echoing a bureau rate board.

## Tech stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS 3 + `next/font`
- **Testing**: Jest + React Testing Library (+ MSW, jest-axe available)
- **Rate sources** (USD-based, tried in order): exchangerate.host → exchangerate-api.com → open.er-api.com, then mock fallback.

## Getting started

### Prerequisites

- Node.js 18.x or higher
- npm (or yarn / pnpm)

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

### Tests

```bash
npm test            # run all unit + API route tests
npm run test:watch  # watch mode
npm run test:coverage
```

## Project structure

```
training-currency-converter/
├── app/
│   ├── api/rates/route.ts     # Exchange-rate endpoint: fallback chain + mock, 1h cache
│   ├── globals.css            # Design tokens, board animation, reduced-motion
│   ├── layout.tsx             # Fonts (next/font) + metadata
│   └── page.tsx               # Page composition (ticket layout)
├── components/                # Presentational components (co-located *.test.tsx)
│   ├── AmountInput.tsx        # Amount field (mono, validation styling)
│   ├── CurrencySelect.tsx     # Currency dropdown
│   ├── SwapButton.tsx         # Swap control (rotates between dropdowns)
│   ├── ConverterForm.tsx      # One-row form assembly
│   ├── ConversionResult.tsx   # The "living board" result
│   ├── ConversionHistory.tsx  # Recent conversions (receipt stubs)
│   ├── ErrorMessage.tsx · LoadingSpinner.tsx · PageHeader.tsx · PageFooter.tsx
│   └── index.ts
├── hooks/
│   ├── useExchangeRates.ts    # Fetches /api/rates (loading/error)
│   └── useConverter.ts        # Conversion state, auto-convert, swap, URL + history
├── utils/
│   ├── currency.ts            # CURRENCIES (10), convertCurrency, validateAmount, format*
│   └── storage.ts             # localStorage history (capped at 10)
├── types/index.ts             # Shared TypeScript interfaces
├── tailwind.config.ts · next.config.js · tsconfig.json
├── jest.config.js · jest.setup.ts
└── README.md · CHANGELOG.md
```

## API

### `GET /api/rates`

Returns USD-based exchange rates, cached for one hour.

```json
{
  "success": true,
  "data": {
    "base": "USD",
    "rates": { "EUR": 0.85, "GBP": 0.73 },
    "timestamp": 1697184000000
  }
}
```

The handler tries each live source in turn (10-second timeout per request, browser-like `User-Agent` to avoid provider quirks) and falls back to bundled mock rates if all fail, so it never blocks the UI.

## Usage

- **Convert** — type an amount and pick the two currencies; the board updates automatically.
- **Swap** — press the ⇄ control between the dropdowns.
- **History** — press **Show** to expand recent conversions; click one to reload it, or **Clear** to remove them.
- **Share** — copy the URL, e.g. `http://localhost:3000?amount=100&from=USD&to=EUR`.

## Error handling

- **Invalid amount** — validation message beneath the input row.
- **API failure** — automatic fallback across sources, then mock rates.
- **Network timeout** — 10-second per-source timeout via `AbortController`.

## License

Open source under the [MIT License](LICENSE).

---

**Version**: 2.0.0
**Last Updated**: June 2026
