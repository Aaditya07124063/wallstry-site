// Deterministic browser simulation. NOT the C++ engine and NOT real market data: seeded random numbers only.
export const SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN"] as const;
export type Sym = (typeof SYMBOLS)[number];
export const LIMITS = { maxQty: 50, maxOrderNotional: 10_000, maxPosition: 25_000, maxGross: 60_000, startCash: 100_000 };
const START: Record<Sym, [number, number]> = { AAPL: [150, 0.25], MSFT: [300, 0.22], NVDA: [120, 0.5], TSLA: [220, 0.55], AMZN: [140, 0.3] };

export function rng(seed: number) { // mulberry32
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);
const normal = (r: () => number) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

/** Synthetic daily closes (geometric random walk). Same symbol -> same series, always. */
export function series(sym: Sym, n = 504): number[] {
  const r = rng(hash(sym));
  const [p0, vol] = START[sym];
  const out = [p0];
  for (let i = 1; i < n; i++) out.push(+(out[i - 1] * Math.exp((0.08 - vol * vol / 2) / 252 + (vol / Math.sqrt(252)) * normal(r))).toFixed(2));
  return out;
}

export type Level = { price: number; qty: number };
export type Book = { bids: Level[]; asks: Level[]; mid: number };
/** Book for (symbol, tick): 8 levels a side around the series price at that tick. */
export function book(sym: Sym, tick: number, closes = series(sym)): Book {
  const mid = closes[Math.min(tick, closes.length - 1)];
  const r = rng(hash(sym) ^ (tick * 2654435761));
  const step = Math.max(0.01, +(mid * 0.0005).toFixed(2));
  const half = step;
  const side = (dir: 1 | -1): Level[] => Array.from({ length: 8 }, (_, i) => ({
    price: +(mid + dir * (half + i * step)).toFixed(2), qty: 5 + Math.floor(r() * 40),
  }));
  return { bids: side(-1), asks: side(1), mid };
}

export type Order = { side: "buy" | "sell"; sym: Sym; qty: number; type: "market" | "limit"; limit?: number };
export type Fill = { sym: Sym; side: "buy" | "sell"; qty: number; price: number; tick: number };
export type Account = { cash: number; pos: Partial<Record<Sym, number>>; fills: Fill[] };
export const newAccount = (): Account => ({ cash: LIMITS.startCash, pos: {}, fills: [] });

/** Risk checks mirror bridge/signal_bridge.py: long-only, qty/notional/position/gross caps, cash. Returns an error or null. */
export function check(acct: Account, o: Order, b: Book, marks: Record<Sym, number>): string | null {
  if (!Number.isInteger(o.qty) || o.qty <= 0) return "Quantity must be a whole number above zero.";
  if (o.qty > LIMITS.maxQty) return `Quantity above the ${LIMITS.maxQty}-share order limit.`;
  if (o.type === "limit" && !(o.limit && o.limit > 0)) return "Limit orders need a positive price.";
  const px = o.type === "limit" ? o.limit! : o.side === "buy" ? b.asks[0].price : b.bids[0].price;
  if (px * o.qty > LIMITS.maxOrderNotional) return `Order value above the $${LIMITS.maxOrderNotional.toLocaleString()} limit.`;
  const held = acct.pos[o.sym] ?? 0;
  if (o.side === "sell") return o.qty > held ? "Long-only: you cannot sell more than you hold (no shorting)." : null;
  if ((held + o.qty) * px > LIMITS.maxPosition) return `Position would exceed $${LIMITS.maxPosition.toLocaleString()} in ${o.sym}.`;
  const gross = SYMBOLS.reduce((s, k) => s + (acct.pos[k] ?? 0) * marks[k], 0);
  if (gross + o.qty * px > LIMITS.maxGross) return `Total exposure would exceed $${LIMITS.maxGross.toLocaleString()}.`;
  if (o.qty * px > acct.cash) return "Not enough cash.";
  return null;
}

/** Immediate-or-cancel: walks the book, fills what crosses, cancels the rest. Never mutates the input account. */
export function submit(acct: Account, o: Order, b: Book, tick: number, marks: Record<Sym, number>): { acct: Account; error?: string; filled: number } {
  const error = check(acct, o, b, marks);
  if (error) return { acct, error, filled: 0 };
  const levels = o.side === "buy" ? b.asks : b.bids;
  let left = o.qty, cash = acct.cash, filled = 0;
  const fills: Fill[] = [];
  for (const lv of levels) {
    const crosses = o.type === "market" || (o.side === "buy" ? lv.price <= o.limit! : lv.price >= o.limit!);
    if (!crosses || left === 0) break;
    const q = Math.min(left, lv.qty);
    if (o.side === "buy" && q * lv.price > cash) break; // walking the book can cost more than the best ask
    left -= q; filled += q;
    cash += (o.side === "buy" ? -1 : 1) * q * lv.price;
    fills.push({ sym: o.sym, side: o.side, qty: q, price: lv.price, tick });
  }
  const pos = { ...acct.pos, [o.sym]: (acct.pos[o.sym] ?? 0) + (o.side === "buy" ? filled : -filled) };
  return { acct: { cash, pos, fills: [...acct.fills, ...fills] }, filled };
}

export const equity = (a: Account, marks: Record<Sym, number>) => a.cash + SYMBOLS.reduce((s, k) => s + (a.pos[k] ?? 0) * marks[k], 0);

export type Candle = { o: number; h: number; l: number; c: number; v: number };
const BASE_VOL: Record<Sym, number> = { AAPL: 55e6, MSFT: 22e6, NVDA: 90e6, TSLA: 80e6, AMZN: 45e6 };
/** Synthetic OHLCV derived from the synthetic closes: open = prior close, wicks and volume from a seeded RNG. */
export function candles(sym: Sym, closes = series(sym)): Candle[] {
  const r = rng(hash(sym) ^ 0x9e3779b9);
  const daily = START[sym][1] / Math.sqrt(252);
  return closes.map((c, i) => {
    const o = i ? closes[i - 1] : c;
    const wick = () => 1 + Math.abs(normal(r)) * daily * 0.5;
    const h = +(Math.max(o, c) * wick()).toFixed(2), l = +(Math.min(o, c) / wick()).toFixed(2);
    const move = Math.abs(c / o - 1) / daily; // bigger moves trade more
    return { o, h, l, c, v: Math.round(BASE_VOL[sym] * (0.6 + 0.5 * move) * Math.exp(0.25 * normal(r))) };
  });
}

/** Average-cost long-only position book from the fill list: shares, avg cost, realized P&L per symbol. */
export function holdings(a: Account) {
  const h: Partial<Record<Sym, { qty: number; cost: number; realized: number }>> = {};
  for (const f of a.fills) {
    const p = (h[f.sym] ??= { qty: 0, cost: 0, realized: 0 });
    if (f.side === "buy") { p.cost += f.qty * f.price; p.qty += f.qty; }
    else { const avg = p.cost / p.qty; p.realized += f.qty * (f.price - avg); p.cost -= f.qty * avg; p.qty -= f.qty; }
  }
  return h;
}

export type Status = "Filled" | "Partially filled" | "Cancelled" | "Rejected";
export type OrderRec = { id: number; tick: number; order: Order; status: Status; filled: number; avg: number; note: string };
/** submit() plus a blotter record. Limit orders are IOC, so they never rest: unfilled quantity is cancelled. */
export function place(acct: Account, o: Order, b: Book, tick: number, marks: Record<Sym, number>, id: number): { acct: Account; rec: OrderRec } {
  const r = submit(acct, o, b, tick, marks);
  const mine = r.acct.fills.slice(acct.fills.length);
  const avg = r.filled ? mine.reduce((s, f) => s + f.qty * f.price, 0) / r.filled : 0;
  const base = { id, tick, order: o, filled: r.filled, avg };
  if (r.error) return { acct, rec: { ...base, status: "Rejected", note: r.error } };
  if (r.filled === o.qty) return { acct: r.acct, rec: { ...base, status: "Filled", note: `${mine.length} fill${mine.length > 1 ? "s" : ""}` } };
  if (r.filled) return { acct: r.acct, rec: { ...base, status: "Partially filled", note: `${o.qty - r.filled} unfilled shares cancelled (IOC)` } };
  return { acct, rec: { ...base, status: "Cancelled", note: o.type === "limit" ? "Limit did not cross the book; cancelled (IOC)" : "No liquidity or cash for the first level; cancelled" } };
}

/** Cash available for new buys: bounded by cash and by remaining gross-exposure headroom. */
export const buyingPower = (a: Account, marks: Record<Sym, number>) =>
  Math.max(0, Math.min(a.cash, LIMITS.maxGross - SYMBOLS.reduce((s, k) => s + (a.pos[k] ?? 0) * marks[k], 0)));
