# Interview guide

Use these explanations as evidence-first descriptions. None turns predictions,
data collection, or a diagnostic into a trading-performance claim.

## Direction V3

- **30 seconds:** A leakage-aware cross-sectional forecasting system in frozen
  prospective shadow mode. It produces probabilities, not accepted P&L.
- **Two minutes / architecture:** Point-in-time input panels feed causal
  targets and rolling walk-forward evaluation. Model identity is frozen so a
  later repair cannot silently change the system under evaluation.
- **Strongest engineering decision:** Explicit model-identity and timestamp
  gates.
- **Research-integrity decision / negative finding:** Prediction quality is not
  trading performance; there is no accepted return series.
- **Difficult bug / next valid step:** Target-label and model-identity mismatch;
  only an audited prospective outcome window can advance the work.
- **Likely question:** “Why not backfill a P&L?” **Answer:** That would combine
  a prediction artifact with unvalidated execution assumptions and misstate
  the evidence.

## Perp Carry

- **30 seconds:** A synchronized cross-venue perpetual-market reliability
  system, not a carry-profit claim.
- **Two minutes / architecture:** Append-only raw collection is normalized into
  queryable tables, while health, clock evidence, bounded collection, writer
  closure, and independent finalization provide lifecycle evidence.
- **Strongest engineering decision:** Separating writer and finalizer avoids
  lock conflicts and preserves an auditable terminal chain.
- **Research-integrity decision / negative finding:** Infrastructure success is
  not profitability; capital permission is zero.
- **Difficult bug / next valid step:** Scheduler/lifecycle liveness; complete
  the bounded audit and assess its infrastructure verdict before proposing a
  new research phase.
- **Likely question:** “What does successful collection prove?” **Answer:** It
  proves availability and lifecycle behavior, not an economic edge.

## CTREND liquidity v1

- **30 seconds:** A causal Binance USD-M reconstruction that preserved a
  negative net diagnostic and formal `INTEGRITY_FAILURE` instead of forcing an
  edge.
- **Two minutes / architecture:** The system reconstructs a point-in-time
  universe, derives causal features, applies frozen execution costs and funding
  accounting, then evaluates with robust validation controls.
- **Strongest engineering decision:** Preserve missing official funding as
  missing rather than interpolating it.
- **Research-integrity decision / negative finding:** Complete-coverage net
  evidence is unavailable and the practical result is a no-go.
- **Difficult bug / next valid step:** Funding-gap accounting clarity; acquire
  valid coverage under a new protocol before any re-evaluation.
- **Likely question:** “Why keep a failed result public?” **Answer:** It shows
  that the controls can invalidate a plausible headline before capital is put
  at risk.

## Strategy control center

- **30 seconds:** A read-only multi-strategy registry that normalizes different
  evidence states without treating them as comparable investments.
- **Two minutes / architecture:** It references immutable reports, normalizes
  status and capital gates, and deliberately has no execution path.
- **Strongest engineering decision:** One explicit vocabulary for evidence and
  capital permissions.
- **Research-integrity decision / next step:** Do not collapse prediction,
  infrastructure, and economic results into a scoreboard; refresh only from
  audited source evidence.
