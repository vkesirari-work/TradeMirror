# Free-only V1 release acceptance

Current scope: authentication, deduplicated CSV imports, exact FIFO gross analytics, mobile journal, notes/tags/custom plan, date-scoped strategy reviews, daily/weekly reports, immutable report snapshots, journal/plan export and Zerodha F&O statement-level charges/net.

Computed review prompts need no AI API key. Paid AI is excluded from this edition and disabled server-side by default, even when credentials exist. Keep `TRADEMIRROR_ENABLE_PAID_AI` unset/false. A future paid integration requires separate explicit authorization.

## Acceptance matrix — 15 October 2026

| Check | Evidence / status |
| --- | --- |
| App checks | 64 tests, lint, TypeScript and Webpack production build pass |
| Owner snapshot save/reopen/deduplication | Passed in hosted account on 10 October; unchanged evidence reused one snapshot after refresh |
| Direct report JSON/CSV | Implemented HTTP attachments; local production HTTP requests received real files on disk |
| Report content | Independent Python Decimal/CSV comparison matched 12 synthetic slices and exact gross INR 890 to JSON; BOM/cost limits checked |
| Account download protection | Signed-out request returns 401; owner-scoped selection and demo separation tested; no partial attachment on invalid/failing requests |
| Reports integration | Server-rendered page includes native download links, request feedback and dedicated print navigation; browser error screens provide login/retry/back; interactive acceptance pending |
| Hosted download | Public demo JSON/CSV attachments received after rollout; independent CSV/JSON comparison passed, and signed-out account access returned 401. Signed-in browser receipt remains pending |
| Private journal/plan export | Direct authenticated HTTP attachment implemented; complete owner export, pagination, exact evidence, unlinked notes, row/byte/read errors and response mapping tested; actual signed-in file receipt pending |
| Saved snapshot/statement JSON | Direct owner-and-ID-scoped HTTP attachment implemented; frozen snapshot metadata/payload and parsed statement values tested; signed-in file receipt pending |
| Real Zerodha workbook | Stricter parser compatibility and independent source-cell Decimal comparison passed locally on 15 October; original bytes unchanged; hosted upload/save/reload pending |
| Statement action persistence | Synthetic XLSX → actual server actions → local PostgreSQL migration passes preview/no-write, confirmation, deduplicated save/reload, owner isolation and failed-import/no-write checks; hosted acceptance pending |
| Print/PDF | Dedicated current-period and frozen-snapshot views implemented; demo HTML, data integrity and private login redirects verified locally; actual dialog/PDF visual acceptance pending |
| Mobile | Earlier emulated workspace checks passed; current export interaction and physical-device acceptance pending |

Browser control became available for the owner follow-up below. Chrome file upload remains blocked by missing extension file URL access. Neither condition is a reason to mark unperformed UI checks as passed. No private account data, credentials or source workbook is included in the repository or synthetic receipt artifacts.

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

## Eight-step print/download batch — 15 October 2026

- Native export links have live request feedback. The message never claims the file was received. Browser failures use escaped HTML with login/retry/back controls, no-store caching and a restrictive content security policy. API errors remain JSON with their original status.
- `/print/report` renders only the selected daily/weekly review. `demo=1` selects the independent fixture; account requests require login. A `snapshot` query loads frozen owner-scoped evidence through the same reader used by saved downloads. Demo and snapshot/current parameters cannot be mixed.
- Print output includes scope, gross metrics, daily/cumulative evidence, review questions and missing-cost limits. It excludes workspace navigation, full report history, identity and journal content. The user initiates the print dialog; no external PDF service runs.
- Snapshots must reconcile amounts, day/slice totals, cumulative totals, win rate/profit factor, valid dates and weekly boundaries before printing/exporting. Existing snapshots are not rewritten. Inconsistent evidence fails visibly.
- Responsive preview and paper styles are implemented. Actual print pagination, generated PDF inspection, live status-announcement behavior, physical phones and successful owner browser downloads remain pending.

All 64 tests and lint/TypeScript/Webpack build checks pass. Local production HTTP checks cover current/demo print views, invalid-source rejection, account/snapshot login redirects, native attachment success and browser/API error formats. React static rendering and pure-model tests are not substitutes for physical/browser acceptance. No database permissions, paid-service settings or private owner data changed. V1 remains a free-only candidate until its remaining owner/device checks are complete.


## Hosted owner receipt follow-up — 15 October 2026

- Current report JSON: actual signed-in browser download received; exact daily totals, gross profit/loss and slice count arithmetic pass.
- Frozen snapshot JSON: actual signed-in attachment received; period, scope and every summary field agree with the selected report. Original saved timestamp remains preserved.
- Request feedback: the clicked report JSON link displayed its download-request status. Receipt is established separately by reading the returned local file.
- Frozen snapshot print preview: authenticated page and visual layout verified with the saved evidence and scope. Actual print dialog/PDF remains unverified after an interaction timeout.
- CSV and journal: receipt attempts timed out; neither is marked passed. Statement export cannot be accepted before a real statement is saved.
- Real workbook: chooser selection is blocked by the Chrome extension file URL permission. No upload, save, security-setting change or permission grant occurred.

Private files and account values are excluded from this documentation and Git. This documentation-only phase adds no app changes or migrations. The 64-test app baseline remains unchanged. Complete remaining owner/device steps before calling V1 fully accepted.


### Real hosted statement acceptance — 15 October 2026

After the owner enabled Chrome file access, the original Zerodha F&O workbook was selected and previewed successfully on the authenticated hosted app. Preview totals matched the previously verified local source values. Ownership-confirmed save succeeded; repeating Save retained a single report version, the same record link and original saved timestamp. A full page reload followed by Load statements restored the same period, exact totals and mismatch warning. Parsed statement data is now saved in the owner account; the app does not retain the original workbook or client identifier.

The execution-versus-statement mismatch remains visible and costs are not allocated to executions or days. Statement JSON download receipt timed out and remains unverified. Private workbook, amounts, account identifiers and screenshot evidence are excluded from Git. This documentation-only phase records live UI acceptance; the preceding 64-test app validation baseline is unchanged. Next: remaining CSV/journal/statement receipt, actual PDF and physical-phone acceptance.


### Remaining desktop exports and PDF acceptance — 15 October 2026

Signed-in report CSV, journal/plan JSON and saved statement JSON were received as actual local browser attachments. CSV row count and exact Decimal gross sum agree with the downloaded report JSON. Statement amounts match the previously verified source and reconcile gross minus charges plus other adjustments to net. Journal JSON parses successfully and includes annotations, notes/tags/checklists, evidence/connection fields and the saved plan; no journal content was modified. Together with prior current-report and frozen-snapshot JSON receipts, all implemented export families now have successful owner receipt evidence.

The actual Chrome Print / Save PDF action opened the native print preview and saved a two-page PDF locally. Both generated pages were rendered and visually inspected: metrics, complete daily table, review prompts and scope limits are legible without clipping. The review prompts continue onto page two at the browser's default print settings; browser headers/footers remain user-controlled. No external PDF provider was used.

At an effective 390 × 844 browser viewport, Reports and print preview fit without horizontal page overflow. Mobile bottom navigation and opening/closing the navigation drawer work. The override was reset after checking. These are emulated Chrome checks, not physical iOS Safari/Android acceptance. Actual phone file selection, downloads and print/share behavior remain the final device checks; connected physical devices were not available.

Documentation-only acceptance phase: private downloaded files, PDF, account values and screenshots remain outside Git. The existing 64-test/lint/TypeScript/production-build baseline is unchanged. No paid service, new permissions, migration or account data edits were introduced. Next: owner physical-device smoke checks; V2/V3 remain planned.
