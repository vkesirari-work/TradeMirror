# End-user walkthrough — 22 October 2026

Walked through the signed-in hosted account using visible UI. Filter/switch/history-read actions only: no executions, notes, risk inputs, templates, profile, statements or snapshots were saved or deleted. Private values and screenshots are not committed.

| Area | Paths/actions checked | Result / boundary |
| --- | --- | --- |
| Navigation | Mobile drawer, main destinations and Settings links | Navigation works. Fixed auxiliary page breadcrumb names |
| Dashboard | Overview, Calendar, Breakdowns, Compare periods | All four views rendered |
| Breakdowns | Instruments, CE/PE, hour, weekday, long/short, holding | Every dimension selected and returned groups |
| Comparison | Weekly/monthly and Swap | Selection works; current scope links retained by prior phase |
| Trades | Page 2, losing-result filter, reset, record dialog open/close | Correct pagination/filter feedback; no note edits |
| Import | CSV mode and Broker connection mode | Prior hosted synthetic local preview/clear acceptance retained. Removed nonfunctional Connect action and CSV-specific progress from broker mode |
| Review | Computed observations, empty tag coverage, saved-note link | Loaded with explicit descriptive/free limitations |
| Saved notes/process | Empty list, filter controls and process empty state | No fabricated score; no saved notes in current owner history |
| Reports | Daily/weekly, selecting another period, Load saved history | Reads/rendering work. Added scroll-to-review feedback and two-decimal display |
| Print | Demo report → print preview route | Correct synthetic evidence; print dialog not triggered in this pass |
| Costs | File-picker state, disabled preview without file, Load statements | Empty-history message returned. Improved native picker; no real file uploaded |
| Plans | Library editor/empty state | Inputs visible, save disabled when blank; no template saved |
| Connections | Disabled live preview, CSV fallback | No credential or broker call; optional sync stays off |
| Settings | Profile, recovery and export/auxiliary links | Inspected only; no profile/password change or sign-out |
| Install | Android/iOS instructions and update controls | Read only; no install/update/reload triggered |

## Fixes

- Auxiliary routes identify Broker costs, Trading plans, Saved notes and Broker connections rather than generic Workspace.
- Broker CSV card links to actual connection status; it no longer simulates a Connect action or claims provisional/final broker reports.
- Import mode shows CSV progress/privacy only in CSV mode.
- Report and journal/result displays use two decimals; raw prices, calculations and exported financial evidence retain precision. Charges use neutral text instead of profit green.
- Selecting report history brings the current review into view; reduced-motion preference is respected.
- Costs picker, report tabs, stacked sections and long execution IDs have clearer styling/spacing. Review prompts now have readable text contrast; demo report cards have an inspected 18px separation.

## Validation and remaining limits

85 tests, lint, TypeScript and production build pass. Corrected report daily/weekly selection, period-heading update, print navigation and auxiliary demo-cost breadcrumb were verified in the production-build browser. Existing hosted import and core walkthrough observations above predate the patch; the exact patched private screens require post-rollout acceptance.

This is not an exhaustive certification of every possible account/error state. Snapshot/note/template saves, credential recovery, downloads, real statement uploads, native print, physical phones, PWA installation and real broker sessions were not rerun. Earlier evidence remains dated evidence; pending download receipt and physical-device checks are still open.

## Follow-up after another owner upload — 22 October 2026

Reopened the hosted signed-in workspace after the owner added another CSV. Import history showed the latest file as COMPLETED. Dashboard, journal record count and the sum of all visible daily report rows agreed on matched-slice count and gross P&L; daily row count also agreed with active exit days. Private filenames, financial totals and identifiers are intentionally omitted here.

Calendar active-day selection opened the expected day evidence. CE/PE groups reconciled to the dashboard total. Weekly comparison and weekly reports showed matching period evidence; daily/weekly report tabs switched successfully. Execution details, saved notes and planned-risk inputs loaded without editing. Review observations used the new history. Saved-note/process tracking and plan library returned explicit empty states; loading templates succeeded. Costs history returned no saved statements, explaining unavailable net P&L. Connections remained disabled, and Settings/Install rendered.

This follow-up is read-only acceptance: no account data was created, changed or deleted. No new application defect was observed in these checks. It does not replace original-file reconciliation, write-flow acceptance, download receipts or physical-device/PWA testing. No application code changed in this follow-up, so the preceding 85-test/lint/TypeScript/build results remain the latest code validation.

## Hosted snapshot persistence acceptance — 23 October 2026

Saved the current weekly report to the signed-in owner's snapshot history. The UI confirmed saving and showed the frozen period. Reloaded the page, loaded saved history and reopened the retained snapshot. Saving identical evidence again reused the same snapshot identity and original saved timestamp; no second history row appeared. The saved-snapshot print route showed matching frozen evidence. One actual owner snapshot is retained; executions, journal decisions and profile were unchanged. Private identifiers, amounts and screenshots remain outside Git. Native print/PDF output was not invoked.

The journal CSV button was clicked, but no visible feedback appeared and file receipt could not be established. Added an accessible status with the prepared slice count and a browser-download instruction; it deliberately does not claim disk receipt. Production-build demo interaction showed the correct prepared count. Financial XLSX preview/save still awaits specific source/destination confirmation; physical-device/PWA acceptance requires the owner's device.

## Hosted original statement preview/save — 23 October 2026

Owner explicitly approved the exact local financial file for preview and parsed-record storage in the hosted app/Supabase account. The file chooser selected that file; Preview returned validated statement totals and an instrument-aligned imported gross comparison. Confirmed ownership and saved. The UI confirmed statement storage and unchanged execution history. After full page reload, Load statements restored the same saved period, totals and reconciliation result. The saved charge breakdown also expanded successfully.

A real parsed statement is retained. No additional source reports were transmitted, and no journal/plan/profile or execution data was edited. Statement net is distinct from overall-account or slice/day net. This supersedes the earlier pending statement preview/save note for this selected report only. Private report identity, values and screenshot evidence remain outside the repository. No application code changed; latest automated validation remains 86 tests, lint, TypeScript and production build.
