# Deterministic Financial Engine

Version `finance-v1.0.0`. All outputs are planning scenarios, not forecasts or financial advice. Money is an integer in assessment currency minor units; calculations use decimal arithmetic and round once at the output boundary.

## Safe test budget

Inputs: safe-risk capital `S`, available capital `A`, minimum validation capital `M`, monthly essential personal outflow `E`, liquid savings `L`, runway target `R` (default 6 months), and model exposure `X` from the risk formula on 0–100.

```text
emergency_reserve = E known ? min(L, E*R) : null
capital_after_reserve = emergency_reserve known
  ? max(0, min(S, A-emergency_reserve))
  : min(S, A)
risk_cap = capital_after_reserve * (0.70 - 0.40*X/100)
evidence_cap = M * (1.00 + 0.25*X/100)
safe_test_budget = floor_to_minor(max(0, min(capital_after_reserve,risk_cap,evidence_cap)))
```

If the resulting budget is below `M`, return `test_not_fully_funded` and the gap; never inflate the budget. When expenses or savings are missing, return `reserve_confidence=low`, cap the test at the lesser of 30% of `S` and `M`, and request the missing inputs. The principle is the smallest credible demand test, not a fixed share of wealth.

## Capital reserve

```text
personal_reserve = E * desired_reserve_months
business_contingency = planned_committed_cost * (0.10 + 0.20*X/100)
capital_reserve = personal_reserve + business_contingency
```

Do not double-count business test capital inside personal reserve. If `E` is unknown, personal reserve is `not_calculable`.

## Runway

Let liquid savings be `L`, committed test spend `T`, monthly personal expenses `P`, debt commitments `D`, monthly net salary continuation `Y`, and reliable business profit `B` (default zero unless supplied as actual).

```text
net_liquid = max(0,L-T)
outflow = P+D
runway_if_quit = outflow>0 ? net_liquid/max(outflow-B, epsilon) : not_calculable
runway_while_employed = outflow>Y+B ? net_liquid/(outflow-Y-B) : "cashflow_non_negative"
```

If salary continuation is uncertain, return low/base/high scenarios rather than a single value. Never treat credit limits as savings. Cap display at `120+ months`, while retaining the calculation.

## Quit trigger framework

This is a reassessment framework, never an instruction to resign.

```text
required_personal_income = P + D + taxes_buffer
coverage = trailing_monthly_business_profit / required_personal_income
target_coverage_band = risk_tolerance<=2 ? 1.00..1.20
                     : risk_tolerance==3 ? 0.85..1.10
                     : 0.70..1.00
consistency_months = risk_tolerance<=2 ? 6 : risk_tolerance==3 ? 4 : 3
reserve_gate = post-quit liquid reserve >= max(6, desired_reserve_months)*required_personal_income
trend_gate = no negative three-month profit trend and no single-customer concentration above 40%
```

Output the coverage band, consistency window, reserve gate, and failed/unknown conditions. Recommended copy: “Consider reassessing resignation when…” Include `planning_framework=true` and `not_financial_advice=true`.

## Sales and customer targets

Inputs: desired monthly operating profit `Q`, average selling price `ASP`, refunds/discount rate `r`, variable cost per order `V`, payment fee rate `f`, monthly fixed operating costs `F`, and optional repeat orders per customer `k`.

```text
net_revenue_per_order = ASP*(1-r)
contribution_per_order = net_revenue_per_order*(1-f)-V
required_contribution = Q+F
required_orders = ceil(required_contribution/contribution_per_order)
required_revenue = required_orders*net_revenue_per_order
daily_orders = required_orders / operating_days
required_customers = ceil(required_orders/max(k,1))
gross_margin = (net_revenue_per_order-COGS)/net_revenue_per_order
contribution_margin = contribution_per_order/net_revenue_per_order
```

If contribution per order ≤0, return `unit_economics_invalid`; there is no finite order count. Revenue and profit must always be separately labeled.

## Break-even

```text
break_even_orders = ceil(F/contribution_per_order)
break_even_revenue = break_even_orders*net_revenue_per_order
margin_of_safety = actual_or_scenario_revenue-break_even_revenue
```

For subscriptions, substitute monthly contribution per active subscriber and include monthly churn. Approximate steady-state acquisition needed as `target_active * churn_rate`; label this a scenario assumption.

## Unit-economics scenarios

Produce conservative/base/optimistic scenarios only from explicit parameter sets. Each returns ASP, volume, refund, variable cost, contribution, fixed cost, operating profit, margin, customer acquisition cost, lifetime value if computable, and assumption provenance. Never synthesize a “likely” case.

```text
CAC = acquisition_spend/new_customers
LTV_contribution = contribution_per_order*orders_per_customer_lifetime
LTV_CAC = LTV_contribution/CAC
payback_months = CAC/monthly_contribution_per_customer
```

Unknown denominators produce `not_calculable`, never infinity or zero.

## Edge cases

- Zero expenses: require confirmation; do not imply infinite runway.
- Zero or missing salary: distinguish known zero from unknown.
- Negative business profit increases monthly burn.
- Taxes are an explicit buffer input; the MVP does not infer tax law.
- Mixed currencies are rejected unless a versioned conversion rate and timestamp are supplied.
- Debt principal and interest treatment must be declared by the input adapter.
- Every result includes inputs used, formula version, rounding mode, warnings, and missing inputs.
