import { INDIAN_STOCKS, type StockSeed } from './stocks-catalog'
import type { FeedInfo, FeedNote, QuoteSource } from './market-labels'

export interface StockQuote {
  symbol: string
  name: string
  sector: string
  price: number
  change: number
  changePercent: number
  /** Always an estimate: price × a static shares-outstanding figure from the catalog. */
  marketCapCr: number
  dayHigh: number
  dayLow: number
  volume: number
  /** Where this specific quote came from. */
  source: QuoteSource
  /** Timestamp the provider reports for the quote (or generation time for simulated quotes). */
  asOf: string
}

export interface MarketResponse {
  quotes: StockQuote[]
  feed: FeedInfo
}

const TWELVE_DATA_BASE = 'https://api.twelvedata.com'
// Provider quotes are cached per server instance so the 4-second client poll doesn't
// burn through the provider's rate limit. Simulated quotes are cheap and never cached.
const PROVIDER_CACHE_MS = 60_000
let providerCache: { at: number; key: string; quotes: Map<string, StockQuote> } | null = null

function simulateQuote(seed: StockSeed): StockQuote {
  // Deterministic-ish walk anchored to the current 3-second tick plus a per-symbol
  // offset, so every symbol drifts independently but repeated calls in the same
  // tick return a stable value (no jitter within a single poll).
  const tick = Math.floor(Date.now() / 3000)
  const symbolSeed = seed.symbol.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const wave = Math.sin(tick / 14 + symbolSeed) + Math.sin(tick / 37 + symbolSeed * 1.7) * 0.6
  const noise = Math.sin(tick * 12.9898 + symbolSeed * 78.233) * 0.5
  const pctMove = (wave + noise) * 0.9 // roughly -2% to +2%
  const price = Math.max(1, seed.basePrice * (1 + pctMove / 100))
  const change = price - seed.basePrice
  const changePercent = (change / seed.basePrice) * 100

  return {
    symbol: seed.symbol,
    name: seed.name,
    sector: seed.sector,
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    marketCapCr: Number((price * seed.sharesOutstandingCr).toFixed(0)),
    dayHigh: Number((price * 1.012).toFixed(2)),
    dayLow: Number((price * 0.988).toFixed(2)),
    volume: Math.floor(500000 + Math.abs(wave) * 4_000_000),
    source: 'simulated',
    asOf: new Date().toISOString(),
  }
}

async function fetchProviderQuotes(
  seeds: StockSeed[],
  apiKey: string,
): Promise<{ quotes: Map<string, StockQuote>; cachedAt: number } | null> {
  const key = seeds.map((s) => s.symbol).join(',')
  if (providerCache && providerCache.key === key && Date.now() - providerCache.at < PROVIDER_CACHE_MS) {
    return { quotes: providerCache.quotes, cachedAt: providerCache.at }
  }

  try {
    const symbolParam = seeds.map((s) => `${s.symbol}:NSE`).join(',')
    const res = await fetch(
      `${TWELVE_DATA_BASE}/quote?symbol=${encodeURIComponent(symbolParam)}&apikey=${apiKey}`,
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data?.status === 'error') return null

    // Twelve Data returns a single object for one symbol, or a map keyed by symbol for many.
    const bySymbol: Record<string, any> =
      seeds.length === 1 ? { [`${seeds[0].symbol}:NSE`]: data } : data

    const quotes = new Map<string, StockQuote>()
    for (const seed of seeds) {
      const entry = bySymbol[`${seed.symbol}:NSE`] ?? bySymbol[seed.symbol]
      if (!entry || entry.status === 'error' || !entry.close) continue
      const price = Number(entry.close)
      quotes.set(seed.symbol, {
        symbol: seed.symbol,
        name: seed.name,
        sector: seed.sector,
        price,
        change: Number(entry.change ?? 0),
        changePercent: Number(entry.percent_change ?? 0),
        marketCapCr: Number((price * seed.sharesOutstandingCr).toFixed(0)),
        dayHigh: Number(entry.high ?? price),
        dayLow: Number(entry.low ?? price),
        volume: Number(entry.volume ?? 0),
        source: 'provider',
        asOf: entry.timestamp
          ? new Date(Number(entry.timestamp) * 1000).toISOString()
          : new Date().toISOString(),
      })
    }
    if (quotes.size === 0) return null

    const at = Date.now()
    providerCache = { at, key, quotes }
    return { quotes, cachedAt: at }
  } catch {
    return null
  }
}

/**
 * Returns quotes for the requested symbols (or the full catalog), plus a description
 * of where the numbers came from. Uses Twelve Data when TWELVE_DATA_API_KEY is set;
 * any symbol the provider can't return falls back to the simulated feed, and the
 * response says so explicitly rather than presenting simulated numbers as real.
 */
export async function getQuotes(symbols?: string[]): Promise<MarketResponse> {
  const seeds = symbols?.length
    ? INDIAN_STOCKS.filter((s) => symbols.includes(s.symbol))
    : INDIAN_STOCKS

  const apiKey = process.env.TWELVE_DATA_API_KEY
  let note: FeedNote = 'no_api_key'
  let provider: Awaited<ReturnType<typeof fetchProviderQuotes>> = null

  if (apiKey) {
    provider = await fetchProviderQuotes(seeds, apiKey)
    note = provider ? 'ok' : 'provider_error'
  }

  const quotes = seeds.map((seed) => provider?.quotes.get(seed.symbol) ?? simulateQuote(seed))
  const providerCount = quotes.filter((q) => q.source === 'provider').length
  if (provider && providerCount < quotes.length) note = 'partial'

  return {
    quotes,
    feed: {
      mode: providerCount === 0 ? 'simulated' : providerCount === quotes.length ? 'provider' : 'mixed',
      note,
      providerName: providerCount > 0 ? 'Twelve Data' : null,
      providerCount,
      simulatedCount: quotes.length - providerCount,
      providerFetchedAt: provider ? new Date(provider.cachedAt).toISOString() : null,
      generatedAt: new Date().toISOString(),
    },
  }
}

