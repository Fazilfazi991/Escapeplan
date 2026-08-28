# Business Model Schema

Each seed record describes one model, not a niche or promised outcome. Base values are country-neutral modeling assumptions; localized overrides carry geography-specific evidence.

## Authoritative shape

| Field | Type / constraint |
|---|---|
| `business_model_id`, `slug` | stable lowercase kebab-case identifiers |
| `display_name`, `short_description` | non-empty product copy |
| `category` | commerce, software, service, marketplace, content, retail, food, rental, b2b, manufacturing |
| `validation_template_id` | one of ten templates in PRODUCT_LOGIC |
| `online_offline_type` | online, offline, hybrid |
| `capital` | `minimum_test`, `typical_low`, `typical_high`, `ideal_low`, `ideal_high`, all non-negative minor units in `base_currency` |
| `scores` | every listed dimension, integer 1–10 |
| `best_strengths`, `poor_fit_strengths` | arrays of canonical strength IDs |
| `ideal_risk_range` | inclusive integer pair within 1–5 |
| `ideal_daily_hours_range` | inclusive numeric pair within 0–24 |
| `typical_validation_window_days`, `typical_first_revenue_window_days` | positive integers |
| `common_failure_modes`, `advantages`, `disadvantages`, `validation_methods`, `key_metrics` | non-empty string arrays |
| capability flags | booleans listed below |
| `evidence` | confidence, source type, assumption ID, review date, notes |

Required score keys are: `capital_intensity`, `time_requirement`, `operator_dependency`, `speed_to_validation`, `speed_to_first_revenue`, `scalability`, `recurring_revenue`, `inventory_requirement`, `staff_requirement`, `customer_interaction`, `technical_complexity`, `sales_dependency`, `marketing_dependency`, `creative_dependency`, `operations_dependency`, `product_dependency`, `supplier_dependency`, `regulatory_complexity`, `fixed_cost_intensity`, `working_capital_requirement`, `financial_risk`, `income_ceiling`, `automation_potential`, `location_dependency`, `side_hustle_compatibility`, `full_time_founder_requirement`, and `business_experience_requirement`.

Required flags: `requires_inventory`, `requires_staff_initially`, `requires_physical_location`, `supports_remote_operation`, `supports_recurring_revenue`, and `can_start_part_time`.

## Invariants

- `minimum_test <= typical_low <= typical_high` and `minimum_test <= ideal_low <= ideal_high`.
- High speed scores correspond to shorter windows; validators warn if score 8–10 has a first-revenue window over 180 days.
- Boolean requirements and dimension scores must agree: `requires_inventory=false` permits a nonzero incidental inventory score, but `true` requires score ≥5.
- IDs never change after publication. Copy and estimates may be revised with dataset version and changelog.
- Every estimated financial or time value has evidence metadata. `model_assumption` is not presented as verified fact.

## Country overrides

```json
{
  "business_model_id": "micro-saas",
  "country": "IN",
  "currency": "INR",
  "capital_multiplier": 1.0,
  "regulatory_difficulty": 30,
  "market_maturity": 65,
  "competition_level": 70,
  "field_overrides": {},
  "local_notes": ["Generalized India assumption; validate niche-specific compliance."],
  "evidence": {
    "confidence_level": "low",
    "source_type": "model_assumption",
    "source_refs": [],
    "last_reviewed_at": "2026-08-28"
  }
}
```

Override resolution is deterministic: base record → country multiplier on all capital values → explicit `field_overrides` → provenance attachment. Region overrides may later apply after country with the same mechanism. Never clone the base record by country.

## Evidence metadata

`confidence_level` is `high`, `medium`, or `low`. `source_type` is `internal_research`, `public_dataset`, `industry_reference`, or `model_assumption`. Sources and review dates describe estimate quality; they do not change match scores unless a future, separately versioned confidence policy explicitly does so.

## Validation templates

Templates define four weekly stages, tasks, budget caps, evidence types, decision thresholds, and prohibited shortcuts. A model stores only the template ID plus optional parameter overrides. This keeps validation strategy consistent while allowing niche-level wording later.
