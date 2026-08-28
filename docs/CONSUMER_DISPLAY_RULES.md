# Consumer Display Rules

Consumer copy must tell the truth about both suitability and evidence quality.

## Display classes

| Class | Use |
|---|---|
| `display_directly` | Stable structural facts or official fixed values with current evidence |
| `display_as_range` | Values genuinely supported as a bounded range |
| `display_as_range_with_estimate_label` | Model/city variability remains; show “estimated” and confidence |
| `display_only_after_more_research` | Low/unknown evidence could materially mislead |
| `do_not_display` | Unknowable, prohibited, or easily mistaken for a promise |

## Metric rules

| Metric | Rule |
|---|---|
| Profile match | Direct, always labeled PROFILE MATCH and “not probability of success” |
| Evidence confidence | Direct but separate from match |
| Minimum validation cash | Range or “can validate without paid launch”; never call launch cost |
| Typical startup capital | Estimated range plus currency, geography, confidence, review date |
| Time to validation / first revenue | Estimated range; “possible” not guaranteed |
| Licence fee | Direct only with current official source and applicability caveat |
| Regulatory complexity | Qualitative/estimated; link to applicable official source |
| Market maturity/competition | Withhold until model-specific current research exists |
| Industry growth | Only current, sourced, and directly relevant |
| Profitability/success probability | Do not display |
| Guaranteed income/payback | Do not display |
| Exact startup amount from generalized data | Do not display |

## Required presentation

```text
78% Profile Match
Good fit worth exploring

Estimated validation cash: INR 0–5,000
Data confidence: Medium
You may be able to test demand at no cost; this does not mean you are funded to launch.
```

Low confidence adds: “Some India estimates are approximate and need local quotes.” Unknown evidence replaces the value with “Research needed,” not zero.

## Claims controls

- Round broad money ranges to useful bands; never display fake precision such as INR 137,450.
- Keep source date and country attached to the value.
- Do not extrapolate a national figure from one operator or city.
- Never convert high match into “likely to succeed.”
- Do not let LLM copy add unsupplied numbers, statistics, regulatory claims, or guarantees.
