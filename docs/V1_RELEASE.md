# Free-only V1 release acceptance

Current scope: authentication, deduplicated CSV imports, exact FIFO gross analytics, mobile journal, notes/tags/custom plan, date-scoped strategy reviews, daily/weekly reports, immutable report snapshots, journal/plan export and Zerodha F&O statement-level charges/net.

Computed review prompts need no AI API key. Paid AI is excluded from this edition and disabled server-side by default, even when credentials exist. Keep `TRADEMIRROR_ENABLE_PAID_AI` unset/false. A future paid integration requires separate explicit authorization.

## Acceptance matrix — 15 October 2026

| Check | Evidence / status |
| --- | --- |
| App checks | 57 tests, lint, TypeScript and Webpack production build pass |
| Owner snapshot save/reopen/deduplication | Passed in hosted account on 10 October; unchanged evidence reused one snapshot after refresh |
| Direct report JSON/CSV | Implemented HTTP attachments; local production HTTP requests received real files on disk |
| Report content | Independent Python Decimal/CSV comparison matched 12 synthetic slices and exact gross INR 890 to JSON; BOM/cost limits checked |
| Account download protection | Signed-out request returns 401; owner-scoped selection and demo separation tested; no partial attachment on invalid/failing requests |
| Reports integration | Server-rendered page includes correct download links and free computed prompts; interactive browser acceptance pending |
| Hosted download | Public demo JSON/CSV attachments received after rollout; independent CSV/JSON comparison passed, and signed-out account access returned 401. Signed-in browser receipt remains pending |
| Private journal/plan export | Direct authenticated HTTP attachment implemented; complete owner export, pagination, exact evidence, unlinked notes, row/byte/read errors and response mapping tested; actual signed-in file receipt pending |
| Saved snapshot/statement JSON | Direct owner-and-ID-scoped HTTP attachment implemented; frozen snapshot metadata/payload and parsed statement values tested; signed-in file receipt pending |
| Real Zerodha workbook | Stricter parser compatibility and independent source-cell Decimal comparison passed locally on 15 October; original bytes unchanged; hosted upload/save/reload pending |
| Statement action persistence | Synthetic XLSX → actual server actions → local PostgreSQL migration passes preview/no-write, confirmation, deduplicated save/reload, owner isolation and failed-import/no-write checks; hosted acceptance pending |
| Print/PDF | Control implemented; print artifact/layout acceptance pending |
| Mobile | Earlier emulated workspace checks passed; current export interaction and physical-device acceptance pending |

Browser-control tools are unavailable in this session. Earlier Chrome file upload was blocked by missing extension file URL access. Neither condition is a reason to mark unperformed UI checks as passed. No private account data, credentials or source workbook is included in the repository or synthetic receipt artifacts.

## Owner acceptance steps

1. Reports: choose a period and download JSON/CSV. These downloads recompute current server history; refresh after new imports. Verify the downloaded values and period against the current report. Frozen snapshot JSON continues to export the saved payload.
2. Settings: download journal JSON and inspect notes, tags, checklist answers, plan and linked/unlinked evidence.
3. Costs: select the original Zerodha F&O P&L XLSX, inspect the preview and mismatch warnings, confirm ownership, save and reload. This sends financial data to the configured TradeMirror server/Supabase account. Do not treat a local parse as proof of hosted persistence.
4. Use report Print/PDF and inspect the resulting pages on the actual device. Test phone navigation, file selection and downloads on iOS/Android.

## Limits

- Statement net excludes unrealized P&L and is not allocated to FIFO slices or days. User-supplied statements are not independently certified. Missing history and settlement treatment can change reconciliation.
- Only the supported original Zerodha F&O XLSX layout is accepted; other brokers/segments/layout changes fail visibly.
- Snapshot history shows the latest 100 records. Statement history shows the latest 20 individually, without summing overlapping periods.
- Journal export stops visibly above 1,000 annotations or 5 MB instead of returning a partial copy. It is not a full account backup; original CSV/workbooks and raw execution history are not included, and restore is unsupported.
- Physical-mobile, hosted private export and print acceptance cannot be inferred from unit tests or local HTTP receipts.

The original report/statement migration is applied. This download phase introduces no database migration or expanded permission grants. Broker sync, MFE/MAE/replay, richer plans and V2/V3 remain planned.

## Private attachment phase — 15 October 2026

Settings, saved snapshots and saved statements use normal download links to authenticated file endpoints. The endpoints return no-store JSON attachments on success and safe errors without attachments on failure. Record kind and UUID are validated, and owner identity comes only from the server session. Missing and other-owner records are indistinguishable. Stored snapshot metadata must match its validated payload; exports preserve its frozen evidence rather than recomputing it. Statement exports exclude the original workbook/client identifier.

Journal exports retain the existing complete-export limits. HTTP status 401 denotes missing auth; malformed selections return 400, unknown/non-owned saved records 404, invalid stored evidence 422, journal size limits 413 and read failures 503. These checks add no write permissions or database migrations.

Five new route tests use synthetic records. Real saved-record/statement persistence and signed-in file receipt are not claimed by these tests. The current browser-tool limitation remains; finish owner/device acceptance before fully accepting V1.

Local production HTTP verification: journal, snapshot and statement endpoints returned 401 without credentials; malformed saved-record input returned 400. All errors had no attachment, no-store caching and MIME sniffing protection. The existing public demo report download still returned its expected synthetic summary. Successful signed-in private file receipt remains pending.

Hosted follow-up: after rollout, journal, saved-snapshot and saved-statement export endpoints all returned 401 without credentials, with no attachment and no-store caching. This verifies hosted access denial only; successful owner download remains pending.

## Ledger validation and statement persistence — 15 October 2026

A supplied other-debit/credit ledger is verified even when the summary adjustment is zero. Offsetting entries remain valid, while inconsistent totals, negative debit/credit columns, missing/impossible/out-of-period posting dates and ambiguous headings fail. A zero summary with no ledger sheet remains supported. Stored records reject impossible dates, negative fees and duplicate charge/instrument labels. Original workbook compatibility was rechecked locally; no upload occurred.

A new integration test feeds synthetic XLSX bytes through the actual preview/save/load actions into PostgreSQL running the actual migration. Its Supabase-shaped adapter is local; it does not prove a successful Supabase network call or browser upload. Preview leaves storage empty, confirmation is required, repeated bytes reuse the saved record and timestamp, reloading preserves exact amounts, owners stay separate, and invalid files do not change saved history. All 57 tests plus required app checks pass.

Production-build HTTP smoke checks passed for the synthetic costs page, protected Costs redirect and unauthenticated statement-download denial. No production data, schema grants or paid-service settings changed. Real owner hosted upload, signed-in download receipt and physical device/print acceptance remain pending.
