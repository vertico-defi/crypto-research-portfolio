# Vertico Research Portfolio

[![Validate](https://github.com/vertico-defi/crypto-research-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/vertico-defi/crypto-research-portfolio/actions/workflows/ci.yml)

An employer-facing, evidence-first presentation of crypto research engineering.
It is a read-only static snapshot system: it does not trade, connect to an
exchange, custody a wallet, or claim that research output is approved capital
performance.

## Evidence taxonomy

- **Direction V3:** frozen prospective probabilistic forecasting research; no accepted trading P&L.
- **Perp Carry:** synchronized cross-venue data and lifecycle audit; infrastructure evidence is not profitability evidence.
- **CTREND liquidity v1:** formal `INTEGRITY_FAILURE`; the complete-coverage net diagnostic is negative and capital permission is zero.

The comparison UI defaults to `Not comparable` rather than inventing returns.
Diagnostic-only series require explicit warnings and are never capital eligible.

## Architecture

```text
Read-only local source evidence
          │
          ▼
npm run snapshot ──► versioned public/data JSON ──► Next.js server/static pages
                                                      │
                                                      ▼
                                               GitHub Pages static export
```

Routes: `/`, `/strategies/*`, `/compare`, `/data`, `/methodology`,
`/audit-trail`, `/github`, `/about`, and `/legal/*`. API route placeholders
exist only for a future, separately authorized commerce phase and remain
disabled with `STORE_LIVE=false`.

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

Static Pages mode is `PUBLIC_STATIC_DEPLOY=true STORE_LIVE=false npm run build`.
It must pass dependency and static-export gates before deployment.

## Security and commerce status

`STORE_LIVE=false` is mandatory. There is no payment acceptance, Solana wallet,
Supabase persistence, product delivery, or legal-consent collection in this
version. See [SECURITY.md](SECURITY.md), [REPRODUCIBILITY.md](REPRODUCIBILITY.md),
and [DEPLOYMENT_HANDOFF.md](DEPLOYMENT_HANDOFF.md).

## Engineering lessons

The portfolio treats provenance, negative results, data rights, reproducible
builds, and explicit no-go gates as engineering deliverables—not marketing
exceptions.
