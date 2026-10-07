# TradeMirror

### Understand your trades. Improve your edge.

**A clearer view of your trading — from executions and costs to the patterns behind your decisions.**

TradeMirror is being built as a trading journal and performance analytics platform for Indian options traders. The goal is to bring trade history, charges-aware P&L, session comparisons, and AI-assisted behavioural reviews into one focused workspace.

> **Current status: Phase 1 complete · frontend demo · version 0.1.0.**
> All dashboard numbers, reports, scores, and insights are sample data. Real accounts, imports, broker syncing, and AI generation are planned, not active.

![TradeMirror dashboard preview](public/dashboard-preview.jpg)

## Product flow

### What works today

```text
Landing page → Explore demo → Dashboard
                              ├─ Search/filter trades → Trade detail → Demo notes
                              ├─ Import preview → Broker card / local CSV selection
                              ├─ Sample behaviour insights
                              ├─ Daily / weekly report previews
                              └─ Settings & report lifecycle explanation
```

Login and signup have validated frontend forms. They show a preview notice and do not create accounts or send credentials. CSV selection stays local; the preview rows are fixed fixtures.

### Planned end-to-end experience

```text
Sign up / log in
      ↓
Upload Zerodha tradebook → Preview → Validate → Deduplicate → Import
      ↓
Normalize executions → Match trades → Calculate metrics in code
      ↓
Dashboard → Trade details & notes → Behaviour insights → Daily / weekly review
```

A later broker workflow will add:

```text
Connect broker → Sync executed trades → Provisional daily report
                                              ↓
                             Reconcile confirmed final broker data
                                              ↓
                                  Finalized report → Updated review
```

Charges remain estimated while a report is `PROVISIONAL`. A report becomes `FINAL` only when confirmed final broker data is available. Finalization will not depend on a hard-coded time such as 7:30 PM. Exact broker capabilities and data availability must be verified during integration.

## What is built

| Area | Current behaviour |
| --- | --- |
| Landing | Product introduction, workflow, demo and signup entry points |
| Dashboard | Eight summary cards; daily and cumulative P&L charts; session, instrument, CE/PE breakdowns; sample discipline score; best/worst and recent trades |
| Journal | Instrument search; instrument, CE/PE, result, session, and date filters; reset and empty states |
| Trade detail | Prices, quantities, timestamps, estimated costs, holding time, sample behaviour review, session-only notes |
| Imports | Broker connection preview; local CSV selection and illustrative preview table |
| Insights | Sample observations about timing, instruments, holding periods, costs, and journal process |
| Reports | Daily / weekly tabs; provisional status; summary and review prompts |
| Settings | Demo profile, broker connection card, provisional/final lifecycle |
| Foundation | Responsive navigation, loading UI, invalid-trade 404, normalized types, broker adapter contract |

The dashboard period selector changes summary cards between the sample day and week. Charts and breakdowns are explicitly labeled as the sample week. Fixtures cover 1–7 October 2026; they are not live market data.

## Version roadmap

The roadmap is a proposed sequence, not a release-date commitment. Later versions will be refined after the previous milestone is validated.

### V1 — A reliable trading journal

**Target:** upload a Zerodha CSV and review a trustworthy performance dashboard, with a target of approximately 30 seconds for a typical tradebook. This target is not yet measured.

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Frontend foundation, design, routes, sample data, normalized types | **Complete** |
| 2 | Supabase authentication, PostgreSQL schema, user isolation and access policies | Next |
| 3 | Zerodha CSV parsing, validation, import history, duplicate protection | Planned |
| 4 | Deterministic trade matching, partial fills, open positions, reconciliation | Planned |
| 5 | P&L and cost analytics with explicit estimated / confirmed cost handling | Planned |
| 6 | Connect the dashboard and filters to actual user data | Planned |
| 7 | Persistent notes and trade detail metrics supported by available data | Planned |
| 8 | AI behaviour interpretation from computed, structured metrics | Planned |
| 9 | Daily / weekly review generation and report history | Planned |
| 10 | End-to-end validation, security checks, deployment and onboarding | Planned |

### V1.1 — Zerodha sync & final reports

- Verify supported broker APIs and authorization requirements, then implement the first adapter.
- Import executed trades and reconcile them with existing imports without duplicates.
- Support repeated synchronization, connection expiry, retries, and visible sync status.
- Refresh provisional reports when confirmed final data becomes available.
- Preserve report revisions so users can understand why net P&L changed.

Broker sync follows a reliable normalized import and matching engine. No real broker connection exists yet.

### V2 — A stronger review workflow

Proposed scope:

- Persistent trading plans and journal tags, with comparison against recorded rules.
- Evidence-based discipline scoring with transparent definitions and sufficient input data.
- Longer-term session, instrument, cost, and holding-time comparisons.
- Review history, PDF export, and user-controlled reminders.
- Additional broker adapters after verifying their supported data and integration requirements.

MFE, MAE, early-exit flags, and stop-loss violations will require suitable price or plan data. Missing inputs must remain unavailable rather than inferred from a tradebook alone.

### V3 — A mature performance workspace

Proposed direction, subject to user feedback:

- Unified history and reconciliation across supported brokers.
- Configurable review rules and personal progress tracking over time.
- Longitudinal coaching grounded in verified metrics and journal context.
- Reliable background synchronization, observability, and data-quality tooling.
- Production SaaS operations: billing, account export/deletion, recovery, and scale testing.

The product remains focused on trading reflection and analytics. Live signals, buy/sell recommendations, and automated order execution are outside the current roadmap.

## Development & delivery flow

Each phase follows the same loop:

1. Define the phase scope and acceptance criteria.
2. Implement the smallest complete milestone.
3. Run checks appropriate to the change; validate relevant UI and data behaviour.
4. Update this README with completed work, current limitations, validation results, and the next phase.
5. Commit the verified phase and push it to `main` in this repository.

Phase-by-phase pushes are authorized for this project. Each completion update should include the commit and any remaining blockers. Secrets, credentials, environment files, build outputs, and installed dependencies must not be committed. Publishing/deployment remains a separate action from a Git push.

## Progress log

| Milestone | Date | Result |
| --- | --- | --- |
| Phase 1: frontend foundation | 7 October 2026 | All requested demo routes built; lint, TypeScript, production build, route checks, journal filters, report tabs, and mobile navigation verified. Initial implementation commit: `be1d940`. |
| Documentation & roadmap | 7 October 2026 | Added current/planned product flows, V1–V3 roadmap, delivery workflow, limitations, and project description. |

**Current work:** Phase 1 is complete; this update documents the roadmap. Phase 2 has not started.

**Next implementation step:** Supabase authentication and user-isolated database storage, followed by the validated Zerodha CSV pipeline.

## Run locally

Use **Node.js 20.19 or newer**; Node 24 is recommended and selected by `.nvmrc`.

```sh
# If using nvm:
nvm use

npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). For an existing lockfile, `npm ci` gives a reproducible install.

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

`npm start` runs the production build; run `npm run build` first. No API keys or environment variables are required for the current demo.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login`, `/signup` | Account form previews |
| `/dashboard` | Performance overview |
| `/trades` | Searchable and filterable journal |
| `/trades/tm-1` | Example trade detail; sample IDs `tm-1` through `tm-8` |
| `/import` | Broker / CSV preview |
| `/insights` | Sample behaviour insights |
| `/reports` | Daily / weekly previews |
| `/settings` | Profile and broker connection preview |

## Stack & architecture

Current stack: Next.js 16.4 App Router, React, TypeScript, Tailwind CSS, Recharts, and Lucide. Planned services: Supabase Auth / PostgreSQL and an AI interpretation API.

| Location | Responsibility |
| --- | --- |
| `app/(workspace)/` | Shared demo layout and workspace routes |
| `components/` | Reusable UI, charts, journal, reports, and broker cards |
| `types/index.ts` | Normalized trades, orders, users, connections, metrics, insights, and report states |
| `data/mock.ts` | Sample fixtures, separate from components |
| `lib/analytics/` | Formatting today; deterministic matching and analytics in later phases |
| `lib/brokers/adapter.ts` | Future broker adapter contract |

Future implementations belong in `lib/brokers/adapters/`. Normalized trades must remain independent of broker payloads; `rawDataId` provides a reference for separately stored raw records. Database migrations and row-level policies will be added in Phase 2.

### Core rules

- Calculate metrics in deterministic code; let AI interpret structured results.
- Keep calculation engines outside UI components.
- Isolate data by authenticated user and enforce access at the database layer.
- Keep estimated charges visibly distinct from confirmed charges.
- Finalize reports using confirmed data availability, not a fixed clock time.
- Store unavailable metrics as unavailable; do not fabricate discipline or excursion signals.

## Current limitations

No Supabase connection, persistence, real authentication, broker OAuth/API, CSV parsing, matching engine, production P&L or charges engine, AI generation, payments, notifications, cron jobs, or background workers.

Auth forms validate inputs locally and show a preview notice. Files are not uploaded or parsed. Trade notes only remain in the mounted page session. Connect buttons explain future availability; AI generation and PDF export are disabled. Workspace routes are public demo pages. Scores are illustrative rather than computed from rule adherence.

## Validation & dependency status

At Phase 1 completion:

- Lint, TypeScript, and production build passed.
- All main routes returned HTTP 200; unknown trade URLs returned HTTP 404.
- Journal filters, trade detail navigation, report tabs, and mobile navigation were checked in the browser.
- Production dependency audit reported zero vulnerabilities.
- The Next.js ESLint toolchain had a development-only `braces` advisory with five transitive audit entries. The offered automated fix was a lint-config downgrade; an upstream fix should be reviewed before changing the toolchain.

These are recorded validation results, not a continuous assurance. Re-run relevant checks as dependencies and implementations change.
