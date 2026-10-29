// Fails if the production bundle contains anything that looks like a secret, a private path, or raw market data.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const bad = [/\/Users\/[a-z]/i, /\.journal|wallstry\.db/, /BEGIN [A-Z ]*PRIVATE KEY/, /AKIA[0-9A-Z]{16}/, /(api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']{8,}/i,
  /\bsnapshots?\/\d{8}_/, /[\w.+-]+@gmail\.com/, /sourceMappingURL/, /adj_close/i, /recorded-run|SIMULATED EXCHANGE - PAPER/];
// Derived research metrics stay local until provider terms are cleared; set ALLOW_RESEARCH_METRICS=1 only for a local preview.
if (!process.env.ALLOW_RESEARCH_METRICS) bad.push(/8a05979d3a73|final_test_ledger|"?total_return"?\s*:|\bAUC\b[^.]{0,40}\d\.\d{2}|Sharpe/);
const files = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? files(join(d, f)) : [join(d, f)]));
let fail = 0;
for (const f of files("dist")) {
  if (f.endsWith(".map")) { console.log("FAIL source map shipped:", f); fail++; continue; }
  if (!/\.(js|html|css|json|svg|txt)$/.test(f)) continue;
  const t = readFileSync(f, "utf8");
  for (const re of bad) if (re.test(t)) { console.log("FAIL", re, "in", f); fail++; }
}
console.log(fail ? `bundle check FAILED (${fail})` : "bundle check passed: no secrets, private paths, source maps or raw-data markers");
process.exit(fail ? 1 : 0);
