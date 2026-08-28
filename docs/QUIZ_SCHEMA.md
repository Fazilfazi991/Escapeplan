# Canonical Quiz Schema

The canonical assessment is the validated, currency-aware input to every deterministic engine. Raw presentation answers may differ, but adapters must produce this contract.

## Contract

```json
{
  "schema_version": "assessment-v1.0.0",
  "assessment_id": "uuid",
  "locale": {"country": "IN", "region": "MH", "currency": "INR"},
  "employment_status": "full_time_job",
  "primary_motivation": "extra_income",
  "money": {
    "available_capital_minor": 10000000,
    "safe_risk_capital_minor": 4000000,
    "safe_risk_percentage": null,
    "monthly_income_target_minor": 5000000,
    "cash_savings_minor": null,
    "monthly_personal_expenses_minor": null,
    "monthly_salary_minor": null,
    "monthly_debt_commitments_minor": null
  },
  "available_hours_daily": 2,
  "preferred_business_environment": "online",
  "strengths": ["technology"],
  "operational_preferences": {
    "customer_interaction_tolerance": 3,
    "staff_management_tolerance": 2,
    "inventory_tolerance": 1,
    "content_creation_tolerance": 2,
    "computer_work_tolerance": 5,
    "system_building_preference": 5
  },
  "risk_tolerance": 2,
  "time_to_first_income_requirement": "3_months",
  "savings_runway_months": 8,
  "biggest_fear": "losing_savings",
  "optional": {
    "age_range": null,
    "business_experience": 1,
    "industry_experience": [],
    "network_strength": 2,
    "technical_skill_depth": 4,
    "sales_skill_depth": 2,
    "access_to_suppliers": 1,
    "access_to_existing_customers": 1,
    "operating_partner_available": false,
    "credential_ids": []
  }
}
```

Money uses non-negative integer minor units and one ISO 4217 currency per assessment. `safe_risk_capital_minor` is preferred. If absent, derive it as `floor(available_capital_minor * safe_risk_percentage / 100)`. If both exist and differ by more than one minor unit, reject the assessment rather than silently choosing.

## Enums

- `employment_status`: `full_time_job`, `part_time_job`, `student`, `existing_business`, `unemployed`, `ready_full_time`.
- `primary_motivation`: `extra_income`, `leave_job`, `financial_independence`, `build_asset`, `flexibility`, `exploration`.
- `preferred_business_environment`: `online`, `offline`, `hybrid`, `no_preference`.
- `strengths`: `sales`, `technology`, `creative`, `product_sourcing`, `operations`, `networking`, `finance_analysis`, `teaching`, `technical_trade`, `none_identified`. `none_identified` must be the only value when selected.
- `time_to_first_income_requirement`: `30_days`, `3_months`, `6_months`, `12_months`, `long_term`.
- `biggest_fear`: `losing_savings`, `wrong_idea`, `no_customers`, `leaving_salary`, `public_failure`, `wasting_time`, `need_direction`.

All operational preferences and optional depth scores are integers 1–5. The API may accept 0 only as an explicit refusal for customer, staff, inventory, content, or computer work; UI copy must make that consequence clear. `risk_tolerance` is 1–5. Hours are 0–24. Runway is 0–240 months.

## Required versus optional

Required: locale country/currency, employment, motivation, available capital, safe-risk capital or percentage, target income, hours, environment, strengths, six operating preferences, risk tolerance, income timing, runway, and fear. Personal expenses, salary, debt, age, detailed experience, access, and credentials remain optional. Missing optional values lower confidence or make a financial scenario unavailable; they do not fabricate zero.

## Validation and contradictions

- Reject negative values, invalid currency/country codes, duplicate strengths, and unknown enums.
- Warn when safe-risk share exceeds 80%, risk tolerance is 1 with safe-risk share above 50%, zero hours accompanies a near-term goal, or `long_term` timing conflicts with a separately supplied 30-day requirement.
- Warn and preserve when unemployed with zero runway; the engine should still help, while safe-test budget protects reserve.
- `available_capital=0` is valid. `monthly_income_target=0` is valid for exploration and scored at the low ambition bound.
- Sensitive attributes such as exact age, gender, religion, ethnicity, health, and marital status are neither requested nor used.

## Derived profile

The normalizer adds `safe_risk_share`, `urgency_days`, `effective_hours_daily`, capability vector, preference vector, financial completeness flags, warnings, and an input hash. Derived fields are outputs and must not be accepted from untrusted clients.

## Versioning

Additive optional fields increment minor version. Changed meaning, enum removal, scale change, or default change increments major version. Store raw answer payload separately from the canonical assessment for migration and audit.
