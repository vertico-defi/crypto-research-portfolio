# Why Most Crypto Backtests Lie

## 12 Failure Modes from Building an Audit-First Crypto Research Lab

This free educational guide uses sanitized evidence from the Vertico Research
Portfolio. It does not disclose restricted data, private logs, machine paths,
unpublished source code, or sensitive implementation details.

1. **Survivorship bias.** A current asset list can remove failures from the past. Reconstruct the universe as it was known at each decision time.
2. **Point-in-time universe errors.** Listings, delistings, and data revisions cannot enter earlier decisions.
3. **Same-bar execution.** A bar cannot reveal a signal and fill an order at a price that occurred before the signal was known.
4. **Forward scanning for missing fills.** Future observations cannot repair an unavailable execution price.
5. **Gap and quarantine leakage.** Gaps and quarantined data require a frozen exclusion rule; otherwise unavailable observations leak into the result.
6. **Fold contamination.** Tuning, transformations, and labels must not cross the development/evaluation boundary.
7. **Underestimated fees and slippage.** Missing executable prices and unfrozen costs are evidence limits, not permission to assume frictionless trading.
8. **Lucky parameters and random seeds.** A documented search space matters because selection can manufacture an attractive result.
9. **Confusing test-suite success with profitability.** Tests verify covered software behavior, not an economic edge.
10. **Ignoring bootstrap uncertainty.** A point estimate hides sampling uncertainty; intervals clarify what is not known.
11. **Ignoring DSR and multiple testing.** More trials increase false-positive risk. Deflated Sharpe Ratio and a trial record help bound that risk.
12. **Opening the final holdout too early.** A holdout that influences development is no longer independent.

## Public evidence boundary

The sanitized public snapshot records zero capital permission, no accepted
strategy P&L, and sealed final holdouts. The requested v5 source checkpoint
`5303653` and `AUDIT_PENDING_SERVICE_RECOVERY` are not available through the
local publication adapter. No performance figures from that unavailable state
are repeated here.

## Disclosure

This is educational material, not personalised investment advice, a trading
signal, live portfolio management, automated customer trading, or access to an
unfinished strategy.
