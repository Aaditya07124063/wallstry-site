type Origin = "up" | "mod" | "mine";
const ORIGIN: Record<Origin, string> = { up: "Upstream, unchanged", mod: "Upstream, with my changes", mine: "Written by me" };
type N = { x: number; y: number; t: string; s?: string; o: Origin; w?: number };

function Diagram({ label, vb, nodes, edges, extra, flow }: { label: string; vb: [number, number]; nodes: N[]; edges: string[]; extra?: React.ReactNode; flow?: string[] }) {
  const steps = flow ? flow.map((t) => nodes.find((n) => n.t === t)!) : nodes;
  return (
    <>
    <div className="flowlist">
      <p className="small">{label}</p>
      <ol>{steps.map((n) => <li key={n.t} className={n.o}><b>{n.t}</b>{n.s && <span>{n.s}</span>}<Tag o={n.o} /></li>)}</ol>
    </div>
    <div className="scroll diagram" tabIndex={0} role="region" aria-label={`${label} (scrollable)`}>
      <svg viewBox={`0 0 ${vb[0]} ${vb[1]}`} role="img" aria-label={label} className="arch" style={{ minWidth: vb[0] * 0.92 }}>
        <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" className="head" /></marker></defs>
        {edges.map((d, i) => <path key={i} d={d} className="edge" fill="none" markerEnd="url(#ah)" />)}
        {nodes.map((n) => (
          <g key={n.t}>
            <rect x={n.x} y={n.y} width={n.w ?? 150} height={54} rx={6} className={`node ${n.o}`} />
            <text x={n.x + (n.w ?? 150) / 2} y={n.y + (n.s ? 23 : 32)} textAnchor="middle" className="nt">{n.t}</text>
            {n.s && <text x={n.x + (n.w ?? 150) / 2} y={n.y + 40} textAnchor="middle" className="lbl">{n.s}</text>}
          </g>
        ))}
        {extra}
      </svg>
    </div>
    </>
  );
}
// Buttons, not #anchors: routing is hash-based, so an anchor would navigate away.
export const Jump = ({ items }: { items: [string, string][] }) => (
  <nav className="jump" aria-label="On this page">{items.map(([id, t]) => <button key={id} type="button" className="ghost" onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>{t}</button>)}</nav>
);
export const Legend =() => <p className="legend">{(Object.keys(ORIGIN) as Origin[]).map((k) => <span key={k}><i className={`sw ${k}`} />{ORIGIN[k]}</span>)}</p>;
export const Tag = ({ o }: { o: Origin }) => <span className={`origin ${o}`}>{ORIGIN[o]}</span>;

const PIPE: N[] = [
  { x: 10, y: 30, t: "Terminal app", s: "FTXUI, six screens", o: "mod" }, { x: 10, y: 110, t: "Bot fleet", s: "35 bots, 6 strategies", o: "mod" }, { x: 10, y: 190, t: "Python client", s: "stdlib only", o: "mod" },
  { x: 210, y: 110, t: "Gateway", s: "epoll / kqueue, one thread", o: "mod" }, { x: 390, y: 110, t: "Risk", s: "cash, limits, journal-full", o: "mod" },
  { x: 570, y: 110, t: "Sequencer", s: "numbers and journals", o: "mod" }, { x: 750, y: 110, t: "Matching engine", s: "pure function of commands", o: "up" },
  { x: 750, y: 260, t: "Publisher", s: "accounts, market data", o: "mod" }, { x: 570, y: 260, t: "Journal file", s: "mmap; replayed at startup", o: "mod" },
  { x: 750, y: 360, t: "History thread", s: "batched commits", o: "mod" }, { x: 930, y: 360, t: "SQLite (WAL)", s: "users, executions", o: "mod" },
  { x: 210, y: 260, t: "Client sessions", s: "fills and market data", o: "up" },
];
const PIPE_EDGES = [
  "M160,57 L210,125", "M160,137 L210,137", "M160,217 L210,149", "M360,137 L390,137", "M540,137 L570,137", "M720,137 L750,137",
  "M825,164 L825,260", "M645,164 L645,260", "M825,314 L825,360", "M900,387 L930,387", "M780,314 L780,345 L285,345 L285,314", "M285,260 L285,164",
];
const LAB: N[] = [
  { x: 10, y: 30, t: "Frozen daily bars", s: "private, not published", o: "mine" }, { x: 210, y: 30, t: "Python research lab", s: "walk-forward, 50 tests", o: "mine" },
  { x: 410, y: 30, t: "Results JSON", s: "summary stats only", o: "mine" }, { x: 210, y: 140, t: "Target weights", s: "signal.json", o: "mine" },
  { x: 410, y: 140, t: "Signal bridge", s: "limits, dry-run default", o: "mine" }, { x: 610, y: 140, t: "C++ exchange", s: "loopback only", o: "mod" },
  { x: 610, y: 270, t: "Browser simulator", s: "TypeScript; not the engine", o: "mine", w: 170 }, { x: 810, y: 270, t: "This website", s: "static React files", o: "mine" },
];
const LAB_EDGES = ["M160,57 L210,57", "M360,57 L410,57", "M285,84 L285,140", "M360,167 L410,167", "M560,167 L610,167", "M780,297 L810,297"];

const NUMBERS: [string, string][] = [
  ["Engine throughput (5 runs)", "27.9 to 31.3 million commands/s"], ["Add latency p50 / p99 / p99.9", "29 / 67 / 173 ns"], ["Cancel latency p50 / p99 / p99.9", "103 / 385 / 538 ns"],
  ["Journal replay (3 runs)", "29.0 to 29.8 million commands/s, identical hash every run"], ["Loopback order ack p50 / p99", "about 9.85 µs / 16.4 to 18.9 µs"],
];

export function Architecture() {
  return (
    <div className="stack">
      <section className="card lead-card">
        <p className="eyebrow">System architecture</p>
        <h2>A low-latency exchange pipeline, extended and wrapped by independent research and safety tooling</h2>
        <p>Wallstry is a C++23 paper-trading exchange that was written by someone else. I ported it to macOS on Apple Silicon, fixed defects, added risk controls and tests, and built the Python research lab and signal bridge around it. Each box below is coloured by who wrote it.</p>
        <Legend />
        <Jump items={[["h-pipe", "Pipeline"], ["h-prov", "Upstream vs mine"], ["h-comp", "Components"], ["h-lab", "Boundaries"], ["h-num", "Performance"]]} />
      </section>

      <section className="card" aria-labelledby="h-pipe">
        <h2 id="h-pipe">Exchange pipeline</h2>
        <Diagram flow={["Terminal app", "Bot fleet", "Python client", "Gateway", "Risk", "Sequencer", "Journal file", "Matching engine", "Publisher", "Client sessions", "History thread", "SQLite (WAL)"]} label="Exchange pipeline. Clients connect over binary TCP to the gateway. Commands flow through risk and the sequencer, which writes the journal, into the matching engine. Engine output goes to the publisher, which feeds client sessions, and through a history thread into SQLite." vb={[1110, 430]} nodes={PIPE} edges={PIPE_EDGES}
          extra={<><text x={365} y={102} className="lbl" textAnchor="middle">SPSC ring</text><text x={600} y={218} className="lbl">journal append</text></>} />
        <p className="small">Every stage runs on its own thread, linked by single-producer single-consumer ring buffers; the engine never reads a clock or touches the network, and allocates nothing after startup. Worker threads use an adaptive idle mode (my change); the original busy-spin remains available with <code>--idle busy</code>.</p>
      </section>

      <section className="card" aria-labelledby="h-prov">
        <h2 id="h-prov">What is upstream and what is mine</h2>
        <div className="scroll" tabIndex={0} role="region" aria-label="Provenance table (scrollable)">
          <table className="txt"><caption className="sr">Provenance by layer</caption>
            <thead><tr><th scope="col">Layer</th><th scope="col">Origin</th><th scope="col">Contents</th></tr></thead>
            <tbody>
              <tr><th scope="row">Matching engine, order book, strategies, terminal app, original docs</th><td><Tag o="up" /></td><td>Author: whynotramaa (github.com/whynotramaa/wallstry @ 0283b4c); no licence file or copyright notice. Not published here. The SQLite schema and journal record format are unchanged.
                <details><summary>Byte-level diff notes</summary>By diff against the copy I received, engine.hpp, book.hpp, protocol.hpp, config.hpp, strategies.hpp and terminal.cpp are byte-identical. Four shared headers carry small edits (pool.hpp, spsc.hpp, journal.hpp, types.hpp: a macOS guard, a portable CPU pause, a capacity accessor, three new reject codes), and the gateway, bots, accounts and Python client carry the changes listed below.</details></td></tr>
              <tr><th scope="row">macOS ARM64 port</th><td><Tag o="mine" /></td><td>Platform layer (epoll or kqueue poller, timer, core pinning, parent-death handling in the gateway and bots), Makefile and header hunks, platform test.</td></tr>
              <tr><th scope="row">Phase 1A: login stall</th><td><Tag o="mod" /></td><td>Small hunks in the account store and history thread; new regression test.</td></tr>
              <tr><th scope="row">Phase 1B: idle CPU</th><td><Tag o="mod" /></td><td>New idle-policy header; the five polling loops call it.</td></tr>
              <tr><th scope="row">Phase 2: cash and risk</th><td><Tag o="mod" /></td><td>Buying-power checks, cold-start market orders, journal capacity and graceful stop; new risk tests.</td></tr>
              <tr><th scope="row">Phase 3: research package</th><td><Tag o="mine" /></td><td>Data validation, backtester, walk-forward ML, accounting audit, final-test ledger.</td></tr>
              <tr><th scope="row">Phase 4: signal bridge and this site</th><td><Tag o="mine" /></td><td>Loopback-only bridge with limits; static website.</td></tr>
            </tbody></table>
        </div>
      </section>

      <h2 className="sect" id="h-comp">Components</h2>
      <section className="grid-cards comps" aria-label="Components">
        <article className="card"><h3>Matching engine <Tag o="up" /></h3>
          <p>A pure function from a command stream to execution reports and market events. Prices and quantities are 64-bit integers (ticks and lots), never floating point. Orders match by price, then arrival. Order IDs pack a pool slot and a generation, so a stale ID is rejected instead of hitting a reused slot. I did not modify engine.hpp or book.hpp.</p></article>
        <article className="card"><h3>Journal and deterministic replay <Tag o="mod" /></h3>
          <p>The sequencer appends every accepted command to a memory-mapped, append-only file and stamps its sequence number. At startup the exchange replays the journal through the same engine to rebuild state. A replay sink hashes every report and event in order, so two runs can be compared exactly. My change: configurable capacity and a graceful stop with <code>JournalFull</code> rejections, replacing an <code>abort()</code>. Known gap: records carry no checksums and sync is off by default.</p></article>
        <article className="card"><h3>SQLite persistence <Tag o="mod" /></h3>
          <p>A history thread batches executions and balances into a WAL-mode database, committing at command boundaries at most once a second. Accounts use Argon2id password hashing. I found that creating a new account waited about 1 s for the next commit and fixed it with a waiting counter that triggers an earlier commit; schema and durability are unchanged.</p></article>
        <article className="card"><h3>Bot simulation <Tag o="mod" /></h3>
          <p>A 35-bot fleet drives the simulated market: a market maker (Avellaneda–Stoikov), trend follower, mean reverter, noise trader, news reactor and a price-anchor bot, over six symbols. Bots connect as ordinary clients. My only change is the macOS parent-death handling. Prices on this exchange come from these bots, not from real markets.</p></article>
        <article className="card"><h3>Python signal bridge <Tag o="mine" /></h3>
          <p>Turns research target weights into paper orders: long-only, allow-listed symbols, 50 shares and $10,000 per order, $25,000 per stock, $60,000 total, 20 orders per run, immediate-or-cancel limit orders within a 1% collar. It refuses any non-loopback host and defaults to a dry run.</p></article>
        <article className="card"><h3>Research lab <Tag o="mine" /></h3>
          <p>Reads a hashed daily-bar snapshot, runs a deterministic backtester and a purged walk-forward evaluation, and writes derived metrics. It imports nothing from the exchange, and the exchange imports nothing from it. See the Research page.</p></article>
      </section>

      <section className="card" aria-labelledby="h-lab">
        <h2 id="h-lab">Research, bridge and website boundaries</h2>
        <Diagram label="Research and bridge. Frozen daily bars feed the Python research lab, which writes results and target weights. The signal bridge sends limited orders over loopback to the C++ exchange. The website is separate static files with its own browser simulator and no connection to the exchange." vb={[1000, 340]} nodes={LAB} edges={LAB_EDGES}
          extra={<><line x1={10} x2={990} y1={228} y2={228} className="zone" /><text x={10} y={221} className="lbl">same machine, private</text><text x={10} y={246} className="lbl">public internet: static files only</text></>} />
        <ul>
          <li><b>The exchange is never exposed publicly.</b> The bridge rejects non-loopback hosts, and the website holds no exchange credentials.</li>
          <li><b>The website contains no exchange code.</b> Its Trading page is a TypeScript simulation with seeded random prices. It is not the C++ engine and not market data.</li>
        </ul>
      </section>

      <section className="card" aria-labelledby="h-num">
        <h2 id="h-num">Measured performance</h2>
        <p className="banner">These figures were measured by the upstream author on an Intel i5-12450H under Linux with pinned cores, and are quoted from the benchmark notes that came with the code. I have not re-run them on Linux, and they are not comparable to my Apple M1 measurements in Engineering.</p>
        <div className="scroll" tabIndex={0} role="region" aria-label="Upstream benchmark results (scrollable)"><table className="txt"><caption className="sr">Upstream benchmark results</caption><thead><tr><th scope="col">Measurement</th><th scope="col">Result</th></tr></thead>
          <tbody>{NUMBERS.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody></table></div>
        <p className="small">Latency histograms report bucket lower bounds and can understate a percentile by about 6%. The engine figure excludes networking, risk, persistence and accounts.</p>
      </section>

      <section className="card" aria-labelledby="h-live">
        <h2 id="h-live">Live C++ demo: not deployed</h2>
        <p>Nothing on this site connects to a running exchange. A real C++-backed demo would need a separate server and a hardened gateway; that is a design question, not a feature of this site, and it has not been implemented.</p>
      </section>
    </div>
  );
}
