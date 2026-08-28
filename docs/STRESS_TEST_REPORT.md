# Batch 8 Stress Test Report

The deterministic test covers 80 synthetic personas and all 50 models. It varies capital from INR 0 to INR 10,000,000, safe-risk share, hours, risk, strengths, income targets, employment, motivation, timing, runway, environment, and operating tolerances. The same matrix was scored under V1 and V2.

## Distribution

| Metric | Batch 7 | Batch 8 |
|---|---:|---:|
| Scored pairs | 3,578 | 3,803 |
| Average | 76.1 | 60.0 |
| Median | 76.4 | 59.7 |
| 90th percentile | 87.4 | 77.6 |
| Minimum | 46.0 | 25.7 |
| Maximum | 91.7 | 91.2 |
| 90+ | 51 | 1 |
| 80–89 | 1,255 | 263 |
| 70–79 | 1,479 | 620 |
| 60–69 | 578 | 993 |
| 50–59 | 195 | 1,142 |
| Below 50 | 20 | 784 |

V2 materially fixes compression. Ninety-plus is exceptional, the 80s remain reachable, and mismatches now appear below 60.

## Ranking diversity

Top-model counts: AI Utility Website 19, Digital Downloads 15, Micro-SaaS 10, Freelancing 9, Specialized Recruitment 6, Mobile Service Business 5, Consumer Digital Tool 4, Niche Community 4, Lead Generation Asset 2, Property Service 2, Niche E-commerce 2, and Local Service/Agency one each.

No single model wins a majority. AI Utility Website wins 23.8%, which is a watch threshold rather than a release blocker. Digital models remain common because the matrix contains online, no-preference, employed, low-capital, and technical profiles. They do not win the explicit offline/operator regression fixtures merely from scalability.

## Exclusions and avoid behavior

Average hard exclusions are 2.5 of 50, down materially for zero-capital profiles. Physical, regulated, and capital-heavy models still appear frequently in avoid lists for low-capital/low-time users. This is expected when supported by multiple conflicts. `avoid` remains distinct from hard exclusion.

## Offline/operator fixtures

- INR 15L full-time operator: Property Service leads; Agency, Professional Practice and Automotive Service rise.
- INR 5L sourcing/sales hybrid: Private Label, Niche E-commerce and Subscription Commerce lead.
- INR 25L existing owner: Property Service, Private Label and Home Services lead.
- INR 8L automotive experience: Automotive Service reaches #2 behind Property Service.
- INR 20L food experience: Specialist Food Brand reaches #2; Cloud Kitchen remains lower because staff, fixed-cost and risk conflicts remain real.

The engine does not blindly select a requested sector. Experience creates a bounded skill advantage while risk, capital, and operating load continue to matter.

## Remaining diagnostics

- Food and physical retail do not win the broad stress matrix. They do rise in targeted fixtures. More format-specific records or expert labels are needed before changing weights.
- AI Utility Website has the highest winner count. Monitor after model-specific evidence and human calibration; do not penalize it solely to flatten distribution.
- The synthetic matrix is deterministic and broad, not representative of India’s actual prospective-founder population.

Raw results are in [BATCH8_QA_RESULTS.json](../data/BATCH8_QA_RESULTS.json).
