import { useEffect, useRef, useState } from "react";
import type { Book, Candle } from "./sim";

/** Measured width of an element; falls back to `dflt` where ResizeObserver is missing (tests). */
export function useWidth(dflt = 760) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(dflt);
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.floor(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export const aggregate = (cs: Candle[], n: number): Candle[] => {
  if (n <= 1) return cs;
  const out: Candle[] = [];
  for (let i = cs.length % n || n; i <= cs.length; i += n) { // anchor on the latest bar so the newest group is always full
    const g = cs.slice(Math.max(0, i - n), i);
    out.push({ o: g[0].o, c: g[g.length - 1].c, h: Math.max(...g.map((x) => x.h)), l: Math.min(...g.map((x) => x.l)), v: g.reduce((s, x) => s + x.v, 0) });
  }
  return out;
};
export const sma = (xs: number[], n: number) => xs.map((_, i) => (i < n - 1 ? NaN : xs.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n));
const fmtV = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1e3).toFixed(0)}K`);

type CandleProps = { sym: string; cs: Candle[]; unit: string; showSma: boolean };
export function CandleChart({ sym, cs, unit, showSma }: CandleProps) {
  const [ref, W] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const H = 300, VH = 76, GAP = 6, AX = 56, B = 20, plotW = W - AX, step = plotW / cs.length;
  const lo = Math.min(...cs.map((c) => c.l)), hi = Math.max(...cs.map((c) => c.h)), pad = (hi - lo) * 0.06 || 1;
  const y = (p: number) => 6 + (1 - (p - (lo - pad)) / (hi - lo + 2 * pad)) * (H - 12);
  const vmax = Math.max(...cs.map((c) => c.v));
  const x = (i: number) => (i + 0.5) * step;
  const bw = Math.max(1, Math.min(14, step * 0.7));
  const ticks = Array.from({ length: 5 }, (_, i) => lo - pad + ((hi - lo + 2 * pad) * i) / 4);
  const ma = sma(cs.map((c) => c.c), 20);
  const idx = hover ?? cs.length - 1, k = cs[idx], prev = cs[idx - 1];
  const chg = k.c - (prev ? prev.c : k.o);
  const idxAt = (clientX: number, el: SVGSVGElement) => Math.min(cs.length - 1, Math.max(0, Math.floor((clientX - el.getBoundingClientRect().left) / step)));
  const last = cs[cs.length - 1];
  return (
    <div ref={ref} className="candle">
      <div className="ohlc" aria-live="off" data-testid="ohlc">
        <b>{sym}</b><span className="tag">SYNTHETIC · {unit}</span>
        {(["o", "h", "l", "c"] as const).map((f) => <span key={f}>{f.toUpperCase()} <i>{k[f].toFixed(2)}</i></span>)}
        <span className={chg >= 0 ? "up" : "dn"}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)} ({((chg / (k.c - chg)) * 100).toFixed(2)}%)</span>
        <span>Vol <i>{fmtV(k.v)}</i></span>
      </div>
      <svg width={W} height={H + GAP + VH + B} role="img" tabIndex={0} className="cnv"
        aria-label={`${sym} synthetic candlestick chart, ${cs.length} bars. Last close ${last.c.toFixed(2)}, range ${lo.toFixed(2)} to ${hi.toFixed(2)}. Use left and right arrow keys to inspect bars.`}
        onPointerMove={(e) => setHover(idxAt(e.clientX, e.currentTarget))} onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); setHover(Math.min(cs.length - 1, Math.max(0, idx + (e.key === "ArrowLeft" ? -1 : 1)))); } if (e.key === "Escape") setHover(null); }}
        onBlur={() => setHover(null)}>
        {ticks.map((t) => <g key={t}><line x1={0} x2={plotW} y1={y(t)} y2={y(t)} className="grid" />{Math.abs(y(t) - y(last.c)) > 12 && <text x={plotW + 6} y={y(t) + 4} className="axis">{t.toFixed(2)}</text>}</g>)}
        {cs.map((c, i) => {
          const up = c.c >= c.o, cls = up ? "upc" : "dnc";
          return (
            <g key={i} className={cls}>
              <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} />
              <rect x={x(i) - bw / 2} width={bw} y={Math.min(y(c.o), y(c.c))} height={Math.max(1, Math.abs(y(c.o) - y(c.c)))} />
              <rect x={x(i) - bw / 2} width={bw} y={H + GAP + VH - (c.v / vmax) * VH} height={(c.v / vmax) * VH} className="vol" />
            </g>
          );
        })}
        {showSma && <polyline className="sma" fill="none" points={ma.map((m, i) => (Number.isNaN(m) ? "" : `${x(i)},${y(m)}`)).filter(Boolean).join(" ")} />}
        <line x1={0} x2={plotW} y1={y(last.c)} y2={y(last.c)} className="lastline" />
        <g><rect x={plotW} y={y(last.c) - 9} width={AX} height={18} className={last.c >= last.o ? "tagbg up" : "tagbg dn"} /><text x={plotW + 6} y={y(last.c) + 4} className="axis lasttxt">{last.c.toFixed(2)}</text></g>
        {hover !== null && <g className="xh"><line x1={x(hover)} x2={x(hover)} y1={0} y2={H + GAP + VH} /><line x1={0} x2={plotW} y1={y(k.c)} y2={y(k.c)} /></g>}
        <text x={0} y={H + GAP + VH + 15} className="axis">bar 1</text>
        <text x={plotW} y={H + GAP + VH + 15} textAnchor="end" className="axis">bar {cs.length} ({unit})</text>
        <text x={plotW + 6} y={H + GAP + 12} className="axis">Volume</text>
      </svg>
    </div>
  );
}

/** Cumulative size by price, bids left and asks right, drawn as stepped areas. */
export function DepthChart({ bk }: { bk: Book }) {
  const W = 320, H = 110;
  const cum = (ls: { price: number; qty: number }[]) => ls.reduce<{ price: number; q: number }[]>((a, l) => [...a, { price: l.price, q: (a.at(-1)?.q ?? 0) + l.qty }], []);
  const bids = cum(bk.bids), asks = cum(bk.asks);
  const qmax = Math.max(bids.at(-1)!.q, asks.at(-1)!.q);
  const pmin = bids.at(-1)!.price, pmax = asks.at(-1)!.price;
  const x = (p: number) => ((p - pmin) / (pmax - pmin)) * W, y = (q: number) => H - 4 - (q / qmax) * (H - 12);
  const area = (ls: { price: number; q: number }[], edge: number) => {
    let d = `M${x(edge)},${H} L${x(edge)},${y(ls[0].q)}`;
    ls.forEach((l, i) => { d += ` L${x(l.price)},${y(i ? ls[i - 1].q : ls[0].q)} L${x(l.price)},${y(l.q)}`; });
    return d + ` L${x(ls.at(-1)!.price)},${H} Z`;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="depth-svg" role="img" preserveAspectRatio="none"
      aria-label={`Market depth. ${bids.at(-1)!.q} shares bid across 8 levels, ${asks.at(-1)!.q} shares offered across 8 levels.`}>
      <path d={area(bids, bids[0].price)} className="d-bid" /><path d={area(asks, asks[0].price)} className="d-ask" />
      <line x1={W / 2} x2={W / 2} y1={0} y2={H} className="mid" />
    </svg>
  );
}

export function Sparkline({ values, up }: { values: number[]; up: boolean }) {
  const lo = Math.min(...values), span = Math.max(...values) - lo || 1;
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * 60).toFixed(1)},${(18 - ((v - lo) / span) * 16).toFixed(1)}`).join(" ");
  return <svg viewBox="0 0 60 20" width="60" height="20" aria-hidden="true" className={up ? "spark up" : "spark dn"}><polyline points={pts} fill="none" strokeWidth="1.4" /></svg>;
}

export type BarRow = { label: string; value: number; note?: string };
/** Horizontal bars on a shared zero-based scale. Negative values (drawdowns) grow leftwards from a right-hand zero line. */
export function HBars({ title, rows, fmt, hl }: { title: string; rows: BarRow[]; fmt: (v: number) => string; hl?: string[] }) {
  const max = Math.max(...rows.map((r) => Math.abs(r.value)));
  const neg = rows.every((r) => r.value <= 0);
  return (
    <figure className="hb">
      <figcaption>{title}</figcaption>
      <ul aria-label={`${title}: ${rows.map((r) => `${r.label} ${fmt(r.value)}`).join("; ")}`}>
        {rows.map((r) => (
          <li key={r.label} className={`${neg ? "neg" : ""} ${hl?.includes(r.label) ? "hl" : ""}`}>
            <span className="lbl">{r.label}</span>
            <span className="trk"><i style={{ width: `${(Math.abs(r.value) / max) * 100}%` }} /></span>
            <span className="val">{fmt(r.value)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export type Dot = { label: string; a: number; b: number };
/** Two-point dot plot around a reference line (AUC vs 0.5). `a` is drawn hollow, `b` filled. */
export function DotPlot({ rows, lo, hi, ref, nameA, nameB, label }: { rows: Dot[]; lo: number; hi: number; ref: number; nameA: string; nameB: string; label: string }) {
  const [box, W] = useWidth(560);
  const L = 150, R = 16, RH = 34, H = rows.length * RH + 40;
  const x = (v: number) => L + ((v - lo) / (hi - lo)) * (W - L - R);
  const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);
  return (
    <div ref={box} className="dot">
      <svg width={W} height={H} role="img" aria-label={`${label}. ${rows.map((r) => `${r.label}: ${nameA} ${r.a.toFixed(3)}, ${nameB} ${r.b.toFixed(3)}`).join("; ")}. Reference line at ${ref}.`}>
        {ticks.map((t) => <g key={t}><line x1={x(t)} x2={x(t)} y1={6} y2={H - 26} className="grid" /><text x={x(t)} y={H - 10} textAnchor="middle" className="axis">{t.toFixed(2)}</text></g>)}
        <line x1={x(ref)} x2={x(ref)} y1={6} y2={H - 26} className="refline" />
        {rows.map((r, i) => {
          const y = 6 + i * RH + RH / 2;
          return (
            <g key={r.label}>
              <text x={0} y={y + 4} className="axis rowl">{r.label}</text>
              <line x1={x(r.a)} x2={x(r.b)} y1={y} y2={y} className="link" />
              <circle cx={x(r.a)} cy={y} r={6} className="da" /><circle cx={x(r.b)} cy={y} r={6} className="db" />
            </g>
          );
        })}
      </svg>
      <p className="legend"><span><i className="da" />{nameA}</span><span><i className="db" />{nameB}</span><span><i className="rl" />{ref} = coin flip</span></p>
    </div>
  );
}
