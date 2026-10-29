import { book, check, equity, LIMITS, newAccount, series, submit, SYMBOLS, type Sym } from "./sim";

const marks = Object.fromEntries(SYMBOLS.map((s) => [s, series(s)[100]])) as Record<Sym, number>;
const b = book("AAPL", 100);

test("series and book are deterministic", () => {
  expect(series("NVDA")).toEqual(series("NVDA"));
  expect(book("AAPL", 7)).toEqual(book("AAPL", 7));
  expect(series("AAPL")).not.toEqual(series("MSFT"));
  expect(b.bids[0].price).toBeLessThan(b.asks[0].price);
});

test("market buy walks the book and conserves value", () => {
  const a = newAccount();
  const r = submit(a, { side: "buy", sym: "AAPL", qty: 20, type: "market" }, b, 100, marks);
  expect(r.error).toBeUndefined();
  expect(r.filled).toBe(20);
  expect(r.acct.pos.AAPL).toBe(20);
  const spent = r.acct.fills.reduce((s, f) => s + f.qty * f.price, 0);
  expect(r.acct.cash).toBeCloseTo(LIMITS.startCash - spent, 6);
  expect(a.fills).toHaveLength(0); // input untouched
});

test("limit order below the market is cancelled, not rested", () => {
  const r = submit(newAccount(), { side: "buy", sym: "AAPL", qty: 5, type: "limit", limit: b.bids[0].price - 1 }, b, 100, marks);
  expect(r.filled).toBe(0);
  expect(r.acct.fills).toHaveLength(0);
});

test.each([
  [{ side: "sell", sym: "AAPL", qty: 1, type: "market" }, /Long-only/],
  [{ side: "buy", sym: "AAPL", qty: 0, type: "market" }, /whole number/],
  [{ side: "buy", sym: "AAPL", qty: 1.5, type: "market" }, /whole number/],
  [{ side: "buy", sym: "AAPL", qty: 51, type: "market" }, /order limit/],
  [{ side: "buy", sym: "AAPL", qty: 5, type: "limit" }, /positive price/],
  [{ side: "buy", sym: "AAPL", qty: 50, type: "limit", limit: 300 }, /Order value/], // 50 x $300 = $15k > $10k cap
] as const)("rejects %j", (o, msg) => {
  expect(check(newAccount(), o, b, marks)).toMatch(msg);
});

test("equity marks positions and cash adds up", () => {
  const r = submit(newAccount(), { side: "buy", sym: "AAPL", qty: 10, type: "market" }, b, 100, marks);
  const spent = r.acct.fills.reduce((s, f) => s + f.qty * f.price, 0);
  expect(equity(r.acct, marks)).toBeCloseTo(LIMITS.startCash - spent + 10 * marks.AAPL, 6);
});

import { buyingPower, candles, holdings, place } from "./sim";

test("candles are deterministic, consistent with closes, and internally valid", () => {
  const cs = candles("TSLA");
  expect(cs).toEqual(candles("TSLA"));
  expect(cs.map((c) => c.c)).toEqual(series("TSLA"));
  for (const c of cs) { expect(c.h).toBeGreaterThanOrEqual(Math.max(c.o, c.c)); expect(c.l).toBeLessThanOrEqual(Math.min(c.o, c.c)); expect(c.v).toBeGreaterThan(0); }
});

test("place() classifies filled, partial, cancelled and rejected orders", () => {
  const a = newAccount();
  expect(place(a, { side: "buy", sym: "AAPL", qty: 5, type: "market" }, b, 100, marks, 1).rec.status).toBe("Filled");
  expect(place(a, { side: "buy", sym: "AAPL", qty: 5, type: "limit", limit: b.bids[0].price - 1 }, b, 100, marks, 2).rec.status).toBe("Cancelled");
  expect(place(a, { side: "sell", sym: "AAPL", qty: 5, type: "market" }, b, 100, marks, 3).rec.status).toBe("Rejected");
  const thin = { ...b, asks: [{ price: b.asks[0].price, qty: 3 }, ...b.asks.slice(1, 1)] };
  const p = place(a, { side: "buy", sym: "AAPL", qty: 5, type: "market" }, thin, 100, marks, 4).rec;
  expect([p.status, p.filled]).toEqual(["Partially filled", 3]);
});

test("holdings track average cost and realized P&L; buying power respects exposure cap", () => {
  let a = newAccount();
  a = place(a, { side: "buy", sym: "AAPL", qty: 10, type: "market" }, b, 100, marks, 1).acct;
  const bought = a.fills.reduce((s, f) => s + f.qty * f.price, 0);
  expect(holdings(a).AAPL!.cost / 10).toBeCloseTo(bought / 10, 6);
  const sold = place(a, { side: "sell", sym: "AAPL", qty: 10, type: "market" }, b, 100, marks, 2).acct;
  const h = holdings(sold).AAPL!;
  expect(h.qty).toBe(0);
  expect(h.realized).toBeCloseTo(equity(sold, marks) - LIMITS.startCash, 6); // flat book: realized == total P&L
  expect(buyingPower(newAccount(), marks)).toBe(LIMITS.startCash > LIMITS.maxGross ? LIMITS.maxGross : LIMITS.startCash);
});
