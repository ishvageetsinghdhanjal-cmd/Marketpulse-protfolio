import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Calculator } from 'lucide-react'

export const Route = createFileRoute('/calculator')({
  component: CalculatorPage,
})

function CalculatorPage() {
  // Investment return calculator
  const [investment, setInvestment] = useState('50000')
  const [buyPrice, setBuyPrice] = useState('1000')
  const [sellPrice, setSellPrice] = useState('1250')
  const [years, setYears] = useState('2')

  const returnResult = useMemo(() => {
    const inv = Number(investment)
    const buy = Number(buyPrice)
    const sell = Number(sellPrice)
    const yrs = Number(years) || 1
    if (!inv || !buy || !sell) return null
    const shares = inv / buy
    const finalValue = shares * sell
    const profit = finalValue - inv
    const totalReturnPercent = (profit / inv) * 100
    const cagr = (Math.pow(finalValue / inv, 1 / yrs) - 1) * 100
    return { shares, finalValue, profit, totalReturnPercent, cagr }
  }, [investment, buyPrice, sellPrice, years])

  // Future price projection (simple CAGR-based extrapolation)
  const [currentPrice, setCurrentPrice] = useState('1000')
  const [growthRate, setGrowthRate] = useState('12')
  const [projecti

---
*Content truncated for display.*
