# Match Engine Examples and QA Findings

These examples use `match-v1.0.0`, the India QA seed, and [validate_match_engine.mjs](../tools/validate_match_engine.mjs). They are regression fixtures, not market recommendations. Scores are profile match only.

## Worked calculation: Persona A vs AI Utility Website

Persona A is a full-time employee with INR 100,000 available, INR 40,000 safe to risk, a INR 50,000 monthly target, two hours/day, technology strength, low risk tolerance, online preference, and a three-month income requirement.

The prototype returns factor values approximately: capital 100, time 92, skills 75, risk 87, income 100, speed 94, operating style 91, employment 100, and location 60. Applying the fixed weights:

```text
match = .18(100)+.13(92)+.13(75)+.12(87)+.13(100)
      + .10(94)+.09(91)+.07(100)+.05(60)
      = 89.9 PROFILE MATCH (rounding from unrounded factor values)
```

The leading models are AI Utility Website 89.9, Digital Downloads 89.3, Print-on-Demand 89.2, Lead Generation Asset 87.9, and Paid Newsletter 86.1. This is intuitive on capital, time, digital preference, and technical strength. Print-on-demand being third despite low inventory tolerance is a calibration watch item; its seed inventory score is intentionally low because fulfillment is outsourced.

## Worked contrast: Restaurant / Cafe

The same persona can technically complete research, but the restaurant's high minimum test capital, full-time operator need, fixed cost, staff, inventory, location, and risk exposure produce multiple critical deficits. It should qualify as “Poor fit for your current profile,” with remediation expressed as thresholds (more safe capital, full-time availability, and an experienced operating partner), not a permanent prohibition.

## What-if example

Baseline: Persona A, two hours/day, safe capital INR 40,000. Scenario patch:

```json
{"available_hours_daily": 6, "money": {"safe_risk_capital_minor": 10000000}}
```

The engine reruns all factors. Higher-capital, operator-heavier models move upward because capital/time deficits shrink; the old result remains immutable. The response must expose old/new rank, score delta, factor deltas, and `TIME_CAPACITY_IMPROVED` / `CAPITAL_AFFORDABILITY_IMPROVED` codes. No narrative model chooses the movement.

## Persona regression results

| Persona | Top result | Other top-five patterns | Finding |
|---|---|---|---|
| A employed technical cautious | AI Utility Website 89.9 | digital downloads, POD, lead-gen, newsletter | Sensible low-capital/digital bias |
| B funded full-time operator | Subscription Commerce 88.6 | consumer tool, directory, job marketplace, data product | Anomaly: offline preference/operations strength are under-expressed by neutral operating answers |
| C patient creative student | Digital Downloads 87.4 | affiliate, newsletter, community, POD | Sensible; ten capital-heavy models excluded |
| D zero-capital seller | Freelancing 74.6 | no other model passes capital hard gate | Safe but too narrow; pre-sale validation metadata should allow more service models |
| E wealthy low-risk executive | AI Utility Website 87.8 | micro-SaaS, data product, downloads, consumer tool | Correctly avoids capital-heavy bias |
| F no strengths | Lead Generation Asset 89.9 | community, newsletter, directory, membership | Neutral baseline works; no zero-skill collapse |
| G refuses inventory | Paid Newsletter 91.9 | affiliate, downloads, community, lead-gen | 18 inventory models excluded as intended |
| H INR 10M target | B2B Marketplace 85.7 | vertical SaaS, job marketplace, micro-SaaS | Scalable models rise; target warning required |
| I existing owner | Lead Generation Asset 87.8 | AI utility, data product, consumer tool, e-commerce | Existing-business treatment avoids employee penalty |
| J urgent/cautious contradiction | Digital Downloads 78.1 | AI utility, lead-gen, data, newsletter | Fast/low-fixed-cost models survive; warning required |
| K zero hours | none | all 50 excluded | Correct hard stop with remediation |
| L extreme target | Vertical SaaS 87.3 | micro-SaaS and marketplaces | No overflow; target-outside-range warning required |

No single model dominates: eight distinct models win across 11 rankable personas; the largest winner count is two. AI Utility Website, Digital Downloads, and Lead Generation Asset each win twice in this run.

## Anomalies and calibration actions

1. Persona B reveals that broad `offline` preference alone cannot overcome very favorable scalable/digital dimensions. Before launch, collect stronger operator preferences or tune operating-style relevance; do not simply boost offline models globally.
2. Persona D excludes 49 models because the capital hard gate lacks a record-level `zero_cost_validation_supported` flag. Add and research that field before production so pre-sales/outreach can keep suitable service models soft-scored.
3. Model scores cluster in the high 80s. Calibrate factor baselines against expert-labeled pairs and aim for useful spread; do not cosmetically rescale percentages after ranking.
4. India location scores are generic because country overrides are not researched. Location weight remains only 5% and confidence is low.
5. The seed's financial ranges are QA assumptions. They are suitable for engine behavior testing, not consumer display without research.

## Reproduction

```powershell
node .\tools\generate_batch7_data.mjs
node .\tools\validate_match_engine.mjs
```

Both scripts are isolated prototypes and are not wired into the product.
