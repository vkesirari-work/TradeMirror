# Free-only V1 release acceptance

Implemented: authentication, deduplicated CSV imports, exact FIFO gross analytics, mobile journal, notes/tags/plans, date-scoped strategy reviews, daily/weekly reports, immutable snapshots, journal JSON export, Zerodha statement costs/net and consent-based aggregate AI adapter.

## Current scope

The owner selected free-only V1. Computed reviews are primary; paid AI controls are removed from Reports and the server adapter is disabled by default. No API key or billing setup is required. Future paid AI needs explicit authorization and `TRADEMIRROR_ENABLE_PAID_AI=true`; keep this unset/false now.

## Activation and acceptance

- Migration `202610100004_report_snapshots.sql` is applied to the connected Supabase project.
- Paid AI is excluded from this edition; do not configure paid credentials to finish free-only V1.
- Reports: save a selected period, reload history, reopen it and verify unchanged evidence reuses the snapshot.
- Import → broker statements: preview the owner's original Zerodha F&O P&L XLSX, inspect totals/mismatches, confirm ownership, save and reload. This sends private financial data to TradeMirror and the configured Supabase account. The agent has validated the source locally only.
- Computed results-based prompts are available without an AI provider. Optional paid adapter acceptance is deferred.
- Download journal/plan JSON and inspect linked/unlinked evidence. Restore is unsupported. Browser print/PDF output and physical mobile acceptance remain to be checked.

## Limits

Only the supported original Zerodha F&O XLSX layout is accepted. Statement net excludes unrealized P&L and is not allocated to FIFO slices or days. The uploaded report is not independently certified. Missing history and settlement treatment can change reconciliation.

Snapshot history shows the latest 100 entries; broker statement history the latest 20, individually without summing overlapping periods. Journal export fails visibly above 1,000 annotations or 5 MB instead of truncating. It is not a full account backup.

AI uses structured OpenAI Responses output with store:false; provider data policies still apply. Five attempts per UTC day and 90 seconds between attempts, including failed calls. Only period aggregates are shared, without CSV, symbols, notes, tags or account identity.

Validation: 44 tests, lint, TypeScript and Webpack build; local date/tag drilldown, hydrated daily report tabs, fictional cost reconciliation and phone layout without page overflow. Browser download receipt was not captured (the browser download event timed out); downloaded-file acceptance remains pending. Snapshot save/reload passed in the hosted update below. Owner statement upload and remaining export/device acceptance must be verified before claiming fully accepted free-only V1.

Official references: [text generation](https://developers.openai.com/api/docs/guides/text) and [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

Hosted rollout verification: the new synthetic costs route renders and reconciles 48 fictional slices. Authenticated Reports shows the new snapshot/AI controls, and loading saved history returns an empty owner history without a setup error. Snapshot writes and private statement upload are awaiting specific upload acceptance; they have not been performed by the agent.

## Hosted acceptance update — 10 October 2026

- **Passed:** save a current weekly owner snapshot, save unchanged evidence again, reload the Reports page, load history and reopen the same snapshot. One history row remains, with the original creation time and unchanged summary/daily values. The saved review remains in the owner's account; no executions or annotations were edited.
- **Blocked by browser setup:** real workbook selection through the Chrome extension fails because file URL access is not enabled. The agent did not transmit or save the workbook. The owner can select the file manually on `/costs`, or enable the extension's file-upload permission according to the official guide.
- **Pending owner setup:** OpenAI API key/model are not configured yet. Live generation is not accepted. API billing is separate from ChatGPT; no API purchase or new secret was created by the agent.
- **Pending acceptance:** actual export receipt/content, print/PDF and physical mobile checks. A print-button automation attempt timed out; no successful print artifact is claimed.

### Optional future paid AI activation steps (not required for free V1)

1. Sign in to [OpenAI API Keys](https://platform.openai.com/api-keys) and create a project secret key. Keep it private; never paste it into chat or commit it.
2. Set `OPENAI_API_KEY` in TradeMirror's Vercel server environment. Add `OPENAI_MODEL=gpt-4.1-mini` as one supported initial test option; account access still depends on the API project.
3. Complete required API billing yourself. [API and ChatGPT billing are separate](https://help.openai.com/en/articles/9039756-billing-settings-in-chatgpt-vs-platform). The agent will not purchase credits or accept billing terms for you.
4. Redeploy through the normal project workflow so new environment variables take effect, then generate a selected-period review after aggregate-sharing consent.

[GPT-4.1 mini documentation](https://developers.openai.com/api/docs/models/gpt-4.1-mini) lists Responses and structured-output support. Provider output still needs live acceptance; a configured key alone is not proof of a passing review.

Latest free-only validation: 46 tests and app checks pass. Default-off paid guard is verified even with dummy provider credentials configured. Journal export ownership, exact evidence, pagination and row/byte/read failure cases are now tested. No actual paid provider calls were made.
