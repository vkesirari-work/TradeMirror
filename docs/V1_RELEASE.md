# V1 release acceptance

Implemented: authentication, deduplicated CSV imports, exact FIFO gross analytics, mobile journal, notes/tags/plans, date-scoped strategy reviews, daily/weekly reports, immutable snapshots, journal JSON export, Zerodha statement costs/net and consent-based aggregate AI adapter.

## Activation and acceptance

- Migration `202610100004_report_snapshots.sql` is applied to the connected Supabase project.
- Configure server-only `OPENAI_API_KEY` and `OPENAI_MODEL` in Vercel/server environment; never use NEXT_PUBLIC or paste the key into chat. Choose a Responses-compatible model supporting structured output. Live provider acceptance is pending.
- Reports: save a selected period, reload history, reopen it and verify unchanged evidence reuses the snapshot.
- Import → broker statements: preview the owner's original Zerodha F&O P&L XLSX, inspect totals/mismatches, confirm ownership, save and reload. This sends private financial data to TradeMirror and the configured Supabase account. The agent has validated the source locally only.
- Generate an AI review after explicit aggregate-sharing consent; verify three evidence-linked reflections/questions. Mock tests are not live provider acceptance.
- Download journal/plan JSON and inspect linked/unlinked evidence. Restore is unsupported. Browser print/PDF output and physical mobile acceptance remain to be checked.

## Limits

Only the supported original Zerodha F&O XLSX layout is accepted. Statement net excludes unrealized P&L and is not allocated to FIFO slices or days. The uploaded report is not independently certified. Missing history and settlement treatment can change reconciliation.

Snapshot history shows the latest 100 entries; broker statement history the latest 20, individually without summing overlapping periods. Journal export fails visibly above 1,000 annotations or 5 MB instead of truncating. It is not a full account backup.

AI uses structured OpenAI Responses output with store:false; provider data policies still apply. Five attempts per UTC day and 90 seconds between attempts, including failed calls. Only period aggregates are shared, without CSV, symbols, notes, tags or account identity.

Validation: 44 tests, lint, TypeScript and Webpack build; local date/tag drilldown, hydrated daily report tabs, fictional cost reconciliation and phone layout without page overflow. Browser download receipt was not captured (the browser download event timed out); downloaded-file acceptance remains pending. Hosted save/reload, owner statement upload and live AI must be verified before claiming fully accepted V1.

Official references: [text generation](https://developers.openai.com/api/docs/guides/text) and [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
