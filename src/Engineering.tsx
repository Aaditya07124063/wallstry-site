import { EVIDENCE } from "./evidence";
import { Jump } from "./Architecture";

const PHASES: { phase: string; problem: string; change: string; result: string }[] = [
  { phase: "1A · Login stall", problem: "New-account login waited about 1.0 s for the history thread’s next commit. The bot fleet created accounts back to back, so 4 of 15 make check runs failed at the demo-startup stage (the last stage); the 5 s client timeout is the suspected mechanism.", change: "A shared waiting counter makes the history thread commit at its next command boundary and hand over the writer lock. Schema, journal, wire format and batch atomicity unchanged.", result: "New regression test: 12 new users log in under trade load, each in under 0.5 s, then a restart checks persistence and authentication. Now the last stage of make check." },
  { phase: "1B · Idle CPU", problem: "An idle exchange used 407 to 495% CPU: five worker threads spinning.", change: "Bounded adaptive idle (spin, then yield, then 50 µs sleeps) behind --idle busy|adaptive; adaptive is the default and the original behaviour is kept for comparison.", result: "About 20% idle CPU. End-to-end p99 stayed near 149 µs in both modes (15 runs each). Replay hash identical across all 6 runs. Cost: the first order after 2 s idle takes about 150 µs longer." },
  { phase: "2 · Cash and risk", problem: "Buys were never checked against cash. In a pipelined test, 56 of 200 buys of $50,000 each got through on $100,000 of cash. A market order with no last price skipped the value check. A full journal called abort().", change: "Buying-power check that counts resting buys and buys still in flight; NoMarketPrice rejection; JournalFull rejections with a graceful shutdown. The matching engine is untouched.", result: "Same test lets exactly 2 through. Journal overflow is excluded by design: new orders are refused while free slots could still be needed by queued commands and cancels. make check passed 20 of 20 runs in each idle mode." },
  { phase: "3 · Research", problem: "Needed a way to test whether ML signals beat simple strategies without fooling myself.", change: "Frozen hashed data, deterministic backtester, purged walk-forward, final-test ledger, independent accounting audit.", result: "50 tests. Result: no demonstrated predictive skill. See Research." },
  { phase: "4 · Bridge and site", problem: "Research output needed a safe path to paper orders; the work needed a public write-up.", change: "Loopback-only, dry-run-by-default bridge; static site with a clearly labelled browser simulator.", result: "Bridge tests 5 of 5, repeated 25 times in a row. Before a test fix they failed 3 of 15 runs; the test assumed every immediate-or-cancel order fills, and the bridge did not report cancels. Both were fixed." },
];

const NOT_TESTED = [
  "Linux and x86 builds (everything here ran on one Apple M1 MacBook).",
  "Order types other than limit through the terminal UI; they are exercised via the Python client in make check.",
  "Control, rank and benchmark screens, resize behaviour, and non-admin sessions in the UI.",
  "Durability on power loss: sync is off by default and F_FULLFSYNC was not tested.",
  "Long-running stability, and any production load.",
];

export function Engineering() {
  return (
    <div className="stack">
      <section className="card" aria-labelledby="h-eng">
        <p className="eyebrow">Engineering record</p>
        <h2 id="h-eng">Problems found, changes made, evidence collected</h2>
        <p className="small">Each row records what was measured before, what changed, and what was measured after. Failures are included.</p>
        <Jump items={[["h-idle", "Idle CPU"], ["h-pr", "Practices"], ["h-ev", "Test evidence"], ["h-nt", "Not verified"], ["h-run", "Run it"]]} />
        <div className="scroll" tabIndex={0} role="region" aria-label="Engineering changes (scrollable)">
          <table className="txt wide"><caption className="sr">Engineering changes by phase</caption>
            <thead><tr><th scope="col">Phase</th><th scope="col">Problem measured</th><th scope="col">Change</th><th scope="col">Evidence</th></tr></thead>
            <tbody>{PHASES.map((p) => <tr key={p.phase}><th scope="row">{p.phase}</th><td>{p.problem}</td><td>{p.change}</td><td>{p.result}</td></tr>)}</tbody></table>
        </div>
      </section>

      <section className="card" aria-labelledby="h-idle">
        <h2 id="h-idle">Idle CPU change, before and after</h2>
        <p className="small">Apple M1, macOS, Apple clang, C++23. Linux not tested.</p>
        <div className="scroll" tabIndex={0} role="region" aria-label="Idle mode comparison (scrollable)"><table className="cards"><caption className="sr">Busy versus adaptive idle mode</caption>
          <thead><tr><th scope="col">Metric</th><th scope="col">Busy (original)</th><th scope="col">Adaptive (default)</th></tr></thead>
          <tbody>
            <tr><th scope="row">Idle CPU, 10 s</th><td>495%</td><td>19.9%, 20.5%</td></tr>
            <tr><th scope="row">Python sync ack p50 / p99</th><td>52.1 / 163.3 µs</td><td>49.4 to 57.5 / 164.9 to 185.8 µs</td></tr>
            <tr><th scope="row">bench e2e p99 (median of 15)</th><td>about 149 µs</td><td>about 149 µs</td></tr>
            <tr><th scope="row">Burst throughput</th><td>54,146/s</td><td>67,532 and 71,417/s</td></tr>
            <tr><th scope="row">First order after ≥ 2 s idle</th><td>255 to 675 µs</td><td>390 to 653 µs</td></tr>
            <tr><th scope="row">Replay hash (26k records, 91,978 events)</th><td>a51f8a7f9af21315</td><td>a51f8a7f9af21315 (6 runs)</td></tr>
          </tbody></table></div>
        <p className="small">An untuned first attempt (20,000-spin window) failed the latency criterion, with p99 up 46%, and was rejected; this is why the window is 400,000.</p>
      </section>

      <h2 className="sect" id="h-pr">Engineering practices</h2>
      <section className="grid-cards g4" aria-label="Engineering practices">
        <article className="card"><h3>Determinism</h3><p>Journal replay hashes every report and event in order. The backtester returns a digest that a test checks. The browser simulator is seeded, so the same inputs always produce the same chart and book.</p></article>
        <article className="card"><h3>Safe by construction</h3><p>The bridge refuses non-loopback hosts. Journal overflow is excluded by reserving free slots rather than hoping. The final-test ledger refuses a second run. The website bundle is scanned for secrets and private paths before every build.</p></article>
        <article className="card"><h3>Baselines kept</h3><p>The original busy-spin mode remains selectable, so each claim about the new mode can be re-measured. Pre-change copies of files modified in the exchange phases are kept locally, not published.</p></article>
        <article className="card"><h3>Failures recorded</h3><p>The login stall showed up as 4 failures in 15 runs; a wrong test assumption about immediate-or-cancel orders as 3 in 15. Both are documented with before and after counts instead of being smoothed over.</p></article>
      </section>

      <section className="card" aria-labelledby="h-ev">
        <h2 id="h-ev">Verified test evidence</h2>
        <div className="scroll" tabIndex={0} role="region" aria-label="Test evidence (scrollable)">
          <table className="txt wide"><caption className="sr">Test suites and recorded results</caption>
            <thead><tr><th scope="col">Suite</th><th scope="col">Result</th><th scope="col">Command</th></tr></thead>
            <tbody>{EVIDENCE.map((e) => <tr key={e.suite}><th scope="row">{e.suite}</th><td>{e.result}</td><td><code>{e.where}</code></td></tr>)}</tbody></table>
        </div>
        <p className="small">Results come from actual runs on the author’s Apple Silicon Mac, 2026-10-29.</p>
      </section>

      <section className="card" aria-labelledby="h-nt">
        <h2 id="h-nt">Not verified</h2>
        <ul>{NOT_TESTED.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>

      <section className="card" aria-labelledby="h-run">
        <h2 id="h-run">Run it locally</h2>
        <p>The exchange needs the original Wallstry source (not included here), macOS or Linux, a C++23 compiler, SQLite and libsodium. From that checkout:</p>
        <pre tabIndex={0}><code>{`make -j2 && make check      # build and run the C++ test groups
make check-research          # Python research tests
python3 -m pytest bridge     # signal bridge, incl. a local exchange
./demo.sh --headless         # exchange + bots, then:
python3 bridge/signal_bridge.py signal.json            # dry run
python3 bridge/signal_bridge.py signal.json --execute  # paper orders`}</code></pre>
        <p className="small">This website alone needs only Node and npm: <code>npm ci &amp;&amp; npm test &amp;&amp; npm run build</code>; end-to-end tests with <code>npm run e2e</code>.</p>
      </section>
    </div>
  );
}
