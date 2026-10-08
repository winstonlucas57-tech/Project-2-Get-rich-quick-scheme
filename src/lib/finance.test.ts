import { describe, expect, it } from 'vitest'
import { cents, totals, monthlyReport, type Period } from './finance'
const period: Period = { id: 'p', date: '2026-10-01', income: 200000, categories: [{ id: 'food', name: 'Food', kind: 'spending', allocation: 50000 }, { id: 'rent', name: 'Rent', kind: 'reserved', allocation: 100000 }, { id: 'save', name: 'Savings', kind: 'savings', allocation: 20000 }] }
describe('money and budgeting', () => {
  it('parses decimal dollars exactly', () => { expect(cents('0.29')).toBe(29); expect(cents('12.1')).toBe(1210); expect(() => cents('1.001')).toThrow(); expect(() => cents('-2')).toThrow(); expect(() => cents('1e3')).toThrow() })
  it('computes reservations and unallocated cash', () => { expect(totals(period, [])).toMatchObject({ spent: 0, unallocated: 30000, remaining: 50000, available: 80000 }) })
  it('does not deduct paid bills twice and excludes other paychecks', () => { const t = totals(period, [{ id: 't', periodId: 'p', categoryId: 'rent', date: '2026-10-02', description: 'Rent', amount: 100000 }, { id: 'x', periodId: 'other', categoryId: 'food', date: '2026-10-02', description: 'Other', amount: 5000 }]); expect(t.available).toBe(80000); expect(t.spent).toBe(100000) })
  it('recomputes edits, deletion, and overspending', () => { const tx = { id: 't', periodId: 'p', categoryId: 'food', date: '2026-10-02', description: 'Food', amount: 60000 }; expect(totals(period, [tx]).remaining).toBe(-10000); expect(totals(period, [{ ...tx, amount: 1000 }]).remaining).toBe(49000); expect(totals(period, []).remaining).toBe(50000) })
  it('reports by calendar date independently of paycheck assignment', () => { expect(monthlyReport({ version: 1, periods: [period], transactions: [{ id: 't', periodId: 'p', categoryId: 'food', date: '2026-11-01', description: 'Food', amount: 1000 }] }, '2026-10')).toEqual({ income: 200000, spending: 0, net: 200000 }) })
})
