# India Research Method

Batch 8 converts the India layer from an undifferentiated assumption into traceable evidence. It does not claim that every model now has a verified startup cost.

## Batch 7 audit

The audit covered the seven Batch 7 specifications, three JSON contracts, both deterministic scripts, and all 50 seed records. Four classes emerged:

| Class | Batch 7 state | Batch 8 treatment |
|---|---|---|
| Structural facts | Model identifiers, online/offline type, inventory/staff mechanics | Retained unless QA exposed a metadata error |
| Engine policy | Weights, gates, score curves, tie-breaking | Calibrated through labeled pairs and stress tests |
| India regulatory facts | Mostly absent | Added through government sources |
| Market estimates | Capital and timing were all `model_assumption` | Preserved as broad ranges with medium/low confidence; no false precision |

The weakest evidence remains restaurant/cafe, cloud kitchen, franchise, physical manufacturing, retail, logistics, rental, professional practice, and location-dependent services. City, format, capacity, credentials, premises, and equipment cause material variance.

## Source hierarchy

1. Government and regulators: MCA, CBIC, FSSAI, Ministry of MSME, Startup India, IP India, Parivahan and ONDC.
2. First-party platform pricing or operating requirements where the platform is itself the product supplier.
3. Credible industry references and multiple independent operator quotes.
4. Anecdotal evidence only as supporting context.

Batch 8 uses nine government sources and three primary-platform sources. It deliberately does not use random SEO blogs.

## Confidence rubric

- `high`: an official value directly defines the metric, or multiple strong primary sources agree on the same bounded value.
- `medium`: a primary source supports a component or constraint and a range is reasonably triangulated, but format/location still varies.
- `low`: a generalized model estimate, incomplete triangulation, or evidence supports constraints but not the amount.
- `unknown`: no credible basis. Do not display.

The current 300 records contain 127 medium-confidence and 173 low-confidence records. None is marked high because no source set directly proves a complete model-level launch range.

## Research procedure

For each model:

1. Separate demand validation from launch.
2. Identify national registrations/licences and note state/local variation.
3. Locate first-party platform or equipment/service pricing where relevant.
4. Record a broad range only when the evidence supports order of magnitude.
5. Store every source once in `source_catalog` and reference it by ID.
6. Assign confidence to each metric, not only to the model.
7. Classify display safety independently from confidence.
8. Preserve unknown fields as `null`; never convert missing evidence to zero.

## What the sources establish

- Udyam registration is free and paperless; this supports low formal-registration cash barriers but not launch cost.
- MCA documents identify incorporation filing concessions and state-dependent stamp duty.
- CBIC documents establish that GST obligations depend on turnover, state, supply, and channel.
- FSSAI establishes food-registration/licensing duties and official fee schedules.
- IP India publishes trademark fees.
- Parivahan establishes goods-carrier permit requirements.
- ONDC describes seller-network catalog, payment, and fulfilment responsibilities.
- Shopify India and AWS publish first-party entry pricing/free-tier conditions that support low-cost digital/commerce testing.
- MSME project profiles provide a planning framework but many detailed profiles are dated and cannot be treated as current quotes.

## Limitations

Cross-cutting evidence can support a constraint without supporting the exact cost of a business. A licence fee does not prove kitchen fit-out cost; a free cloud tier does not prove product-development cost. V2 therefore labels most consumer amounts as indicative ranges and records model-specific follow-up work in [EVIDENCE_GAPS.md](EVIDENCE_GAPS.md).

## Reproduction

```powershell
node .\tools\generate_batch8_data.mjs
node .\tools\run_batch8_qa.mjs
```

Research changes require source review, a new overlay version, regenerated artifacts, and regression review.
