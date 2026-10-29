// Recorded from real runs on 2026-10-29 (see README "Test evidence"). Update after re-running; do not edit by guess.
export const EVIDENCE = [
  { suite: "C++ exchange (platform, risk, UI, integration and demo checks)", result: "PASS: all test groups, exit 0 (re-run 2026-10-29 after the bridge fix)", where: "make check" },
  { suite: "Python research package", result: "PASS: 50 of 50 in about 2 s", where: "make check-research" },
  { suite: "Signal bridge incl. local exchange roundtrip", result: "PASS: 5 of 5, repeated 25 times in a row (4 unit, 1 local-exchange roundtrip). Before a test fix it failed 3 of 15 runs; see Limits", where: "python3 -m pytest bridge" },
  { suite: "Frontend unit and component tests", result: "PASS: 17 of 17 (sim logic and page behaviour)", where: "cd web && npm test" },
];
