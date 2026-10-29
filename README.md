# Wallstry case study (website)

Static React + TypeScript site that presents an independent engineering and research write-up built around the open-source-style "Wallstry" paper-trading exchange.

## Credit and scope
- The Wallstry C++ exchange, terminal app, Python client and original documents were written by an original author who is not identified in the copy the site author received. That copy has no licence, so none of it is in this repository. This site is not affiliated with that author.
- The site author's own work, described on the site: bug fixes, risk controls and tests for the exchange, a separate Python research lab, a signal bridge that turns model signals into risk-checked paper orders, and this website.

## Licence
MIT, covering only the website source in this repository (see `LICENSE`). It does not cover the original Wallstry code, any exchange or vendor market data, or third-party packages (React is MIT, Meta; see `public/THIRD_PARTY_NOTICES.txt`).

## Data
No raw or vendor price data ships here. The Research page contains hand-written summary prose and aggregate findings only. The demo's sample run is generated in the browser from seeded random numbers.

## Develop
See `DEPLOY.md`.
