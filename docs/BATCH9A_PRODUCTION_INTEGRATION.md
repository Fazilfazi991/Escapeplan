# Batch 9A production integration

## Versions and source of truth

- Scoring model: `2.0.0` (`tools/match_engine_v2.mjs`)
- Business dataset: `business-models-v2.0.0` (`data/BUSINESS_MODELS_SEED_V2.json`)
- India overlay: `IN-2026.08-v1` (`data/INDIA_MODEL_OVERRIDES.json`)
- India evidence: `IN-evidence-2026.08-v1` (`data/INDIA_EVIDENCE.json`)
- Financial engine: `1.1.0`
- Result contract: `result-v1.1.0`
- V4 integration assessment schema: `assessment-v1.1.0`

The production adapter is `shared/escapeplan-result-engine.mjs`. It ports V4 answer text into the canonical scoring contract and calls the approved V2 scorer. It does not contain a fallback winner.

## V4 assessment mapping

| V4 answer | Canonical field | Class | Rule |
|---|---|---:|---|
| Situation | `employment_status` | A | Direct enum mapping |
| Motivation | `primary_motivation` | A | Direct enum mapping |
| Product country | `locale.country`, `locale.currency` | B | India-only product configuration |
| Comfortable test amount | `money.safe_risk_capital_minor` | A | Direct band floor; this question describes test money, not total wealth |
| Total available capital | `money.available_capital_minor` | C | Unavailable; remains `null` |
| Time | `available_hours_daily` | A | Conservative lower bound of selected band |
| Working world | `preferred_business_environment` | A | Direct enum mapping |
| Strengths | `strengths` and supported skill-depth fields | A/B | Direct strengths; depth is only raised when explicitly selected |
| Final trade-off | `time_to_first_income_requirement` | A | Deterministic speed/scale band mapping |
| Savings runway | `savings_runway_months` | D | Asked only for full-time employees; otherwise `null` |
| Staff/inventory comfort | `operational_preferences` | D | Asked only for local preference; otherwise environment-derived or neutral |
| Risk tolerance | `risk_tolerance` | C | Not collected; remains `null` and receives a neutral scoring contribution |
| Monthly income target | `money.monthly_income_target_minor` | C | Not collected; remains `null` and receives a neutral scoring contribution |
| Expenses, savings and salary | money fields | C | Not collected; remain `null` |

Classes: A = collected directly, B = safely derived/configured, C = optional/unavailable, D = conditional follow-up.

Neutral engine handling is not user data. Missing risk and income-target inputs contribute neutral factor scores, and missing runway produces partial readiness coverage. The result records all mapping warnings.

## Deterministic explanations and Business DNA

Recommendation reasons are emitted only for factor scores of 70 or higher. Each reason stores the factor name, factor score and rendered label. Stable ordering is score descending then factor name.

Business DNA sources are recorded per trait:

- Low overhead: top model capital factor.
- Side-business compatibility: top model employment factor.
- Existing advantage: top model skills factor.
- Digital preference: the environment answer; qualitative only.
- Long-term scale preference: the final trade-off answer; qualitative only.

Archetype precedence is deterministic: local preference plus staff tolerance; declared sales strength; online plus technology; full-time employment; long-term preference; then lean-operator fallback based on the known test-capital constraint. The selected rule is stored with the result.

## Alternative and avoid logic

Alternative candidates must be in the next eleven ranked models and within 15 Profile Match points of #1. One hidden business can fill only one role.

- Lower capital: validation capital is at least 20% lower.
- Faster validation: validation window is at most 75% of #1 and at least 14 days shorter.
- Better side-business fit: employment factor is at least 10 points higher.
- Lower operations: average dataset operator, staff and inventory load is at least two points lower on the 1–10 scale.
- No inventory: #1 needs inventory and the alternative does not.
- Higher automation: dataset automation score is at least two points higher on the 1–10 scale.
- Local/offline: #1 is online and the alternative has a non-online operating type.
- Strong alternative: used only when fewer than three material comparison roles exist.

Avoid-for-now outputs require an engine exclusion or at least two factor scores below 35. The UI shows the actual count and never pads to three.

## Financial and persistence behavior

The selected capital band is a comfortable validation budget, not total available capital. Because personal expenses and cash savings are unavailable, the financial preview remains `partial` and does not claim a calculated safe-spend amount. INR values are ranges or indicative validation amounts.

Raw V4 answers remain at `escapeplan-assessment-v1`. Canonical assessment state is saved at `escapeplan_assessment_v2`; computed results are saved at `escapeplan_result_v2`. Both include engine versions. A completed result survives navigation and refresh. Any version mismatch triggers recalculation from saved raw answers.

If data or scoring fails, the application shows Retry Analysis and Start Again. It never substitutes demo result data.
