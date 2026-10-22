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
