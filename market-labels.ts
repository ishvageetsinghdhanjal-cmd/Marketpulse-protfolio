export interface FeedInfo {
  mode: FeedMode
  note: FeedNote
  providerName: string | null
  providerCount: number
  simulatedCount: number
  /** When provider data was last fetched (provider data is cached for up to a minute). */
  providerFetchedAt: string | null
  generatedAt: string
}

export const FEED_LABELS: Record<FeedMode, { short: string; long: string }> = {
  provider: {
    short: 'Provider quotes',
    long: 'Quotes from Twelve Data. Free-tier exchange data is typically delayed, so treat these as recent rather than tick-by-tick live prices.',
  },
  mixed: {
    short: 'Partly simulated',
    long: 'Some quotes come from Twelve Data; the provider did not return the rest, so those rows show simulated prices and are tagged "Sim".',
  },
  simulated: {
    short: 'Simulated prices',
    long: 'These are not real market prices. They are generated around approximate reference values so the site works without a data subscription.',
  },
}

export const FEED_NOTE_TEXT: Record<FeedNote, string | null> = {
  ok: null,
  no_api_key: 'No market data provider is configured for this site.',
  provider_error: 'The market data provider request failed, so the site fell back to simulated prices.',
  partial: 'The provider did not return every symbol.',
}

export const MARKET_CAP_NOTE =
  'Market cap is an estimate: current price × a fixed shares-outstanding figure stored in the app. It is not an official exchange figure.'

/**
  Regular NSE equity session: Monday–Friday, 09:15–15:30 IST.
  Exchange holidays and special sessions are not accounted for.
 */
export function getNseSessionStatus(now = new Date()): { open: boolean; label: string } {
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60_000)
  const day = ist.getDay()
  const minutes = ist.getHours() * 60 + ist.getMinutes()
  const open = day >= 1 && day <= 5 && minutes >= 9 * 60 + 15 && minutes < 15 * 60 + 30
  return {
    open,
    label: open ? 'NSE regular session open' : 'NSE closed (outside 09:15–15:30 IST, Mon–Fri)',
  }
}

export function formatAsOf(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' IST'
}
