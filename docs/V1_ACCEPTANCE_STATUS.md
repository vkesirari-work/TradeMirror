# V1 acceptance status

23 October 2026. Current phase verifies hosted private current-report and frozen-snapshot PDF receipts. Latest code checks: 89 tests, lint, TypeScript and production build pass. Later documentation commits do not represent additional code validation.

| Check | Status | Evidence / remaining action |
| --- | --- | --- |
| Hosted imported analytics | Verified | Import receipt, dashboard/journal/day-report totals and instrument groups checked |
| Historical FIFO arithmetic | Verified locally | Independent Decimal FIFO agreed with application results; broker-only closure evidence remains separate |
| Original statement preview/save/reload | Verified for approved report | Saved period and instrument reconciliation restored after full reload |
| Weekly snapshot save/reload/reuse | Verified | Same-evidence save retained one snapshot and original identity |
| Seven exercised CSV/JSON downloads | Verified | Actual file receipt plus scope/exact-value checks; empty decision exports are not populated-write acceptance |
| Demo note/tag/checklist/plan edits | Verified | Save/reopen and unsaved-close protection |
| Demo risk lifetime | Fixed and verified | Same-slice reopen retained values, different slice stayed blank, reload cleared edits |
| Isolated journal/plan/risk database writes | Automated coverage | Owner isolation, constraints and stale revisions pass |
| Populated hosted personal decision writes/exports | Pending owner content | Need actual note/tag/checklist/risk inputs; no synthetic trading decisions are written to the owner account |
| Responsive navigation / PWA update | Verified in browser | 390×844 layout/drawer checks and explicit waiting-worker apply/reload; viewport restored |
| Physical Android/iPhone installation | Pending device | Browser emulation does not establish home-screen install, launch or device-specific file handling |
| Native print preview | Verified with synthetic report | Chrome Save as PDF preview rendered two pages including metrics, dates and scope limits |
| Direct PDF download / render | Verified locally and hosted private | Actual demo, private current-period and frozen-snapshot files received. Private PDF text, period, totals and scope checked; both one-page A4 renders visually inspected without clipping |
| Native PDF file save / render | Pending receipt | Save attempt interrupted by active browser control change; no output file was verified. Do not mark native PDF complete |
| Successful execution-save receipt UI | Pending owner run | Structured new/skipped counts implemented; duplicate transactions tested, latest receipt UI not exercised by a new owner save |
| Inconsistent source report | Pending fresh source | Exact charge discrepancy preserved; export a fresh original report rather than edit or infer totals |

No additional modules are necessary to close these acceptance items. Actual decisions, physical-device access and fresh broker source evidence are inputs; they cannot be replaced by synthetic successful checks. Planned V2/V3 remains separate from this checklist.
