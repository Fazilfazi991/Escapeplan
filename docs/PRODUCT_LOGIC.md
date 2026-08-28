# EscapePlan Product Logic

Status: Batch 7 authoritative specification, version 1.0.0. This specification produces profile alignment, not a probability of commercial success. A displayed `92% PROFILE MATCH` means the model's requirements align strongly with the assessment; it never means a 92% chance of success.

## Architecture

```text
quiz answers -> validate/default -> derived profile
                                      |
base model + country override --------+-> hard gates -> nine factor scores
                                                       -> deterministic ranking
profile only ----------------------------> readiness + archetype
ranked model ----------------------------> finances + validation template
engine output ---------------------------> optional LLM narrative
```

Every calculation uses a versioned profile, model dataset, country override, and engine configuration. Store all four version identifiers with the result. Identical normalized inputs and versions must serialize to identical scores and rankings. Break exact score ties by `business_model_id` ascending.

## Separation of concerns

- Assessment validation converts raw answers to a canonical profile and emits warnings for contradictions or missing optional inputs.
- The match engine applies rare hard exclusions, calculates all nine factor scores, records evidence, and ranks models.
- Readiness describes ability to run a test now. It is independent of a selected business.
- Archetype classification frames communication only. It never changes ranking.
- The financial engine calculates scenarios from explicit user/model inputs. It does not forecast outcomes.
- Validation plans select a deterministic template by `validation_template_id`; an LLM may reword but not change gates or evidence criteria.
- Country data overlays base estimates. Currency display never changes ratios or scoring logic.

## Taxonomy

The MVP uses 50 non-duplicative models across ten validation archetypes: `commerce`, `software`, `digital_product`, `local_service`, `marketplace`, `content_education`, `physical_retail`, `food`, `rental`, and `b2b`. Niches are examples below a model, not new models. The curated records live in [BUSINESS_MODELS_SEED.json](../data/BUSINESS_MODELS_SEED.json).

## Ranking lifecycle

1. Validate types, allowed enums, money currency, and bounds from [QUIZ_SCHEMA.md](QUIZ_SCHEMA.md).
2. Derive safe-risk capital, effective daily hours, urgency days, skill vector, preference vector, and financial-data completeness.
3. Load the base record, apply a country override field-by-field, and preserve override provenance.
4. Run hard gates. Excluded models remain auditable but cannot rank.
5. Calculate nine scores using [SCORING_MODEL.md](SCORING_MODEL.md). Each score is 0–100 before weighting.
6. Compute `profile_match_score = round_1(sum(weight_i * score_i / 100))`.
7. Apply no hidden boosts. Sort score descending, then stable ID ascending.
8. Generate positives from the three largest factor surpluses and conflicts from the three largest weighted deficits.
9. Select up to three avoid-for-now models with a score below 42 and at least two material conflicts, or one critical conflict. Favor distinct, high-severity explanations rather than the absolute bottom three.
10. Derive `what_would_need_to_change` by solving each largest deficit for its nearest threshold: capital required, hours required, acceptable revenue window, tolerance, or partner capability.

## Hard exclusions

Hard exclusions are limited to facts that make a meaningful test presently impossible:

- `safe_risk_capital < 0.25 * localized minimum_test_capital` and the model has no zero/low-cost validation method. The 25% tolerance allows pre-sales, interviews, and landing-page tests.
- `available_hours_daily == 0` unless the user identifies an operating partner and the model permits passive ownership; the MVP has no passive-ownership records, so all exclude.
- A required legal credential is explicitly absent and `credential_acquisition_feasible == false`. No MVP seed model asserts this gate; it is reserved for researched country overrides.
- The user explicitly refuses a non-negotiable operating requirement: inventory with `inventory_tolerance=0` and `requires_inventory=true`, staff with `staff_management_tolerance=0` and `requires_staff_initially=true`, or physical presence with `preferred_business_environment=online_only` and `requires_physical_location=true`. A zero means refusal, not mere dislike.

Every exclusion returns a code, observed value, threshold, provenance, and remediation. Capital, risk, speed, and preference mismatches otherwise remain soft penalties.

## Readiness

Readiness is calculated before model selection. Bands are `0–40 strengthen_foundation`, `41–60 explore_carefully`, `61–75 ready_to_test`, `76–90 strong_position_to_validate`, and `91–100 high_flexibility_execution_matters`. See the exact formula in [SCORING_MODEL.md](SCORING_MODEL.md). High wealth cannot dominate because financial capacity is capped at 25% of readiness.

## Entrepreneur archetypes

Calculate the following signals on 0–100: digital, commercial, creative, operational, analytical, autonomy, systems, and asset-building. Each archetype has a fixed centroid. Choose the smallest weighted Euclidean distance, with ID as tie-breaker:

| ID | Name | Defining high signals |
|---|---|---|
| calculated_builder | The Calculated Builder | analytical, risk discipline, asset-building |
| digital_operator | The Digital Operator | digital, systems, autonomy |
| system_builder | The System Builder | systems, operational, analytical |
| commercial_hunter | The Commercial Hunter | commercial, networking, speed |
| market_trader | The Market Trader | sourcing, commercial, risk tolerance |
| brand_builder | The Brand Builder | creative, commercial, content |
| hands_on_operator | The Hands-on Operator | operational, offline, customer tolerance |
| strategic_starter | The Strategic Starter | low risk, employed, deliberate speed |
| growth_seeker | The Growth Seeker | scalability goal, risk tolerance, income ambition |
| independent_builder | The Independent Builder | autonomy, solo preference, technical/creative |

Archetype confidence equals the normalized gap between the closest and second-closest centroid. Low confidence should be presented as a framing choice, not a diagnosis.

## Avoid for now

Qualification requires `profile_match_score < 42` plus either two factor scores below 30 or one hard/critical conflict. Rank candidates by explainability severity, then lowest score. Wording must be “Poor fit for your current profile.” Remediation is computed from the factor deficit and must never say “never start this.”

## What-if engine

A scenario is a JSON Merge Patch over the canonical assessment. Re-run normalization, gates, scoring, ranking, readiness, finances, and plans with the same immutable model/config versions. Return old/new rank, score delta, factor deltas, exclusions added/removed, and deterministic reason codes. Never mutate the baseline assessment.

## Validation plan engine

Each model points to one of ten templates. All templates use four evidence stages:

1. Week 1 — define segment/problem and complete 10–15 customer conversations or equivalent behavioral research.
2. Week 2 — publish the smallest credible offer/prototype with one price and measurable call to action.
3. Week 3 — run a capped paid-demand test or direct outreach; money, deposits, qualified meetings, or signed intent outrank compliments.
4. Week 4 — compare evidence against template thresholds; continue, revise, or stop. No sunk-cost escalation.

Template-specific tasks and evidence gates belong in model data. An LLM may tailor language and examples, but cannot remove paid evidence, alter budgets, or declare validation without the defined evidence.

## Confidence and geography

All estimated values include `confidence_level`, `source_type`, `assumption_id`, and `last_reviewed_at`. The initial India dataset uses `model_assumption` and deliberately broad ranges until model-level research is completed. Localized value = base value × country `capital_multiplier`; regulatory and market fields override directly. Store money in minor units plus ISO 4217 currency. Never compare amounts across currencies without a versioned exchange-rate input.

## Edge behavior

- Zero capital favors pre-sellable services/content but does not fabricate affordability.
- Capital above the largest ideal range receives no extra score.
- A ₹10M/month goal clamps input safely and exposes `target_outside_model_range`; it does not overflow or imply attainability.
- No strengths yields a neutral skill score of 55 before dependency adjustments.
- Contradictory answers create warnings and use the more conservative value for safety-sensitive calculations.
- Low runway lowers readiness and safe-test budget, but employment continuation is modeled separately.
- Missing optional financial inputs return `not_calculable` fields, never zero disguised as known.
- An existing owner uses actual owner hours and keeps readiness; no automatic side-hustle penalty applies.

## Quality audit

| Requirement | Design evidence |
|---|---|
| Identical users rank identically | Versioned inputs, pure formulas, stable tie-break |
| LLM cannot alter ranking | LLM consumes finalized engine output only |
| 92% is profile match | Contract label and disclaimer are mandatory |
| Scores explainable | Factor evidence, reason codes, contribution fields |
| Finances deterministic | Formula-only financial engine |
| Uncertainty labeled | Per-estimate provenance metadata |
| Inputs affect ranking | Full deterministic what-if recomputation |
| Multi-country ready | Base records plus country overlays and ISO currency |
| No one-attribute absurdity | Nine factors, capped contributions, hard gates |
| Useful without LLM | Complete structured output includes reasons and plan |

## Related

[Quiz schema](QUIZ_SCHEMA.md) · [Business model schema](BUSINESS_MODEL_SCHEMA.md) · [Scoring](SCORING_MODEL.md) · [Financial engine](FINANCIAL_ENGINE.md) · [LLM boundaries](LLM_BOUNDARIES.md)
