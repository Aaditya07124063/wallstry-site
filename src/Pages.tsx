import { Legend, Tag } from "./Architecture";

const KPIS: { k: string; v: string; d: string; cls?: string }[] = [
  { k: "Idle CPU, exchange", v: "495% → 20%", d: "Adaptive idle mode for five worker threads; busy mode kept for comparison.", cls: "good" },
  { k: "Overspending buys let through", v: "56 → 2", d: "Of 200 pipelined $50,000 buys on $100,000 of cash. Exactly two can be afforded.", cls: "good" },
  { k: "New-account login", v: "~1 s → < 0.5 s", d: "Regression test: 12 new users log in under trade load.", cls: "good" },
  { k: "Predictive skill", v: "Not demonstrated", d: "Final test run once and locked by a ledger. Returns are reported separately.", cls: "bad" },
];

const AREAS: { t: string; o: "up" | "mod" | "mine"; p: string; e: string; to: string; cta: string }[] = [
  { t: "C++ exchange", o: "mod", p: "A six-thread paper-trading exchange (gateway, risk, sequencer and journal, matching engine, publisher, history) written by someone else. I ported it to macOS on Apple Silicon, fixed a login stall, cut idle CPU, and added cash and risk checks.", e: "Existing C++ suite passes in both idle modes, 20 of 20 runs each, plus new regression and risk tests.", to: "engineering", cta: "Read the engineering record" },
  { t: "Research lab", o: "mine", p: "Python package: hashed daily-bar snapshot, deterministic backtester, purged walk-forward evaluation, final-test ledger, and an independent accounting audit. It imports nothing from the exchange.", e: "50 tests. Buy-and-hold, momentum, a majority rule, logistic regression and XGBoost compared on one protocol.", to: "research", cta: "See the research" },
  { t: "Signal bridge", o: "mine", p: "Turns target weights into paper orders on a local exchange: long-only, allow-listed symbols, per-order, per-stock and total limits, immediate-or-cancel limit orders within a 1% collar, loopback only, dry run by default.", e: "Tested against a real local exchange, 25 consecutive passes after fixing a wrong test assumption.", to: "architecture", cta: "See how it connects" },
  { t: "This website", o: "mine", p: "A static React and TypeScript site. Its Trading page is a browser simulator with a candlestick chart, order ladder, ticket, risk checks, order lifecycle and a blotter. It is not connected to the C++ engine.", e: "Unit, end-to-end and automated accessibility tests.", to: "demo", cta: "Open the trading workspace" },
];

export function Landing({ go }: { go: (p: string) => void }) {
  return (
    <div className="stack ov">
      <section className="card ov-head">
        <p className="eyebrow">Engineering portfolio · case study</p>
        <h1>Hardening a C++ exchange, and testing whether ML can trade</h1>
        <p className="lead">I extended an existing paper-trading exchange written by someone else, built a Python research lab and a safety-limited signal bridge around it, and reported a negative result. Each part is labelled by who wrote it.</p>
        <ol className="story" aria-label="The project in three steps">
          <li><span className="n" aria-hidden="true">1</span><b>Inherited</b><span>A six-thread C++ paper-trading exchange, written by someone else.</span></li>
          <li><span className="n" aria-hidden="true">2</span><b>Hardened</b><span>Fixed a login stall, cut idle CPU, added cash and risk checks. Each change measured before and after.</span></li>
          <li><span className="n" aria-hidden="true">3</span><b>Tested</b><span>Built a research lab to ask whether ML can trade. The result was negative, and it is reported.</span></li>
        </ol>
        <div className="row">
          <button className="primary" onClick={() => go("engineering")}>Read the engineering record</button>
          <button className="ghost" onClick={() => go("demo")}>Open trading workspace</button>
          <button className="ghost" onClick={() => go("research")}>Research</button>
          <button className="ghost" onClick={() => go("architecture")}>Architecture</button>
        </div>
        <Legend />
      </section>

      <h2 className="sect">Measured outcomes</h2>
      <section className="verdicts kpis" aria-label="Key measured outcomes">
        {KPIS.map((x) => <div key={x.k} className={`verdict ${x.cls ?? ""}`}><small>{x.k}</small><b>{x.v}</b><span>{x.d}</span></div>)}
      </section>

      <h2 className="sect">What I built, and who wrote what</h2>
      <section className="grid-cards area-grid" aria-label="Project areas">
        {AREAS.map((a, i) => (
          <article key={a.t} className={i === 0 ? "card area feature" : "card area"}>
            <h3>{a.t} <Tag o={a.o} /></h3>
            <p>{a.p}</p>
            <p className="ev"><strong>Evidence.</strong> {a.e}</p>
            <a href={`#${a.to}`}>{a.cta} →</a>
          </article>
        ))}
      </section>

      <section className="card" aria-labelledby="h-who">
        <h2 id="h-who">Original project vs my contribution</h2>
        <div className="scroll" tabIndex={0} role="region" aria-label="Who wrote what (scrollable)"><table className="txt">
          <caption className="sr">Who wrote what</caption>
          <thead><tr><th scope="col">Part</th><th scope="col">Original Wallstry</th><th scope="col">Mine</th></tr></thead>
          <tbody>
            <tr><th scope="row">C++ exchange</th><td>Matching engine, gateway, accounts, terminal UI, Python client</td><td>Login-lock fix, adaptive idle CPU mode, cash and risk checks, journal-full handling, macOS Apple Silicon port, tests</td></tr>
            <tr><th scope="row">Research</th><td>Nothing</td><td>Data validation, backtester, walk-forward ML, accounting audit, final-test ledger</td></tr>
            <tr><th scope="row">Bridge</th><td>Uses its Python client</td><td>Loopback-only signal-to-order program with limits and dry-run default</td></tr>
            <tr><th scope="row">This website</th><td>Nothing</td><td>All code and text, none taken from the upstream project</td></tr>
          </tbody>
        </table></div>
      </section>

      <section className="card scope" aria-labelledby="h-scope">
        <h2 id="h-scope">What this site is not</h2>
        <ul className="plain cols2">
          <li><strong>Not live.</strong> Nothing here connects to a running exchange or a market. All prices are seeded random numbers.</li>
          <li><strong>Not the C++ engine.</strong> The trading page runs a simplified TypeScript matcher in your browser.</li>
          <li><strong>Not the original author’s code.</strong> It contains none of the exchange’s source, and is not affiliated with that author (whynotramaa).</li>
          <li><strong>Not investment advice.</strong> Paper trading only; no real money.</li>
        </ul>
      </section>
    </div>
  );
}

const LICENSES: [string, string, string][] = [
  ["Original Wallstry: C++ exchange, terminal app, Python client, original docs", "No license found; by whynotramaa (github.com/whynotramaa/wallstry, commit 0283b4c). The repository has no licence file or copyright notice, so default copyright applies: all rights reserved.", "No. Not included in this site or repository, and will not be until the author grants permission."],
  ["My patches and new files for the exchange", "Mine, but each patch quotes upstream context. Needs the author’s agreement before publishing.", "No. Described here only."],
  ["Research package and signal bridge", "Mine.", "Described here; source not published yet."],
  ["Price data (Yahoo Finance via yfinance)", "Provider terms restrict redistribution; not reviewed in depth.", "No prices, bars or per-day series. Only derived summary statistics."],
  ["This website’s source", "MIT, covering the website source only.", "Yes."],
  ["React and React DOM", "MIT (Meta Platforms).", "Bundled; see third-party notices."],
  ["FTXUI", "MIT (Arthur Sonzogni), used by the terminal app.", "Not bundled."],
];

export function About() {
  return (
    <div className="stack">
      <section className="verdicts kpis" aria-label="Key limits at a glance">
        <div className="verdict bad"><small>Research</small><b>No predictive edge demonstrated</b><span>Accuracy near a coin flip; no significance test run.</span></div>
        <div className="verdict bad"><small>Upstream code</small><b>Not published</b><span>No licence found; not included here.</span></div>
        <div className="verdict bad"><small>Trading page</small><b>Synthetic market simulation</b><span>Seeded random prices, not the C++ engine.</span></div>
        <div className="verdict good"><small>This website</small><b>MIT</b><span>Website source only.</span></div>
      </section>
      <section className="card"><h2>Limitations</h2>
        <div className="cols2 plain">
          <div><h3>Research</h3><ul>
            <li><strong>No demonstrated predictive skill.</strong> Classification quality was indistinguishable from chance; no significance test; no multiple-testing correction.</li>
            <li><strong>Survivorship bias.</strong> The five stocks are today’s mega-cap winners, which flatters buy-and-hold.</li>
            <li><strong>One path, one vendor.</strong> Fills at the next open with fixed slippage; no market impact, taxes or cash yield.</li>
            <li><strong>No curves.</strong> Equity and drawdown series are not published; see Research.</li></ul></div>
          <div><h3>Exchange</h3><ul>
            <li><strong>No market-order price protection</strong> in the engine, so a market buy can fill above the cash estimate. Inherited, unchanged.</li>
            <li><strong>Sells are not collateral-checked</strong> (shorts are uncollateralised). Inherited, unchanged.</li>
            <li><strong>Journal records have no checksums</strong>, and sync is off by default.</li>
            <li><strong>Bridge orders can miss.</strong> IOC orders at a 1% limit failed to fill about 1 time in 4 against the bots’ thin book. That is normal behaviour; the bridge reports the cancels.</li></ul></div>
          <div><h3>This website</h3><ul>
            <li><strong>Charts are synthetic.</strong> The Trading page uses seeded random walks; only the ticker names echo real symbols.</li>
            <li><strong>The browser demo is not the C++ engine.</strong> It is a simplified matcher written in TypeScript.</li>
            <li><strong>No live exchange is connected</strong> to this site.</li></ul></div>
          <div><h3>Platform</h3><ul>
            <li>Built and tested on macOS Apple Silicon only. Linux and x86 are untested.</li></ul></div>
        </div>
      </section>
      <section className="card"><h2>Licensing and what is published</h2>
        <div className="scroll" tabIndex={0} role="region" aria-label="Licensing table (scrollable)">
          <table className="txt wide"><caption className="sr">Licensing by component</caption>
            <thead><tr><th scope="col">Component</th><th scope="col">Status</th><th scope="col">Published here?</th></tr></thead>
            <tbody>{LICENSES.map(([a, b, c]) => <tr key={a}><th scope="row">{a}</th><td>{b}</td><td className={c.startsWith("Yes") || c.startsWith("Bundled") ? "pub" : "nopub"}>{c}</td></tr>)}</tbody></table>
        </div>
        <p className="small">This is a factual summary, not legal advice.</p>
      </section>
      <section className="card callout-card"><h2>Attribution</h2>
        <p>The Wallstry C++ exchange, terminal app, Python client and original documents were written by whynotramaa (github.com/whynotramaa/wallstry, commit 0283b4c), who has not published a licence. I have not published their source code and will not until the author grants permission. The patches, tests, research package, signal bridge and this website are the work of Aaditya Adhikari. The browser trading simulator on this site is a separate, independently written synthetic simulation; it does not contain or run the original C++ engine. The website was built with AI assistance. This site is not affiliated with the original author. See <a href="/THIRD_PARTY_NOTICES.txt">third-party notices</a>.</p>
      </section>
    </div>
  );
}
