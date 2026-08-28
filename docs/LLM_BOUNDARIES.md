# LLM Boundaries

EscapePlan is complete and useful without an LLM. The deterministic engine owns facts, rankings, scores, calculations, gates, reason codes, assumptions, and plan structure. An LLM is an optional language renderer operating after results are finalized.

## Allowed

- Explain supplied factor scores and deterministic reasons in friendly language.
- Summarize declared strengths and constraints without adding user traits.
- Explain trade-offs and supplied what-if deltas.
- Personalize wording/examples inside the selected validation template while preserving tasks, caps, and evidence gates.
- Suggest clearly labeled niche examples within an already-ranked model.
- Translate narrative while leaving IDs, values, units, and disclaimers intact.

## Prohibited

- Invent, adjust, reorder, filter, or reinterpret match scores or rankings.
- Claim any success probability or guaranteed income.
- Invent capital, timing, market size, competitor, regulatory, or financial values.
- Perform arithmetic that becomes a displayed financial result.
- override hard exclusions, safety constraints, confidence labels, or evidence gates.
- Invent user history, credentials, preferences, or motivations.
- use unverified regulatory claims or fake citations.
- turn “avoid for now” into permanent advice or tell a user to quit employment.

## Interface

The prompt receives a signed/hashed structured result conforming to [API_OUTPUT_CONTRACT.json](../data/API_OUTPUT_CONTRACT.json), a copy style, locale, and allowed operation. It does not receive raw model records when they are unnecessary. Generated output must be structured by slot:

```json
{
  "assessment_id": "uuid",
  "engine_result_hash": "sha256:...",
  "copy": {
    "readiness_summary": "...",
    "ranked_business_explanations": [{"business_model_id": "micro-saas", "text": "..."}],
    "avoid_explanations": [],
    "validation_plan_wording": []
  },
  "niche_examples": [{"business_model_id": "micro-saas", "examples": []}]
}
```

The renderer joins copy to engine data by stable IDs. It never accepts numeric replacements from model output.

## Enforcement

1. JSON-schema validate the engine input and LLM output.
2. Reject numbers, currency symbols, percentages, or dates in narrative unless each appears in the supplied allow-list for that slot.
3. Reject output with unknown business IDs, missing required disclaimers, or changed ordering.
4. Use deterministic templates as fallback for every copy slot.
5. Log prompt/template/model versions and result hash, but exclude unnecessary sensitive raw answers.
6. Treat generated text as untrusted display content: escape markup and never execute instructions embedded in user or dataset text.

## Failure behavior

Timeout, refusal, malformed JSON, unsupported language, or boundary violation returns deterministic template copy. Rankings and financial outputs remain available. Repeated generation must not recompute or alter engine output.

## Required language

Every result surface states: “Profile match measures alignment with your inputs. It is not a probability of business success.” Financial surfaces state: “Planning scenario, not financial advice.” Estimated parameters carry their confidence and source label adjacent to the value or via an accessible disclosure.
