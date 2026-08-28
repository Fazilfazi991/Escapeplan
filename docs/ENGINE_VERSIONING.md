# Engine Versioning

Every assessment result records the exact logic and data that produced it.

## Version tuple

```json
{
  "scoring_model_version": "2.0.0",
  "business_dataset_version": "business-models-v2.0.0",
  "country_overlay_version": "IN-2026.08-v1",
  "evidence_version": "IN-evidence-2026.08-v1",
  "financial_engine_version": "1.1.0",
  "quiz_schema_version": "assessment-v1.0.0",
  "output_contract_version": "result-v1.1.0"
}
```

Also store canonical input hash, engine configuration hash, generated timestamp, country/currency, and stable tie-break policy.

## Change rules

- Scoring major: changed formula, weight, gate, factor meaning, or band semantics.
- Scoring minor: additive explanation/reason code with unchanged numeric results.
- Dataset major: record meaning or required-field change. Minor: researched value update preserving schema.
- Overlay: `CC-YYYY.MM-vN`; increment whenever a localized metric or applicability rule changes.
- Evidence: immutable dated release; corrected sources create a new release and supersession link.
- Financial major/minor follows whether displayed calculations change.

## Reproducibility

Never overwrite a published artifact. Retain V1 beside V2. A result lookup must resolve the original tuple or declare it unavailable. New research does not silently change historical assessments; users may request a recalculation and see why results changed.

## Release gate

1. Generate immutable datasets.
2. Validate schemas, IDs, evidence references and capital ordering.
3. Run calibration, original QA, offline/operator fixtures and stress suite.
4. Review ranking diffs and evidence-confidence changes.
5. Publish changelog and versions atomically.
6. Keep the previous tuple available for rollback/comparison.

The LLM version is logged separately because it may change wording but never engine output.
