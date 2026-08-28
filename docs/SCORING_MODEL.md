# EscapePlan Scoring Model

Version `match-v1.0.0`. Scores are deterministic profile alignment scores, never probabilities of success.

## Common functions

```text
clamp(x, lo, hi) = min(hi, max(lo, x))
lerp(x, x0, x1, y0, y1) = y0 + clamp((x-x0)/(x1-x0),0,1)*(y1-y0)
range_fit(x, lo, hi, shoulder):
  if lo <= x <= hi: 100
  if x < lo: 100 * clamp((x-(lo-shoulder))/(shoulder),0,1)
  if x > hi: 100 - 15 * clamp((x-hi)/max(hi,shoulder),0,1)
weighted_mean(values, weights) = sum(v*w)/sum(w)
round_1(x) = round half away from zero to one decimal
```

Normalize all 1–5 quiz scales to `u = 25*(x-1)` and all 1–10 model dimensions to `m = 100*(x-1)/9`. Missing optional preferences use 50. Boolean refusals use 0.

## Weights

| Factor | Weight | Rationale |
|---|---:|---|
| Capital fit | 18% | Ability to test matters, but money alone must not dominate |
| Time fit | 13% | Available hours and operator dependence are core feasibility constraints |
| Skill fit | 13% | Relevant strengths accelerate testing while learnability preserves neutrality |
| Risk fit | 12% | Incorporates financial, fixed-cost, working-capital, and regulatory exposure |
| Income/scalability fit | 13% | Tests model capacity without promising income |
| Speed fit | 10% | Aligns urgency with validation and revenue windows |
| Operating preference fit | 9% | Reduces recommendations users would dislike operating |
| Employment fit | 7% | Separates employed/part-time feasibility from raw time |
| Location fit | 5% | Limited until country evidence improves |

Total is 100%. Weight changes require a new configuration version and regression snapshots.

## Factor formulas

### Capital fit — 18 points

Inputs: safe-risk capital `C`, localized minimum test `M`, typical low/high `L/H`, ideal low/high `Ilo/Ihi`, financial risk `R` (0–100).

```text
validation_affordability = clamp(100*C/M, 0, 100)                 # M=0 -> 100
startup_affordability =
  C < M     ? 35*C/M
  C < L     ? lerp(C,M,L,35,75)
  C <= H    ? lerp(C,L,H,75,100)
             : 100
ideal_fit = range_fit(C, Ilo, Ihi, max(Ilo, M))
risk_buffer = clamp(100*(C-M)/max(M, L-M, 1), 0, 100)
capital = .35*validation_affordability + .35*startup_affordability
        + .20*ideal_fit + .10*((100-R)+R*risk_buffer/100)
```

If `C < .25M`, apply the hard-gate rule from PRODUCT_LOGIC. Excess capital never scores above 100.

### Time fit — 13 points

Let daily hours `h`, model ideal hours `[hlo,hhi]`, time requirement `T`, operator dependency `O`, and full-time requirement `F` be normalized 0–100.

```text
hours_fit = range_fit(h, hlo, hhi, max(hlo,1))
capacity = clamp(100*h/max(hlo,1),0,100)
load_fit = 100 - max(0, T-capacity)*0.70 - max(0, O-capacity)*0.30
full_time_fit = employment in {ready_full_time, unemployed, existing_business}
                ? 100 : 100-F
time = clamp(.50*hours_fit + .35*load_fit + .15*full_time_fit,0,100)
```

### Skill fit — 13 points

Map strengths to capabilities: sales→sales, technology→technical, creative→creative/content, product_sourcing→supplier/product, operations→operations, networking→sales/customer, finance_analysis→analysis, teaching→content/customer, technical_trade→operations/technical. Selected strengths have capability 90, depth answers map 25–100, unselected capabilities default 45. If `none_identified`, all default to 55.

```text
dependencies = {sales, technical, creative, operations, supplier/product}
gap_j = max(0, dependency_j - capability_j)
surplus_j = max(0, capability_j - dependency_j)
skill = clamp(70 - weighted_mean(gap_j, dependency_j+10)*.65
                 + weighted_mean(surplus_j, dependency_j+10)*.12, 20, 100)
best_strength_bonus = min(10, 5 * count(intersection(user_strengths,best_strengths)))
poor_fit_penalty = min(12, 6 * count(intersection(user_strengths,poor_fit_strengths)))
skill = clamp(skill + bonus - penalty,0,100)
```

### Risk fit — 12 points

```text
exposure = .45*financial_risk + .20*fixed_cost + .15*working_capital
         + .10*regulatory + .10*staff_requirement
tolerance = 25*(risk_tolerance-1)
range_score = range_fit(risk_tolerance, ideal_risk_min, ideal_risk_max, 2)
downside_gap = max(0, exposure-tolerance)
risk = clamp(.55*range_score + .45*(100-downside_gap),0,100)
```

This asymmetric gap does not punish a cautious model for a high-risk-tolerance user.

### Income/scalability fit — 13 points

Income targets are converted to an ambition index using a localized reference monthly income `B` (India MVP assumption: INR 100,000, versioned): `A = clamp(25*log2(max(target, .25B)/(.25B)),0,100)`.

```text
capacity = .45*income_ceiling + .30*scalability + .15*recurring_revenue
         + .10*automation_potential
constraint = .65*operator_dependency + .35*time_requirement
effective_capacity = clamp(capacity - .25*constraint,0,100)
income = clamp(100 - 1.10*max(0,A-effective_capacity)
                   - 0.15*max(0,effective_capacity-A-50),0,100)
```

Targets above the calibrated range set a warning. This score measures model capacity alignment, not expected earnings.

### Speed fit — 10 points

Map requirement to days: 30, 90, 180, 365, or 730 for long-term. Let `D` be required days, `V` validation window and `F` first revenue window.

```text
window_score(actual, required) = actual <= required ? 100
                               : 100*exp(-1.6*(actual/required-1))
speed = .35*window_score(V,D) + .65*window_score(F,D)
```

Clamp exponential results to 0–100. Long windows are strongly but softly penalized.

### Operating preference fit — 9 points

For customer, staff, inventory, content, computer, and systems, compute `compatibility = 100 - abs(user_tolerance_or_preference - model_requirement)`. Environment compatibility is 100 exact/no-preference, 75 for hybrid adjacency, 25 for online/offline opposition. Weight dimensions by `0.5 + requirement/100` so irrelevant traits matter less.

```text
operating_style = .20*environment + .80*weighted_mean(compatibilities, relevance_weights)
```

Explicit zeros can hard-exclude only for required booleans as documented.

### Employment fit — 7 points

```text
base = can_start_part_time ? 100 : 35
if employment in {full_time_job, student}: base -= .55*full_time_founder_requirement
if employment == part_time_job: base -= .25*full_time_founder_requirement
if employment in {ready_full_time, unemployed}: base += 10
if employment == existing_business: base = 85 - .20*operator_dependency
employment_fit = clamp(base + .15*side_hustle_compatibility,0,100)
```

### Location fit — 5 points

```text
country_base = override exists ? 75 : 55
location = country_base + .15*(market_maturity-50) - .15*(competition-50)
         - .25*(regulatory_difficulty-50) - .15*location_dependency
location += supports_remote_operation ? 10 : 0
location_fit = clamp(location,0,100)
```

Low-confidence overrides cap location contribution confidence, not score. UI must expose confidence.

## Aggregate and explanations

```text
profile_match = round_1(sum(weight_i * factor_i)/100)
contribution_i = round_1(weight_i * factor_i/100)
deficit_i = weight_i * (100-factor_i)/100
```

No post-ranking LLM, archetype, popularity, sponsored, or random adjustment is allowed. Reason codes derive from thresholds: positive ≥75, neutral 45–74.9, conflict <45, critical <25.

## Business readiness formula

Readiness components are independent of a model:

| Component | Weight | Formula summary |
|---|---:|---|
| Financial foundation | 25 | 55% runway score + 45% safe-capital score; both saturate |
| Time capacity | 18 | `clamp(available_hours_daily/3*100,0,100)` with employment consistency |
| Goal clarity | 15 | completeness/consistency of motivation, target, horizon, environment |
| Strength awareness | 12 | 55 baseline for none; depth and complementary strengths raise score |
| Risk consistency | 12 | alignment of risk tolerance, safe-risk share, runway, urgency |
| Employment stability | 10 | stable salary 90, student/part-time 65, ready full-time 55, unemployed 35; never moral judgment |
| Test horizon | 8 | feasible urgency and willingness to validate before quitting |

```text
runway_score = clamp(savings_runway_months/9*100,0,100)
safe_capital_score = clamp(log10(1+safe_risk_capital/local_reference_capital)*60,0,100)
readiness = round_1(sum(component_weight*component_score)/100)
```

Missing optional financial data sets financial foundation to 45 with `low` confidence; it does not become zero. Readiness bands are defined in PRODUCT_LOGIC.

## Input safety

Reject negative money/hours. Clamp hours to 24, risk scales to their range, runway to 240 months, and monetary integer minor units to signed 64-bit bounds. Preserve both raw and normalized values. Contradictions emit warnings and use the conservative value only where safety is implicated.

## Regression invariants

- Increasing safe capital while holding all else fixed cannot reduce capital fit inside/below the ideal range.
- Increasing hours cannot reduce time fit below the ideal upper bound.
- Adding a relevant strength cannot reduce skill fit.
- Shortening the required income window cannot increase speed fit for a slow model.
- A low-risk user cannot gain risk score when model exposure rises.
- Exact reruns are byte-stable after canonical JSON ordering.
