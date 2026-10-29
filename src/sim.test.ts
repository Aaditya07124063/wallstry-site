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
