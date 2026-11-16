// Seed catalog of major Indian (NSE) listed companies used for the simulated
// market feed and as the universe of symbols the live-data provider is queried for.
export interface StockSeed {
  symbol: string
  name: string
  sector: string
  /** Approximate base price in INR, used as the starting point for simulation. */
  basePrice: number
  /** Shares outstanding, in crores (1 crore = 10,000,000), used to derive market cap. */
  sharesOutstandingCr: number
}

export const INDIAN_STOCKS: StockSeed[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy', basePrice: 2945, sharesOutstandingCr: 676 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'IT', basePrice: 4120, sharesOutstandingCr: 361 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', basePrice: 1685, sharesOutstandingCr: 761 },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT', basePrice: 1845, sharesOutstandingCr: 415 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking', basePrice: 1265, sharesOutstandingCr: 703 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', basePrice: 1685, sharesOutstandingCr: 587 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', basePrice: 825, sharesOutstandingCr: 892 },
  { symbol: 'LICI', name: 'Life Insurance Corporation of India', sector: 'Insurance', basePrice: 985, sharesOutstandingCr: 632 },
  { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', basePrice: 465, sharesOutstandingCr: 1235 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG', basePrice: 2485, sharesOutstandingCr: 235 },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure', basePrice: 3625, sharesOutstandingCr: 140 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'NBFC', basePrice: 7250, sharesOutstandingCr: 62 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Automobile', basePrice: 11450, sharesOutstandingCr: 30 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Consumer Goods', basePrice: 2385, sharesOutstandingCr: 96 },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT', basePrice: 1785, sharesOutstandingCr: 271 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking', basePrice: 1785, sharesOutstandingCr: 199 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking', basePrice: 1145, sharesOutstandingCr: 308 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharma', basePrice: 1745, sharesOutstandingCr: 240 },
  { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer Goods', basePrice: 3385, sharesOutstandingCr: 89 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Cement', basePrice: 11250, sharesOutstandingCr: 29 },
  { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Power', basePrice: 365, sharesOutstandingCr: 968 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Diversified', basePrice: 2585, sharesOutstandingCr: 114 },
  { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT', basePrice: 285, sharesOutstandingCr: 1085 },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd', sector: 'Energy', basePrice: 245, sharesOutstandingCr: 1259 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Automobile', basePrice: 785, sharesOutstandingCr: 366 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', sector: 'Power', basePrice: 315, sharesOutstandingCr: 921 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', sector: 'Automobile', basePrice: 2985, sharesOutstandingCr: 125 },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'FMCG', basePrice: 2285, sharesOutstandingCr: 96 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Metals', basePrice: 985, sharesOutstandingCr: 240 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Metals', basePrice: 165, sharesOutstandingCr: 1225 },
]

export function findStock(symbol: string) {
  return INDIAN_STOCKS.find((s) => s.symbol === symbol.toUpperCase())
