export type Category = { id: string; name: string; allocation: number; kind: 'spending' | 'reserved' | 'savings' }
export type Period = { id: string; date: string; income: number; categories: Category[] }
export type Transaction = { id: string; periodId: string; categoryId: string; date: string; description: string; amount: number }
export type FinanceData = { version: 1; periods: Period[]; transactions: Transaction[] }
export const emptyData: FinanceData = { version: 1, periods: [], transactions: [] }
export function cents(input: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(input.trim())) throw new Error('Enter a positive amount with at most two decimal places.')
  const [whole, fraction = ''] = input.trim().split('.')
  const value = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  if (!Number.isSafeInteger(value) || value > 100_000_000_000) throw new Error('Amount is too large.')
  return value
}
export const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value / 100)
export const dateLabel = (value: string) => new Date(value + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
export function totals(period: Period, transactions: Transaction[]) {
  const entries = transactions.filter(t => t.periodId === period.id)
  const spentIn = (id: string) => entries.filter(t => t.categoryId === id).reduce((sum, t) => sum + t.amount, 0)
  const allocated = period.categories.reduce((sum, c) => sum + c.allocation, 0)
  const spent = entries.reduce((sum, t) => sum + t.amount, 0)
  const remaining = period.categories.filter(c => c.kind === 'spending').reduce((sum, c) => sum + c.allocation - spentIn(c.id), 0)
  // A paid reserved bill consumes its reservation, so it is not deducted twice.
  const held = period.categories.filter(c => c.kind !== 'spending').reduce((sum, c) => sum + Math.max(0, c.allocation - spentIn(c.id)), 0)
  return { spent, allocated, unallocated: period.income - allocated, remaining, available: period.income - spent - held, spentIn }
}
export function monthlyReport(data: FinanceData, month: string) {
  const income = data.periods.filter(p => p.date.startsWith(month)).reduce((s, p) => s + p.income, 0)
  const spending = data.transactions.filter(t => t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0)
  return { income, spending, net: income - spending }
}
