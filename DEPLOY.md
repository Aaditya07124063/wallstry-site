# Wallstry case study site: build and Cloudflare Pages preparation (NOT deployed)

## Local
```bash
npm ci
npm run dev            # http://localhost:5173
npm test               # vitest
npm run build          # tsc + vite build -> dist/
npm run check:bundle   # fails on secrets, private paths, source maps, raw-data markers
npm run preview        # serve dist/ at http://localhost:4173
```

## Cloudflare Pages settings (when you decide to deploy)
| Setting | Value |
|---|---|
| Root directory | `/` (repository root) |
| Build command | `npm ci && npm run build && npm run check:bundle` |
| Output directory | `dist` |
| `NODE_VERSION` | `22` or newer (tested on Node 22 and 26) |
| Environment variables | none required |

`public/_headers` ships a strict CSP and security headers (untested on Cloudflare itself). Routing is hash-based, so no `_redirects` file is needed.

## Backend hosting design (separate from Pages; not built)
Cloudflare Pages serves static files only and cannot run the persistent native C++ exchange.
1. Run `build/exchange` + bots on a small Linux VM/container (the engine is only tested on macOS arm64; Linux x86 needs a build and test pass). Bind to `127.0.0.1` or a private network. Never open port 9100 publicly.
2. Put a thin API in front (read-only market snapshot plus rate-limited paper orders using server-side demo accounts), the only thing that talks to the exchange, reusing `bridge/signal_bridge.py` limits.
3. Expose the API through Cloudflare Tunnel (no inbound ports), with WAF rate limiting and CORS limited to the Pages origin. Credentials live in server-side secrets, never in `VITE_*` variables.
4. Until then the site's demo is the in-browser simulation plus its generated sample run, both labelled as such.

## Publication blockers
- The original Wallstry code has no licence and no identified author. It is not in this repository or the bundle.
- No vendor data is redistributed: the Research page is summary prose, and price charts are synthetic.
