import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and, desc, count, sql } from 'drizzle-orm'
import { getUser } from '@netlify/identity'
import { db } from '../../db/index.js'
import { portfolioHoldings } from '../../db/schema.js'
import { INDIAN_STOCKS, findStock } from './stocks-catalog'

// Guests are identified by a random browser UUID. Signed-in users are identified by
// their Netlify Identity id, read from the verified session cookie — never from input.
const guestSchema = z.object({ guestId: z.uuid().nullable() })

const holdingFields = z.object({
  symbol: z.string().min(1).max(20),
  quantity: z.number().positive().max(10_000_000),
  buyPrice: z.number().positive().max(10_000_000),
  buyDate: z.iso.date().nullable(),
  notes: z.string().trim().max(280).nullable(),
})

async function resolveOwner(guestId: string | null) {
  const user = await getUser()
  if (user) return { ownerId: `user:${user.id}`, signedIn: true as const }
  if (!guestId) throw new Error('Missing portfolio id')
  return { ownerId: guestId, signedIn: false as const }
}

function toRow(data: z.infer<typeof holdingFields>) {
  const stock = findStock(data.symbol.toUpperCase())
  if (!stock) throw new Error(`Unknown symbol: ${data.symbol}`)
  return {
    symbol: stock.symbol,
    companyName: stock.name,
    quantity: String(data.quantity),
    buyPrice: String(data.buyPrice),
    buyDate: data.buyDate,
    notes: data.notes || null,
  }
}

export const listHoldings = createServerFn({ method: 'GET' })
  .inputValidator(guestSchema)
  .handler(async ({ data }) => {
    const { ownerId, signedIn } = await resolveOwner(data.guestId)
    const rows = await db
      .select()
      .from(portfolioHoldings)
      .where(eq(portfolioHoldings.ownerId, ownerId))
      .orderBy(desc(portfolioHoldings.createdAt))

    // When signed in, report how many holdings this browser saved as a guest so the
    // UI can offer to move them into the account.
    let guestHoldingCount = 0
    if (signedIn && data.guestId) {
      const [result] = await db
        .select({ n: count() })
        .from(portfolioHoldings)
        .where(eq(portfolioHoldings.ownerId, data.guestId))
      guestHoldingCount = result?.n ?? 0
    }

    return { rows, signedIn, guestHoldingCount }
  })

export const addHolding = createServerFn({ method: 'POST' })
  .inputValidator(guestSchema.extend(holdingFields.shape))
  .handler(async ({ data }) => {
    const { ownerId } = await resolveOwner(data.guestId)
    const [row] = await db
      .insert(portfolioHoldings)
      .values({ ownerId, ...toRow(data) })
      .returning()
    return row
  })

export const updateHolding = createServerFn({ method: 'POST' })
  .inputValidator(guestSchema.extend({ id: z.number().int(), ...holdingFields.shape }))
  .handler(async ({ data }) => {
    const { ownerId } = await resolveOwner(data.guestId)
    const [row] = await db
      .update(portfolioHoldings)
      .set({ ...toRow(data), updatedAt: sql`now()` })
      .where(and(eq(portfolioHoldings.id, data.id), eq(portfolioHoldings.ownerId, ownerId)))
      .returning()
    if (!row) throw new Error('Holding not found')
    return row
  })

export const deleteHolding = createServerFn({ method: 'POST' })
  .inputValidator(guestSchema.extend({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const { ownerId } = await resolveOwner(data.guestId)
    await db
      .delete(portfolioHoldings)
      .where(and(eq(portfolioHoldings.id, data.id), eq(portfolioHoldings.ownerId, ownerId)))
    return { success: true }
  })

/** Moves this browser's guest holdings into the signed-in user's account. */
export const importGuestHoldings = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ guestId: z.uuid() }))
  .handler(async ({ data }) => {
    const user = await getUser()
    if (!user) throw new Error('Sign in to import guest holdings')
    const ownerId = `user:${user.id}`
    const moved = await db
      .update(portfolioHoldings)
      .set({ ownerId, updatedAt: sql`now()` })
      .where(eq(portfolioHoldings.ownerId, data.guestId))
      .returning({ id: portfolioHoldings.id })
    return { moved: moved.length }
  })

const SAMPLE = [
  { symbol: 'RELIANCE', quantity: 10, discount: 0.92, monthsAgo: 14 },
  { symbol: 'TCS', quantity: 5, discount: 1.06, monthsAgo: 9 },
  { symbol: 'HDFCBANK', quantity: 20, discount: 0.95, monthsAgo: 20 },
  { symbol: 'ITC', quantity: 50, discount: 0.88, monthsAgo: 30 },
  { symbol: 'INFY', quantity: 12, discount: 1.03, monthsAgo: 4 },
]

/** Adds a small, clearly-labelled sample portfolio so the tracker can be demoed instantly. */
export const addSampleHoldings = createServerFn({ method: 'POST' })
  .inputValidator(guestSchema)
  .handler(async ({ data }) => {
    const { ownerId } = await resolveOwner(data.guestId)
    const values = SAMPLE.map((s) => {
      const stock = INDIAN_STOCKS.find((x) => x.symbol === s.symbol)!
      const d = new Date()
      d.setMonth(d.getMonth() - s.monthsAgo)
      return {
        ownerId,
        symbol: stock.symbol,
        companyName: stock.name,
        quantity: String(s.quantity),
        buyPrice: (stock.basePrice * s.discount).toFixed(2),
        buyDate: d.toISOString().slice(0, 10),
        notes: 'Sample holding — edit or delete me',
      }
    })
    const rows = await db.insert(portfolioHoldings).values(values).returning()
    return rows
  })
