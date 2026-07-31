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


def metrics(values: pd.Series) -> dict[str, float]:
    returns = values.pct_change().dropna()
    drawdown = values / values.cummax() - 1
    return {
        "cumulative_return_pct": round((float(values.iloc[-1]) / INITIAL_VALUE - 1) * 100, 6),
        "annualized_volatility_pct": round(float(returns.std(ddof=1) * (365 ** 0.5) * 100), 6) if len(returns) > 1 else 0.0,
        "maximum_drawdown_pct": round(float(drawdown.min() * 100), 6),
    }


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"required accepted bar artifact is unavailable: {SOURCE}")
    frame = pd.read_parquet(SOURCE, columns=["symbol", "timestamp_utc", "close"])
    frame["timestamp_utc"] = pd.to_datetime(frame["timestamp_utc"], utc=True)
    requested_cutoff = pd.Timestamp(datetime.now(timezone.utc).date(), tz="UTC") - pd.Timedelta(days=1)
    per_asset: dict[str, pd.DataFrame] = {}
    for asset, symbol in SYMBOLS.items():
        rows = frame[(frame["symbol"] == symbol) & (frame["timestamp_utc"] >= START) & (frame["timestamp_utc"] <= requested_cutoff)].copy()
        rows = rows.drop_duplicates("timestamp_utc", keep="last").sort_values("timestamp_utc")
        if rows.empty or (rows["close"] <= 0).any():
            raise SystemExit(f"invalid or absent {symbol} benchmark observations")
        per_asset[asset] = rows
    common_end = min(rows["timestamp_utc"].max() for rows in per_asset.values())
    assets: list[dict[str, object]] = []
    normalized_by_asset: dict[str, pd.Series] = {}
    for asset, symbol in SYMBOLS.items():
        rows = per_asset[asset][per_asset[asset]["timestamp_utc"] <= common_end].copy()
        first_close = float(rows.iloc[0]["close"])
        values = (rows["close"].astype(float) / first_close * INITIAL_VALUE).round(6)
        normalized_by_asset[asset] = pd.Series(values.to_numpy(), index=rows["timestamp_utc"].to_numpy())
        expected_dates = pd.date_range(rows.iloc[0]["timestamp_utc"], common_end, freq="D", tz="UTC")
        observed_dates = set(rows["timestamp_utc"])
        missing_dates = [day.isoformat().replace("+00:00", "Z") for day in expected_dates if day not in observed_dates]
        assets.append({
            "asset": asset,
            "symbol": symbol,
            "window_start_utc": rows.iloc[0]["timestamp_utc"].isoformat().replace("+00:00", "Z"),
            "window_end_utc": rows.iloc[-1]["timestamp_utc"].isoformat().replace("+00:00", "Z"),
            "initial_value_usd": INITIAL_VALUE,
            "final_value_usd": float(values.iloc[-1]),
            **metrics(values),
            "observations": int(len(rows)),
            "missing_dates": missing_dates,
            "source_coordinate": {"dataset": "liquidity_v1.daily_bars", "symbol": symbol, "field": "close", "frequency": "1D"},
            "series": [
                {"timestamp_utc": timestamp.isoformat().replace("+00:00", "Z"), "close_usdt": float(close), "normalized_value_usd": float(value)}
                for timestamp, close, value in zip(rows["timestamp_utc"], rows["close"], values, strict=True)
            ],
        })
    common = pd.concat(normalized_by_asset, axis=1, join="inner").dropna()
    equal_weight = common.div(common.iloc[0]).mean(axis=1) * INITIAL_VALUE
    assets.append({
        "asset": "BTC_ETH_SOL_EQUAL_WEIGHT",
        "symbols": list(SYMBOLS.values()),
        "window_start_utc": common.index[0].isoformat().replace("+00:00", "Z"),
        "window_end_utc": common.index[-1].isoformat().replace("+00:00", "Z"),
        "initial_value_usd": INITIAL_VALUE,
        "final_value_usd": round(float(equal_weight.iloc[-1]), 6),
        **metrics(equal_weight),
        "observations": int(len(common)),
        "missing_dates": [],
        "source_coordinate": {"dataset": "liquidity_v1.daily_bars", "symbols": list(SYMBOLS.values()), "field": "equal-weight normalized close", "frequency": "1D"},
        "series": [
            {"timestamp_utc": timestamp.isoformat().replace("+00:00", "Z"), "normalized_value_usd": round(float(value), 6)}
            for timestamp, value in equal_weight.items()
        ],
    })
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "status": "COMPUTED_DERIVED_REFERENCE_ONLY",
        "as_of_utc": common_end.isoformat().replace("+00:00", "Z"),
        "methodology": "Daily close buy-and-hold, normalized to USD 10,000 at each asset's first available UTC observation on or after 2026-01-01, through the latest complete common UTC day. Equal weight is rebalanced only at inception. No strategy comparison is implied.",
        "source": {"dataset": "CTREND liquidity_v1 derived daily bars", "sha256": sha256(SOURCE)},
        "assets": assets,
        "warning": "These are reference benchmarks only. They must not be ranked against prediction outputs, infrastructure audits, or incomplete strategy P&L.",
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"assets": len(assets), "output": str(OUTPUT)}))


if __name__ == "__main__":
    main()
