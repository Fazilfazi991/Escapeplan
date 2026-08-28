# EscapePlan

This workspace contains the EscapePlan UI design exports and the Batch 7 deterministic product-logic specification. Batch 7 is architecture and QA data only; it does not implement authentication, payments, databases, production UI, PDF/email delivery, ads, analytics, or an LLM integration.

## Batch 7 documentation

- [Product logic](docs/PRODUCT_LOGIC.md) — architecture, lifecycle, readiness, archetypes, avoid logic, what-if behavior, validation plans, and quality audit.
- [Scoring model](docs/SCORING_MODEL.md) — exact normalization functions, factor formulas, weights, and invariants.
- [Business model schema](docs/BUSINESS_MODEL_SCHEMA.md) — authoritative model and country-override structures.
- [Quiz schema](docs/QUIZ_SCHEMA.md) — canonical assessment inputs, validation, and versioning.
- [Financial engine](docs/FINANCIAL_ENGINE.md) — safe budget, reserve, runway, quit framework, sales, break-even, and unit economics.
- [LLM boundaries](docs/LLM_BOUNDARIES.md) — allowed/prohibited behavior and enforcement.
- [Match examples](docs/MATCH_ENGINE_EXAMPLES.md) — worked calculation, 12-persona run, anomalies, and calibration actions.

## Batch 7 data

- [50-model India QA seed](data/BUSINESS_MODELS_SEED.json)
- [12 QA personas](data/QA_PERSONAS.json)
- [API output example](data/API_OUTPUT_CONTRACT.json)

Run the isolated QA prototypes with Node.js 20 or newer:

```powershell
node .\tools\generate_batch7_data.mjs
node .\tools\validate_match_engine.mjs
```

The generated values are generalized model assumptions and must not be presented as verified market facts. A profile match score measures alignment with user inputs; it is not a probability of success.

## Batch 8: India evidence and calibration

- [India research method](docs/INDIA_RESEARCH_METHOD.md)
- [Scoring model V2](docs/SCORING_MODEL_V2.md)
- [Stress-test report](docs/STRESS_TEST_REPORT.md)
- [Batch 7 vs Batch 8](docs/BATCH7_VS_BATCH8_RESULTS.md)
- [Consumer display rules](docs/CONSUMER_DISPLAY_RULES.md)
- [Evidence gaps](docs/EVIDENCE_GAPS.md)
- [Engine versioning](docs/ENGINE_VERSIONING.md)
- [India evidence records](data/INDIA_EVIDENCE.json)
- [India model overrides](data/INDIA_MODEL_OVERRIDES.json)
- [50-model V2 seed](data/BUSINESS_MODELS_SEED_V2.json)
- [120 calibration references](data/CALIBRATION_REFERENCES.json)
- [17 regression personas](data/REGRESSION_PERSONAS.json)
- [V2 output contract example](data/API_OUTPUT_CONTRACT_V2.json)
- [Raw Batch 8 QA results](data/BATCH8_QA_RESULTS.json)

Batch 7 artifacts remain immutable beside their V2 successors. Reproduce Batch 8 with:

```powershell
node .\tools\generate_batch8_data.mjs
node .\tools\run_batch8_qa.mjs
```
