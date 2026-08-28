# Scoring Model V2

Version `2.0.0`. Profile match remains deterministic alignment, not success probability. Evidence confidence remains separate and never mechanically lowers match.

## Why V1 clustered

V1 used neutral baselines near 70, saturated capital/time/income factors at 100, treated no-preference as perfect environment alignment, and diluted explicit environment intent to 20% of operating style. Several partial matches therefore accumulated into scores in the high 80s.

## Weights

| Factor | V1 | V2 |
|---|---:|---:|
| Capital | 18 | 16 |
| Time | 13 | 14 |
| Skills/experience | 13 | 14 |
| Risk | 12 | 12 |
| Income/scalability | 13 | 11 |
| Speed | 10 | 10 |
| Operating style and intent | 9 | 14 |
| Employment | 7 | 5 |
| Location | 5 | 4 |

The change reduces theoretical scalability bias and gives explicit operating intent, motivation, tolerance, and industry experience enough influence to distinguish an operator from a generic well-funded user.

## Nonlinear calibration

Each raw factor is mapped through this monotone piecewise curve before weighting:

```text
raw:        0  25  50  70  85  95 100
calibrated: 0  12  38  60  78  92 100
```

Adequate inputs no longer mean an 85+ factor. The curve preserves order and endpoints without forcing a population distribution.

## Capital states

Let `C` be safe-risk cash, `M` minimum validation cash, `L` lean launch low, and `H` comfortable launch high.

```text
C < M:      raw 20..45, cannot_fund_validation
M <= C < L: raw 55..70, validation_only
L <= C < H: raw 78..95, lean_to_comfortable_launch
C >= H:     raw 95, comfortable_or_excess
C = 0 and zero-cost validation supported:
             raw 58, zero_cost_validation_only
```

Excess capital stops at the same state as comfortable capital. It proves affordability only. A model can return `validation_worthy=true` and `launch_ready=false`.

Hard capital exclusion now occurs only when cash is below minimum validation and the record supports neither zero-cost nor concept-only validation. Explicit inventory refusal and zero available hours retain their hard gates.

## Skills and experience

Unselected capability defaults to 38. `none_identified` uses 52, preserving learnability without granting strong fit. Skill fit combines dependency match (52%), gap avoidance (28%), and business-experience adequacy (20%). A monetizable-strength requirement caps freelancing/consulting when no relevant sellable capability is declared. Matching `industry_experience` adds a bounded 25 points before clamping; it does not override capital, risk, or time.

## Operating style and intent

```text
raw operating style = 30% environment
                    + 52% six operating tolerances
                    + 18% primary-motivation compatibility
```

Exact environment match is 100, hybrid adjacency 65, online/offline opposition 20, and no preference 65. Explicit online/offline opposition caps the raw style score at 42. Motivation compatibility is deterministic: asset-building uses scalability/recurrence/automation; flexibility uses side-hustle and low operator dependence; extra income uses revenue speed and side-hustle compatibility; leaving employment uses income ceiling and full-time suitability.

## Income target

V2 reduces the factor from 13% to 11% and measures structural capacity using income ceiling, scalability, recurrence, automation, and operator dependence. The calibrated result can say “structurally capable of scaling” but cannot overcome poor skills, style, capital, time, or risk. Extreme targets emit `target_outside_calibration_range` and never imply attainability.

## Exceptional-alignment rule

After weighted aggregation:

- Seven or more factors ≥80 add 7 points.
- Five or six factors ≥80 add 3 points.
- Each critical factor <35 subtracts 2 points.

This rewards multi-factor alignment, not isolated excellence. It is why 90+ is possible but rare. Stable ID remains the tie-breaker.

## Score meaning

| Score | Interpretation |
|---:|---|
| 90–100 | Exceptional alignment |
| 80–89.9 | Strong alignment |
| 70–79.9 | Good; worth exploring |
| 60–69.9 | Mixed fit |
| 50–59.9 | Weak fit |
| Below 50 | Poor current fit |

## Calibration references

[CALIBRATION_REFERENCES.json](../data/CALIBRATION_REFERENCES.json) contains 120 manually reasoned user/model comparisons. They are labeled `calibration_reference`, not ground truth. Production calibration should add independent reviewers and inter-rater agreement.

## Determinism

The score is a pure function of canonical assessment, model record, India overlay, and versioned configuration. The LLM receives finalized output and cannot change ranking. Exact ties use `business_model_id` ascending.
