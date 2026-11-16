# Marketpulse-protfolio
# MarketPulse

MarketPulse is a student project for exploring the Indian stock market. It combines a live-updating
market dashboard, a personal portfolio tracker, return/price calculators, and an AI chatbot that explains
market concepts in plain language.

## Features

- **Markets dashboard** — NSE-listed companies with price, day change, and market capitalisation, plus
  top gainers/losers and a sector breakdown chart.
- **Portfolio tracker** — add your holdings and see live profit/loss, stored per-browser (no login needed).
- **Calculators** — investment return calculator (CAGR) and a simple future price projection tool.
- **AI chatbot** — a floating assistant that explains site features and stock market terminology.
- **Learn page** — a glossary of common market terms and instructions for enabling real-time prices.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (React 19, TanStack Router) |
| Styling | Tailwind CSS 4 |
| Charts | Chart.js / react-chartjs-2 |
| Database | Netlify Database (Postgres) via Drizzle ORM |
| AI | Netlify AI Gateway (Anthropic Claude) |
| Market data | Twelve Data API (optional), with a simulated fallback feed |
| Deployment | Netlify |

## Running locally

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`. For full Netlify emulation (database, AI Gateway, etc.), use:

```bash
netlify dev
```

## Real-time market data

By default, prices are simulated so the app works with zero configuration. To show real NSE/BSE prices,
add a `TWELVE_DATA_API_KEY` environment variable (see the in-app **Learn** page for details).

## License

MIT — open source. See the About page in the app for more details.
