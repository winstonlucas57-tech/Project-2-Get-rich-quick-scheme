# Paywise

A personal finance learning project built with React, TypeScript, Vite, and Tailwind CSS. No bank connections, accounts, subscriptions, or server are implemented.

## Run locally

Use Node.js 24 (the version verified for this project) and npm.

```sh
npm ci
npm run dev
```

Open the address Vite prints in your own local development environment. To check the project:

```sh
npm test
npm run lint
npm run build
```

`npm run preview` serves the production build after building. In a cloud machine whose home directory is read-only, use `npm --cache /tmp/finance-npm ci`.

## File structure

- `src/App.tsx`: navigation, paycheck/category/expense forms, and page composition.
- `src/components/ui.tsx`: reusable cards, metric tiles, and allocation progress bars.
- `src/lib/finance.ts`: data types, exact dollar-to-cent conversion, paycheck totals, and calendar-month reporting. It has no dependency on React or browser storage.
- `src/lib/storage.ts`: the versioned browser persistence adapter. Replace this boundary with an authenticated database API later.
- `src/App.css` and `src/index.css`: responsive visual styles and Tailwind entry point.
- `src/lib/finance.test.ts` and `src/App.test.tsx`: calculation tests and the entry/edit/reload/delete workflow.

## How it works

The first visit has no fabricated data. Add a take-home paycheck, then give it categories with spending, reserved-expense, or planned-savings allocations. Paychecks are separate plans; enter two per month or any other schedule and use the selector to review old plans. Allocations can be edited, and over-allocation is flagged.

Transactions are expenses with a reference to a paycheck and one of its categories. Adding, editing, or deleting an expense saves a new data snapshot, then React recalculates every displayed total. Totals are derived, never stored as a second copy that could become stale. Expenses can have a different date than the paycheck: paycheck reports follow assignment, monthly reports follow actual entry dates.

Money is stored in integer cents. A dollar input is parsed as a decimal string, rejecting negatives, more than two decimal places, and excessively large amounts. Arithmetic adds and subtracts cents, converting to formatted dollars only for display. This version uses USD only.

- **Unallocated:** paycheck income minus all category allocations.
- **Spending budget left:** spending category allocations minus expenses in those categories. May be negative.
- **Available:** income minus every recorded expense minus unspent reserved-expense and savings allocations. Paying a reserved bill consumes its reservation, avoiding double subtraction.
- **Monthly net cash flow:** dated paycheck income minus dated expenses. Savings allocations are plans, not verified transfers or account balances.

## Storage and limitations

Data lives under `paywise.finance.v1` in localStorage, in this browser profile on this site's origin. It survives refresh and ordinary browser restarts, but does not synchronize between devices or browsers. Clearing site data, using private browsing, or changing the site's address can make it unavailable. There is no backup/export feature yet. Do not rely on this prototype as your only financial record. Browser storage is not encrypted by the app, and anyone with access to the browser profile can access it. No bank credentials are requested or stored.

Saves happen before the screen updates. Storage failures display an error without accepting unsaved changes. Unreadable saved data is left untouched and writes are blocked. Goals currently show planned contributions for the selected paycheck; Insights provides basic monthly totals. Refunds, additional income sources, account balances, category deletion, paycheck editing, and custom currencies are future work.

## Next milestone

Add export/import with validation and migrations, followed by explicit savings goals and richer monthly category reports. Before introducing user accounts and a server, define ownership, authorization, backup, and privacy requirements. Later integrations should use dedicated adapters for bank syncing and subscriptions, keeping the calculation module independent.
