// Recorded from real runs on 2026-10-29 (see README "Test evidence"). Update after re-running; do not edit by guess.
export const EVIDENCE = [
  { suite: "C++ exchange (platform, risk, UI, integration and demo checks)", result: "PASS: all test groups, exit 0 (re-run 2026-10-29 after the bridge fix)", where: "make check" },
  { suite: "Python research package", result: "PASS: 50 of 50 in about 2 s", where: "make check-research" },
  { suite: "Signal bridge incl. local exchange roundtrip", result: "PASS: 5 of 5, repeated 25 times in a row (4 unit, 1 local-exchange roundtrip). Before a test fix it failed 3 of 15 runs; see Limits & credit", where: "python3 -m pytest bridge" },
  { suite: "Website unit and component tests", result: "PASS: 23 of 23 (simulator logic, order lifecycle, page behaviour, the withheld-research page)", where: "npm test" },
  { suite: "Website end-to-end tests (real Chrome, production build)", result: "PASS: 29 of 29 (trade lifecycle, replay, crosshair, navigation, axe on 6 pages x 3 sizes, no horizontal scroll at 1440, 820 and 390 px)", where: "npm run e2e" },
  { suite: "Accessibility (axe-core, WCAG 2.0/2.1 A and AA)", result: "PASS: 0 violations on all 6 pages at desktop, tablet and phone widths. Automated checks only; no screen-reader testing", where: "npm run e2e" },
];
