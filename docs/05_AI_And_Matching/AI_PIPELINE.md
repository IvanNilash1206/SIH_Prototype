# AI Pipeline Specification

## Pipeline

``` text
Raw report
   ↓
Language/transcript normalization
   ↓
Structured entity extraction
   ↓
Schema validation
   ↓
Context-aware filtering
   ↓
Candidate retrieval
   ↓
Hybrid similarity scoring
   ↓
Confidence gate
   ↓
Auto-sync OR human review
```

## Extraction schema

Minimum fields:

``` json
{
  "project_id": "string|null",
  "plant_unit": "string|null",
  "area": "string|null",
  "discipline": "enum|null",
  "asset_id": "string|null",
  "action": "enum|string|null",
  "progress_percent": "number|null",
  "status": "enum|null",
  "delay_days": "number|null",
  "delay_root_cause": "enum|null",
  "expected_completion_date": "date|null",
  "evidence": [
    {
      "field": "string",
      "source_text": "string"
    }
  ]
}
```

## Extraction rules

1.  Never invent an asset ID.
2.  Never invent progress if it is not stated.
3.  If the report says "almost complete" but provides no percentage,
    preserve that wording as a status cue and do not convert it to an
    arbitrary percentage.
4.  Normalize "80 percent", "80%", "80 pct" to `80`.
5.  Normalize Hinglish/vernacular terminology only when the meaning is
    clear.
6.  Preserve original report text.
7.  If a field is ambiguous, return null rather than hallucinating.
8.  Validate enum fields.

## Example

Input:

"CDU Unit 2 mein P-204 pump mechanical installation 80 percent complete
hai. Material delivery ki wajah se 2 din delay hua."

Output:

``` json
{
  "plant_unit": "CDU-02",
  "discipline": "MECHANICAL",
  "asset_id": "P-204",
  "action": "MECHANICAL_INSTALLATION",
  "progress_percent": 80,
  "status": "IN_PROGRESS",
  "delay_days": 2,
  "delay_root_cause": "MATERIAL_DELIVERY"
}
```

## Provider abstraction

The application should support:

``` text
extract(report) -> StructuredExtraction
```

Implement: - `MockExtractionProvider` for deterministic demo; -
`LLMExtractionProvider` for real AI when credentials exist.

The frontend should not care which provider was used.

## Deterministic fallback

The prototype must be able to run in DEMO mode.

The mock provider should use: - keyword/entity rules; - seeded scenario
recognition; - deterministic outputs.

It should still return the same schema as the real provider.
