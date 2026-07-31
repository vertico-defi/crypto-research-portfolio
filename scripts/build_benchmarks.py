"""Build transparent BTC/ETH/SOL buy-and-hold reference series from accepted local bars.

This is a read-only consumer of CTREND's derived daily-bar artifact.  It never
changes the source laboratory and emits only compact derived benchmark returns.
"""
from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd


WORKSPACE = Path(os.environ.get("CRYPTO_RESEARCH_WORKSPACE", Path.cwd().parent))
SOURCE = Path(os.environ.get("CTREND_BARS", WORKSPACE / "ctrend-lab/data/derived/liquidity_v1/daily_bars.parquet"))
OUTPUT = Path("public/data/buy-and-hold.json")
SYMBOLS = {"BTC": "BTCUSDT", "ETH": "ETHUSDT", "SOL": "SOLUSDT"}
START = pd.Timestamp("2026-01-01", tz="UTC")
INITIAL_VALUE = 10_000.0


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"required accepted bar artifact is unavailable: {SOURCE}")
    frame = pd.read_parquet(SOURCE, columns=["symbol", "timestamp_utc", "close"])
    frame["timestamp_utc"] = pd.to_datetime(frame["timestamp_utc"], utc=True)
    assets: list[dict[str, object]] = []
    for asset, symbol in SYMBOLS.items():
        rows = frame[(frame["symbol"] == symbol) & (frame["timestamp_utc"] >= START)].copy()
        rows = rows.drop_duplicates("timestamp_utc", keep="last").sort_values("timestamp_utc")
        if rows.empty or (rows["close"] <= 0).any():
            raise SystemExit(f"invalid or absent {symbol} benchmark observations")
        first_close = float(rows.iloc[0]["close"])
        values = (rows["close"].astype(float) / first_close * INITIAL_VALUE).round(6)
        assets.append({
            "asset": asset,
            "symbol": symbol,
            "window_start_utc": rows.iloc[0]["timestamp_utc"].isoformat().replace("+00:00", "Z"),
            "window_end_utc": rows.iloc[-1]["timestamp_utc"].isoformat().replace("+00:00", "Z"),
            "initial_value_usd": INITIAL_VALUE,
            "final_value_usd": float(values.iloc[-1]),
            "total_return_pct": round((float(values.iloc[-1]) / INITIAL_VALUE - 1) * 100, 6),
            "observations": int(len(rows)),
            "series": [
                {"timestamp_utc": timestamp.isoformat().replace("+00:00", "Z"), "normalized_value_usd": float(value)}
                for timestamp, value in zip(rows["timestamp_utc"], values, strict=True)
            ],
        })
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "status": "COMPUTED_DERIVED_REFERENCE_ONLY",
        "methodology": "Daily close buy-and-hold, normalized to USD 10,000 at each asset's first available UTC observation on or after 2026-01-01. No strategy comparison is implied.",
        "source": {"dataset": "CTREND liquidity_v1 derived daily bars", "sha256": sha256(SOURCE)},
        "assets": assets,
        "warning": "These are reference benchmarks only. They must not be ranked against prediction outputs, infrastructure audits, or incomplete strategy P&L.",
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"assets": len(assets), "output": str(OUTPUT)}))


if __name__ == "__main__":
    main()
