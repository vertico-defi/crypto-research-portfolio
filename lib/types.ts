export type Verdict = "DATA_NO_GO" | "INTEGRITY_FAILURE" | "SHADOW" | "INFRASTRUCTURE_AUDIT" | "HISTORICAL_NO_GO";
export type Strategy = { id: string; title: string; verdict: Verdict; disposition: string; capitalPermitted: 0; pnl: "none" | "diagnostic"; warning: string; sourceCommit: string; report: string };
export type Product = { product_id: string; title: string; status: "DRAFT" | "PENDING_AUDIT_COMPLETION"; price_usdc: null; rights: "STORE_ELIGIBLE_DERIVED" | "PUBLIC_SAMPLE_ONLY"; risk_disclaimer: string };
