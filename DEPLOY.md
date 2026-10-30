# Wallstry case study site: build and Cloudflare Pages preparation (deployed at https://wallstry-site.pages.dev/)

## Local
```bash
npm ci
npm run dev            # http://localhost:5173
npm test               # vitest
npm run build          # tsc + vite build -> dist/
npm run check:bundle   # fails on secrets, private paths, source maps, raw-data markers
npm run preview        # serve dist/ at http://localhost:4173
```

## Cloudflare Pages settings
| Setting | Value |
|---|---|
| Root directory | `/` (repository root) |
| Build command | `npm ci && npm run build && npm run check:bundle` |
| Output directory | `dist` |
| `NODE_VERSION` | `22` or newer (tested on Node 22 and 26) |
| Environment variables | none required |

`public/_headers` ships a strict CSP and security headers (confirmed served by Cloudflare Pages on 2026-10-29). Routing is hash-based, so no `_redirects` file is needed.

## Backend hosting design (separate from Pages; not built)
Cloudflare Pages serves static files only and cannot run the persistent native C++ exchange.
1. Run `build/exchange` + bots on a small Linux VM/container (the engine is only tested on macOS arm64; Linux x86 needs a build and test pass). Bind to `127.0.0.1` or a private network. Never open port 9100 publicly.
2. Put a thin API in front (read-only market snapshot plus rate-limited paper orders using server-side demo accounts), the only thing that talks to the exchange, reusing `bridge/signal_bridge.py` limits.
3. Expose the API through Cloudflare Tunnel (no inbound ports), with WAF rate limiting and CORS limited to the Pages origin. Credentials live in server-side secrets, never in `VITE_*` variables.
4. Until then the site's demo is the in-browser simulation plus its generated sample run, both labelled as such.

## Publication blockers
- The original Wallstry code (github.com/whynotramaa/wallstry @ 0283b4c) has no licence file or copyright notice. It is not in this repository or the bundle.
- No vendor data is redistributed: the Research page is summary prose, and price charts are synthetic.

## Research metrics are local-only (release gate)
`src/research-data.local.ts` and `src/Research.local.tsx` are gitignored. A clean checkout builds the "figures withheld" Research page.
`npm run check:bundle` fails if derived metrics are in `dist/` (override for local preview only: `ALLOW_RESEARCH_METRICS=1`).
End-to-end tests: `npm run e2e` runs a `chromium` project (installed Google Chrome) and a `webkit` project (needs `npx playwright install webkit`; use `--project=chromium` or `--project=webkit` to run one).

Verification limitations of the 2026-10-30 release check:
- Chromium E2E (49 tests) ran on Google Chrome 156 with Playwright 1.56.1 and passed.
- The pinned WebKit (rev 2215) download stalled and was **not tested**. WebKit was run only on a locally available fallback build (webkit-2370, reports 26.0) and passed 49/49, but with a temporary substitution: `@axe-core/playwright` timed out on that build, so the axe-core rules were injected directly instead (same wcag2a/2aa/21aa rule set, same axe-core). The committed spec still uses `@axe-core/playwright`; it has not run on WebKit.
