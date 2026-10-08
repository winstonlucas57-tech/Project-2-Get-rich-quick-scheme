// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { loadData } from './lib/storage'
beforeEach(() => localStorage.clear())
afterEach(cleanup)
it('creates a paycheck and category, adds and edits an expense, persists on reload, and deletes it', async () => {
  const user = userEvent.setup()
  const rendered = render(<App />)
  expect(screen.getByText('A clear plan for your next paycheck.')).toBeTruthy()
  await user.click(screen.getByText('Create your first paycheck'))
  await user.type(screen.getByLabelText('Take-home amount (USD)'), '2000')
  await user.click(screen.getByText('Save paycheck'))
  await user.click(screen.getByText('Create a category'))
  await user.type(screen.getByLabelText('Category name'), 'Groceries')
  await user.type(screen.getByLabelText('Allocation (USD)'), '300')
  await user.click(screen.getByText('Save category'))
  await user.click(screen.getByRole('button', { name: 'Transactions' }))
  await user.click(screen.getByRole('button', { name: 'Add expense' }))
  await user.type(screen.getByLabelText('Expense amount (USD)'), '25.29')
  await user.type(screen.getByLabelText('Description'), 'Market trip')
  await user.click(screen.getByText('Save expense'))
  expect(loadData().transactions[0].amount).toBe(2529)
  await user.click(screen.getByLabelText('Edit Market trip'))
  await user.clear(screen.getByLabelText('Expense amount (USD)'))
  await user.type(screen.getByLabelText('Expense amount (USD)'), '30.01')
  await user.click(screen.getByText('Save expense'))
  rendered.unmount()
  render(<App />)
  expect(screen.getByText('Market trip')).toBeTruthy()
  const remaining = screen.getByText('Spending budget left').closest('section')!
  expect(within(remaining).getByText('$269.99')).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Transactions' }))
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  await user.click(screen.getByLabelText('Delete Market trip'))
  expect(loadData().transactions).toHaveLength(0)
  vi.restoreAllMocks()
})
it('preserves corrupt stored data and blocks overwriting it', () => {
  localStorage.setItem('paywise.finance.v1', 'broken')
  render(<App />)
  expect(screen.getByRole('alert').textContent).toContain('has not been overwritten')
  expect((screen.getByText('Create your first paycheck') as HTMLButtonElement).disabled).toBe(true)
  expect(localStorage.getItem('paywise.finance.v1')).toBe('broken')
})
