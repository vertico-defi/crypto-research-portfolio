# Vertico Research Portfolio

[![Validate](https://github.com/vertico-defi/crypto-research-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/vertico-defi/crypto-research-portfolio/actions/workflows/ci.yml)

An employer-facing, evidence-first presentation of crypto research engineering.
It is a read-only static snapshot system: it does not trade, connect to an
exchange, custody a wallet, or claim that research output is approved capital
performance.

## Evidence taxonomy

- **Direction V3:** frozen prospective probabilistic forecasting research; no accepted trading P&L.
- **Perp Carry:** complete 24-hour collector audit with 100% snapshot completeness, but a frozen clock gate failed; infrastructure reliability is not profitability evidence.
- **CTREND liquidity v1:** formal `INTEGRITY_FAILURE`; the complete-coverage net diagnostic is negative and capital permission is zero.

The comparison UI defaults to `Not comparable` rather than inventing returns.
Diagnostic-only series require explicit warnings and are never capital eligible.

## Architecture

```text
Read-only local source evidence
          │
          ▼
npm run snapshot ──► versioned public/data JSON ──► Node built-in static compiler
                                                     │
                                                     ▼
                                              GitHub Pages static export
```

Routes: `/`, `/strategies/*`, `/compare`, `/data`, `/methodology`,
`/audit-trail`, `/github`, `/about`, and `/legal/*`. The public artifact has
no API routes, server runtime, checkout, or payment integration.

## Data and publication rights

The snapshot generator records source commits, hashes, verdicts, and warnings.
It fails closed for unclear rights. Raw exchange archives, author packages,
papers, private logs, credentials, and PII are excluded from public artifacts.

## Local development

```bash
npm install
npm run snapshot
npm run test
npm run typecheck
npm run build
```

The snapshot and benchmark commands are read-only consumers of sibling
laboratories. By default they expect `../crypto-direction-lab`,
`../perp-carry-lab`, and `../ctrend-lab`; set `CRYPTO_RESEARCH_WORKSPACE` to
their parent directory and `CTREND_PYTHON` to the Python environment that can
read the accepted Parquet bars when using another layout. `npm run
audit:publication` scans every reachable source-history ref and records only
aggregate findings; it never publishes a source laboratory.

`STORE_LIVE=false npm run build` creates `out/` using only Node built-ins. This
static-only migration removed the affected Next.js/PostCSS/Sharp dependency
tree; `npm audit --omit=dev --audit-level=high` now reports zero findings. The
Pages workflow deploys only this generated artifact.

### Screenshot procedure

After the security gate is green, build the static export, serve `out/` with a
local static server, and capture `/` plus `/strategies/ctrend` at 1440px and
390px widths. Store only the rendered public pages under `docs/screenshots/`;
never capture local paths, console output, runtime data, or credentials.

## Security and commerce status

`STORE_LIVE=false` is mandatory. There is no payment acceptance, Solana wallet,
Supabase persistence, product delivery, or legal-consent collection in this
version. See [SECURITY.md](SECURITY.md), [REPRODUCIBILITY.md](REPRODUCIBILITY.md),
and [DEPLOYMENT_HANDOFF.md](DEPLOYMENT_HANDOFF.md).

## Engineering lessons

The portfolio treats provenance, negative results, data rights, reproducible
builds, and explicit no-go gates as engineering deliverables—not marketing
exceptions.
