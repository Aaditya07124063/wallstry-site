// Public page: protocol and conclusions only, no derived figures. The private dashboard (src/Research.local.tsx)
// is NOT imported here; it has its own gitignored entry, private-research.html, served by `npm run dev` only.
const STRATEGIES: [string, string][] = [
  ["Buy and hold", "Baseline"], ["126/21 momentum", "Rule"], ["Majority class", "Rule, per stock"], ["Logistic regression", "ML"], ["XGBoost", "ML"],
];
const GUARDS: [string, string][] = [
  ["No peeking", "Features use data through the close of day t; orders fill at the next open with fees and slippage."],
  ["Purged labels", "A training label is only used after its outcome is known."],
  ["Locked final test", "The last fifth of the history was reserved in advance and evaluated once. A ledger refuses a second run."],
  ["Dev-only tuning", "Hyperparameters were chosen on the development period only."],
  ["Independent audit", "A separate script replays the backtester’s trades on the development window and checks cash, shares, fees, fills and reruns."],
];
const WITHHELD = ["Backtest returns", "Classification quality", "Equity and drawdown curves"];

function Withheld() {
  return (
    <div className="stack">
      <section className="card lead-card">
        <p className="eyebrow">Research lab · protocol and conclusion</p>
        <h2>Can a model predict the next move, and does acting on it beat simple rules?</h2>
        <p>Five strategies were compared on one protocol designed to catch self-deception. The result is negative; see the conclusion.</p>
        <div className="banner" role="note"><strong>Figures withheld.</strong> Backtest and classification metrics were derived from Yahoo Finance data. They stay private until the provider’s terms have been reviewed. The method and the conclusion are below.</div>
      </section>

      <section className="card" id="protocol" aria-labelledby="h-protocol">
        <h2 id="h-protocol">Protocol and data</h2>
        <dl className="facts two-col">
          <div><dt>Question</dt><dd>Can a model predict whether a stock’s next-open-to-open move is up, and does acting on that beat simple rules?</dd></div>
          <div><dt>Universe</dt><dd>AAPL, MSFT, NVDA, TSLA, AMZN: five large Nasdaq stocks chosen today, so survivorship bias flatters buy-and-hold.</dd></div>
        </dl>
        <h3>Strategies compared</h3>
        <ul className="chips" aria-label="Strategies compared">{STRATEGIES.map(([n, k]) => <li key={n}><b>{n}</b><span>{k}</span></li>)}</ul>
      </section>

      <section className="card" aria-labelledby="h-eval">
        <h2 id="h-eval">Evaluation protocol</h2>
        <p className="small">The history is split once, in advance. Only the development period is used for fitting and tuning.</p>
        <div className="timeline" role="img" aria-label="History split: development period for walk-forward training and validation, then the final test, the last fifth of the history, run once">
          <div className="seg-d" style={{ flex: 4 }}><b>Development period</b><span>Walk-forward training, validation, tuning</span></div>
          <div className="seg-f" style={{ flex: 1 }}><b>Final test</b><span>Last fifth · run once</span></div>
        </div>
        <ol className="guards">{GUARDS.map(([t, d], i) => <li key={t}><span className="n" aria-hidden="true">{i + 1}</span><div><b>{t}</b><p>{d}</p></div></li>)}</ol>
      </section>

      <section className="card" aria-labelledby="h-concl">
        <h2 id="h-concl">Conclusion</h2>
        <p className="concl"><strong>No predictive skill was demonstrated.</strong> Classification quality was indistinguishable from chance, and no significance test or multiple-testing correction was run. A model can show a good return on one short historical path without predicting anything, so returns and prediction quality are judged separately.</p>
        <h3>Results held back</h3>
        <ul className="held" aria-label="Results held back">{WITHHELD.map((w) => <li key={w}><span>{w}</span><b>Withheld</b></li>)}</ul>
      </section>

      <section className="card" aria-labelledby="h-lim">
        <h2 id="h-lim">Limits</h2>
        <div className="grid-cards lim">
          <div><h3>Sample</h3><p>Five survivors, one data vendor, one historical path.</p></div>
          <div><h3>Execution model</h3><p>Simple execution: next-open fills, fixed slippage, no market impact, taxes or cash yield.</p></div>
          <div><h3>Publication</h3><p>Equity and drawdown curves are not published.</p></div>
        </div>
      </section>
    </div>
  );
}

export const Research = Withheld;
