# Hosted acceptance — 22 October 2026

Tested public synthetic demo at https://trademirror-ten.vercel.app/demo after commit d612a76 rolled out. No private account, broker authorization or data writes were used.

| Check | Observed result |
| --- | --- |
| Deployed date scope | 21 September – 7 October 2026; 48 slices, gross INR 2,800.00, average INR 58.33 |
| Instrument + option drilldown | Selecting NIFTY26OCT25000CE / CE produced a journal URL preserving both filters; journal showed 12 matching slices |
| Period drilldown | Weekly history links retained the selected instrument and week bounds |
| Metrics info | Click opened the explanation; Close dismissed it |
| Cumulative chart | Selected tab reported aria-selected=true and running gross view |
| Captured console errors | None in the requested last five error log entries; not a full network audit |
| Filtered CSV receipt | Download button clicked; browser download event timed out after 15 seconds. Receipt NOT verified; do not infer app failure or success from this alone |
| Download-history inspection | Blocked by browser URL security policy; no workaround attempted |
| New mobile acceptance | Requested 390×844 override, but actual window remained 1373px wide. No new mobile pass claimed; override reset |

A desktop screenshot is retained locally outside Git. Earlier 390px observations in the precheck are historical; this run does not replace physical-device testing.

## Next acceptance steps

1. In the filtered live journal, click Download filtered matches and confirm the CSV in the normal browser UI. Inspect the row count, symbol scope and exact gross against the selected journal. A download request alone does not establish receipt.
2. Run actual iOS Safari / Android Chrome navigation, file selection, download, print/share and PWA install checks from V1_HANDOFF.md. No device was connected for these checks.
3. If an actual failed download or layout defect is observed, record its visible error and reproduction before changing implementation.

This checkpoint changes documentation only. The preceding implementation checkpoint passed 84 tests, lint, TypeScript and production build. No new app tests were needed for this acceptance record.
