import { emptyData, type FinanceData } from './finance'
const KEY = 'paywise.finance.v1'
// This adapter is the single boundary to replace with a database API later.
export function loadData(): FinanceData {
  const raw = localStorage.getItem(KEY)
  if (!raw) return structuredClone(emptyData)
  const data = JSON.parse(raw) as FinanceData
  const validMoney = (v: unknown) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 && v <= 100_000_000_000
  const validDate = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))
  if (data.version !== 1 || !Array.isArray(data.periods) || !Array.isArray(data.transactions)) throw new Error('Stored data is not supported. Your saved data has not been overwritten.')
  const ids = new Set<string>()
  for (const p of data.periods) {
    if (!p || typeof p.id !== 'string' || ids.has(p.id) || !validDate(p.date) || !validMoney(p.income) || !Array.isArray(p.categories)) throw new Error('Stored paycheck data is invalid.')
    ids.add(p.id)
    const categories = new Set<string>()
    for (const c of p.categories) {
      if (!c || typeof c.id !== 'string' || categories.has(c.id) || typeof c.name !== 'string' || !validMoney(c.allocation) || !['spending', 'reserved', 'savings'].includes(c.kind)) throw new Error('Stored category data is invalid.')
      categories.add(c.id)
    }
  }
  const transactions = new Set<string>()
  for (const t of data.transactions) {
    if (!t || typeof t.id !== 'string' || transactions.has(t.id) || !validDate(t.date) || !validMoney(t.amount) || typeof t.description !== 'string' || !data.periods.some(p => p.id === t.periodId && p.categories.some(c => c.id === t.categoryId))) throw new Error('Stored transaction data is invalid.')
    transactions.add(t.id)
  }
  return data
}
export function saveData(data: FinanceData) { localStorage.setItem(KEY, JSON.stringify(data)) }
