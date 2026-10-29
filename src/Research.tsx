const CHECKS = ["Fills happen at the next open plus slippage", "Cash and share counts never go negative", "Fees reconcile with the trade list", "Equity matches an independent replay to rounding error", "A rerun gives identical output"];

export function Research() {
  return (
    <div className="stack">
      <div className="banner" role="note"><strong>Summary only.</strong> This page gives aggregate findings and plain-language notes. Per-model tables and underlying market data are kept private until the data provider's redistribution terms are verified. The full results exist locally in the author's research folder.</div>

      <section className="card" aria-labelledby="h-q">
        <h2 id="h-q">Two different questions</h2>
        <p><em>Predictive accuracy</em> asks whether a model guesses next-day direction better than chance. <em>Investment return</em> asks whether a rule-following portfolio made money on one historical path. A model can post a good return without predicting anything.</p>
      </section>

      <section className="card" aria-labelledby="h-set">
        <h2 id="h-set">Setup</h2>
        <ul>
          <li>Five large Nasdaq stocks, daily bars, adjusted prices from a single provider.</li>
          <li>Equal-weight portfolio, $100,000 start, 6 basis points of cost per side.</li>
          <li>Compared: buy and hold, a 126/21-day momentum rule, a majority-class guess, logistic regression and XGBoost.</li>
          <li>Models were trained walk-forward with no peeking. A separate final period was evaluated exactly once and locked by a ledger; it was never re-run or tuned.</li>
        </ul>
      </section>

      <section className="card" aria-labelledby="h-find">
        <h2 id="h-find">Aggregate findings</h2>
        <ul>
          <li><strong>No demonstrated predictive skill.</strong> Across both the development and final periods, every model's AUC landed between roughly 0.48 and 0.52, where 0.50 is a coin flip. No significance test was run, and rows are cross-correlated, so the effective sample is smaller than it looks.</li>
          <li><strong>Returns were mixed, not consistent.</strong> In the development period buy and hold beat every machine-learning model by a wide margin. In the final period one model finished ahead of buy and hold and another behind it. One short path of five stocks is not evidence of an edge.</li>
          <li><strong>Survivorship bias flatters the baseline.</strong> The five stocks are today's mega-cap winners.</li>
        </ul>
      </section>

      <section className="card" aria-labelledby="h-audit">
        <h2 id="h-audit">Accounting audit of the backtester</h2>
        <p>A separate script replays every trade on the development window (never the final test) and checks the books for three strategies. All checks passed:</p>
        <ul>{CHECKS.map((c) => <li key={c}>{c}</li>)}</ul>
        <p className="small">The audit checks the backtester's arithmetic. It does not validate the vendor's data.</p>
      </section>
    </div>
  );
}
