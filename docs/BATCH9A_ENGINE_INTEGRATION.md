# Batch 9A Engine Integration

## Adaptive answer mapping

| Canonical field | Class | Mapping |
|---|---|---|
| `employment_status` | A directly collected | Current situation answer maps to the documented enum. |
| `primary_motivation` | A directly collected | Motivation answer maps to the documented enum. |
| `locale` | B safely derived | India-first release fixes country `IN` and currency `INR`. |
| `available_capital_minor` | A directly collected | Selected capital band is retained for display; its conservative lower bound enters scoring. |
| `safe_risk_capital_minor` | B safely derived | The question explicitly asks what the user could comfortably test with; the conservative band floor is used. `Under ₹25K` maps to zero rather than inventing an amount. |
| `available_hours_daily` | A directly collected | Lower edge of each selected daily-hours band; full-time maps to eight hours. |
| `preferred_business_environment` | A directly collected | Online, offline, hybrid, or no preference. |
| `strengths` | A directly collected | Current labels map to canonical capability enums. |
| `time_to_first_income_requirement` | B safely derived | The final speed/scale trade-off maps to the documented timing bands. |
| `risk_tolerance` | C missing | Neutral `3` is used internally and recorded as a normalization warning; UI does not claim that the user selected it. |
| `savings_runway_months` | A/C | Direct when the employed-user follow-up ran; otherwise zero conservatively with a warning. |
| `operational_preferences` | A/B | Direct staff/inventory follow-up where present; otherwise conservative environment-derived bands with a warning. |
| `monthly_income_target_minor` | C missing | Stored as zero and flagged missing. No income-target or runway calculation is displayed from it. |
| Personal expenses, salary, savings and debt | C optional/missing | Kept `null`; financial preview explains that the money plan needs monthly expenses. |

No user data is invented. Every derived or missing field is retained under `canonical_assessment.normalization` in the versioned local result record.

## Deterministic versions

- Scoring: `2.0.0`
- Dataset: `business-models-v2.0.0`
- India overlay: `IN-2026.08-v1`
- India evidence: `IN-evidence-2026.08-v1`
- Financial engine: `1.1.0`
- Output contract: `result-v1.1.0`

## Alternative thresholds

- Lower capital: validation cash must be at least 20% below #1.
- Faster validation: window must be at most 75% of #1 and at least 14 days shorter.
- Better beside employment: employment factor must exceed #1 by at least 10 points.
- Lower operational load: operating-style factor must exceed #1 by at least 10 points.
- No inventory: only when #1 requires inventory and the alternative does not.
- Candidate quality: comparative alternatives remain within 15 Profile Match points of #1.

The selector uses the highest-ranked qualifying model for each truthful dimension, deduplicates identities, preserves the model's real rank, and falls back to an honestly labeled strong alternative rather than fabricating a comparison.

## Avoid models

Avoid outputs come from hard exclusion codes or from models with at least two factor scores below 35. Bottom rank alone is insufficient. The consumer count is the actual number returned, capped at three for this surface; fewer are shown when fewer qualify.

## Persistence and failure

Raw adaptive state is mirrored to local and session storage. Generated state uses `escapeplan_assessment_v2` and contains raw answers, canonical assessment, result, timestamp, and the complete engine version tuple. A missing assessment, unavailable dataset, version mismatch, or no eligible model produces a retry screen and never a fallback winner.
