# Wallstry case study (website)

Static React + TypeScript site that presents an independent engineering and research write-up built around "Wallstry", a C++ paper-trading exchange written by someone else.

## Credit and scope
- The Wallstry C++ exchange, terminal app, Python client and original documents were written by GitHub user [whynotramaa](https://github.com/whynotramaa/wallstry) (verified against commit `0283b4c51617dd423edf950064636275cfd3aece`, "finalized:)"). That repository has no licence file or copyright notice, so none of it is in this repository. This site is not affiliated with that author.
- Aaditya Adhikari's work, described on the site: bug fixes, risk controls and tests for the exchange, a separate Python research lab, a signal bridge that turns model signals into risk-checked paper orders, and this website.
- The trading page is a browser-only simulation on seeded random prices. It was written independently and does not contain or run the original C++ engine.
- The website was built with AI assistance (AI coding tools were used for implementation, testing and copy).

## Licence
MIT, covering only the website source in this repository (see `LICENSE`). It does not cover the original Wallstry code, any exchange or vendor market data, or third-party packages (React is MIT, Meta; see `public/THIRD_PARTY_NOTICES.txt`).

## Data
No raw or vendor price data ships here. The Research page contains hand-written summary prose and aggregate findings only. The demo's sample run is generated in the browser from seeded random numbers.

## Develop
See `DEPLOY.md`.
