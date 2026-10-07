# TradeMirror

Phase-one frontend foundation for an Indian options trading journal. Dark responsive Next.js App Router interface with TypeScript, Tailwind CSS, Recharts, and Lucide icons.

## Run locally

Use Node.js 20.19 or newer (Node 24 recommended).

```sh
npm install
npm run dev
```

Open http://localhost:3000. If using nvm, run `nvm use` first (`.nvmrc` selects Node 24). This machine's default Node 20.14 is too old. You can also use the existing bundled runtime:

```sh
PATH=/Users/vikramjeetsingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run dev
```

Additional checks:

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## Routes

`/` landing; `/login`, `/signup` account UI; `/dashboard` performance overview; `/trades` searchable, filterable journal; `/trades/tm-1` trade detail; `/import` broker and CSV preview; `/insights` sample behaviour analysis; `/reports` daily and weekly reviews; `/settings` profile and broker connection preview.

## Architecture

- `types/index.ts`: user-owned normalized trades, orders, metrics, insights, report states, broker connections. Broker raw payloads are referenced separately through `rawDataId`.
- `lib/brokers/adapter.ts`: future broker adapter contract. Implementations belong in `lib/brokers/adapters`.
- `lib/analytics/format.ts`: INR and IST formatting. Future deterministic matching and analytics belong in this directory, separate from UI and AI.
- `data/mock.ts`: all sample trade, chart, report, score, and insight fixtures. Dated 1–7 October 2026; not live data.
- `components/`: reusable UI, charts, journal, reports, broker cards, and app shell.
- `app/(workspace)/`: shared responsive demo layout with public routes, loading UI, and invalid trade handling.

## Intentional preview limitations

No Supabase connection, persistence, real authentication, broker API/OAuth, CSV parsing, charge engine, P&L engine, AI API, payment system, scheduler, or notifications. Auth forms perform browser validation and show a preview notice; credentials are never transmitted. Selected CSV files stay local and are not parsed; preview rows are fixed fixtures. Notes only remain in the mounted page session. Connect buttons explain future availability. AI generation and PDF export are disabled. No trading execution or signals.

The dashboard selector changes summary cards between sample day and week; charts and breakdowns explicitly show the sample week. Scores are illustrative, not derived from profits or real rule adherence. MFE, MAE, planned risk, and violation fields remain unavailable rather than fabricated.

Reports model `PROVISIONAL` and `FINAL` separately. Finalization must require confirmed broker data, never a hard-coded clock time. Demo report totals are fixture values, and costs are estimated.

## Next implementation step

Add Supabase Auth, user-isolated tables and row-level policies, then a validated Zerodha CSV import pipeline with duplicate protection. Follow with deterministic trade matching and analytics tests before real broker connections or AI interpretation. AI should consume computed metrics rather than calculate trading results.

## Dependency audit

The current Next.js ESLint configuration includes a development-only `braces` dependency advisory (five transitive audit entries). npm offers only a framework lint-config downgrade as its automated fix. Production dependency audit is clean; recheck the lint toolchain when an upstream fix is released.
