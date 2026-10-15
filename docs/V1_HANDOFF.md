# V1 completion and deferred checks

Checkpoint: 15 October 2026. Free desktop/browser scope is implemented and accepted. Paid AI remains disabled; no API key or billing is required. This note supersedes historical pending entries in phase logs.

## Completed

- Account login/recovery and owner-scoped execution imports with visible preview/save flow.
- Exact FIFO gross analytics, journal filters, notes/tags/custom plan and computed reviews.
- Daily/weekly reports and immutable snapshot save/reopen/deduplication.
- Real owner Zerodha F&O statement preview/save/repeat/reload with exact totals and visible history mismatch.
- Actual signed-in report CSV/JSON, journal/plan JSON, snapshot JSON and statement JSON receipts.
- Actual Chrome print dialog and locally saved two-page PDF, rendered and visually inspected.
- Emulated phone Reports/print layout and navigation at 390px; prior workspace responsive checks remain recorded.

## Deferred: physical devices unavailable

Do not mark these passed from Chrome emulation. No app implementation change is required to perform them.

| Device | Steps | Expected result |
| --- | --- | --- |
| iPhone / Safari | Sign in; navigate dashboard, Trades, Reports; open/close drawer | Usable controls, no clipped page content; session survives normal navigation |
| iPhone / Safari | Select supported CSV/XLSX from Files; preview; save an already imported file | File picker works, clear status, no duplicate history |
| iPhone / Safari | Download report/journal/statement; open from Files; Print/share PDF | Correct file, readable content, no false success when blocked |
| Android / Chrome | Repeat navigation, file picker, preview/save and downloads | Same behavior, readable layout, owner data only |
| Android / Chrome | Print / Save PDF and inspect all pages | Complete evidence/limits with no clipped text |

Record device, OS/browser version, pass/fail, visible error and reproduction steps. Use existing files for deduplication checks; keep private evidence outside Git. Fix observed failures before claiming physical-mobile acceptance.

## Product limits retained deliberately

- Statement-level net is separate from FIFO gross; no per-slice/day charge allocation or invented reconciliation.
- Only the supported Zerodha F&O workbook layout is accepted.
- Journal export is not a full account backup; restore is unsupported.
- Broker sync, replay/MFE/MAE, richer plans, optional paid AI and native apps are planned future work, not completion requirements for this free scope.

## Next session

Run the physical-device table when devices are available. Otherwise the current free desktop release can be used with the documented limits; choose the next roadmap phase explicitly before expanding scope. No secrets, financial files or private screenshots belong in commits.

## Final checkpoint validation

15 October 2026: all 64 automated tests, ESLint, explicit TypeScript check and Webpack production build pass. Documentation links and whitespace checks pass. This checkpoint changes documentation only; hosted acceptance evidence is recorded in the release matrix.


## Expansion checkpoint

The six-module expansion is documented in [MODULE_BATCH.md](MODULE_BATCH.md): PWA, period comparison, saved journal review, multiple templates, optional recorded risk and process tracking are now implemented. The broker sync pilot exists but remains disabled pending owner API configuration. Plan/risk migration and hosted owner save/reload/export passed. Final checks: 78 tests, lint, TypeScript and production build. Physical devices and live broker authorization remain required for their respective acceptance; the earlier native-app guidance remains future scope.
