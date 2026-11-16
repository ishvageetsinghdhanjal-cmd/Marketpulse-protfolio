import { createFileRoute } from '@tanstack/react-router'
import { getQuotes } from '@/lib/market-data.server'

export const Route = createFileRoute('/api/market')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const symbolsParam = url.searchParams.get('symbols')
        const symbols = symbolsParam ? symbolsParam.split(',') : undefined
        const result = await getQuotes(symbols)
        return Response.json(result)
      },
    },
  },
})
