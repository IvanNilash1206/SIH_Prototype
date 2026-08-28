# Hierarchical Constrained Matching Engine

## Purpose

Map extracted field-report facts to the correct schedule activity
without searching the entire schedule blindly.

## Step 1 --- Hard context filters

Use available fields:

### Discipline

Example: `MECHANICAL`

### Plant/unit

Example: `CDU-02`

### Project

Example: `CDU-EXPANSION-02`

If a field is missing, do not fabricate it.

## Step 2 --- Candidate retrieval

Retrieve candidates matching the hard constraints.

Example:

``` text
2,486 total activities
        ↓
discipline filter
        ↓
412 activities
        ↓
plant filter
        ↓
47 activities
        ↓
semantic/entity ranking
        ↓
top 5 candidates
```

The exact counts can differ in the prototype dataset.

## Step 3 --- Component scores

Recommended normalized features:

-   `asset_score`
-   `location_score`
-   `discipline_score`
-   `action_score`
-   `text_similarity_score`

Each must be in `[0,1]`.

## Example weighted score

``` text
confidence =
    0.40 * asset_score +
    0.25 * location_score +
    0.15 * discipline_score +
    0.10 * action_score +
    0.10 * text_similarity_score
```

Weights are prototype defaults, not claims from the SIH source document.

## Missing evidence rule

Do not award a perfect score to a missing field.

If asset ID is absent: - `asset_score` should be 0 or explicitly marked
unavailable; - candidate confidence should reflect the ambiguity.

## Decision threshold

Default:

`CONFIDENCE_THRESHOLD = 0.85`

### High confidence

`confidence >= 0.85`

Decision: `AUTO_SYNC`

### Low confidence

`confidence < 0.85`

Decision: `HUMAN_REVIEW`

## Ambiguity guard

Even if a candidate is above the threshold, consider forcing human
review when: - top two candidates are too close; - critical entity
conflicts exist; - the activity is already completed and the report
implies a conflicting state; - progress would move backward without
explicit correction.

Recommended prototype guard:

``` text
if top_score >= 0.85
and (top_score - second_score) >= 0.05
and no critical conflict:
    AUTO_SYNC
else:
    HUMAN_REVIEW
```

Make this configurable.

## Match explanation

Return:

``` json
{
  "candidate_activity_id": "MECH-CDU2-P204-002",
  "confidence": 0.94,
  "decision": "AUTO_SYNC",
  "components": {
    "asset_match": 1.0,
    "location_match": 1.0,
    "discipline_match": 1.0,
    "action_match": 1.0,
    "semantic_similarity": 0.40
  },
  "reasons": [
    "Asset ID matched: P-204",
    "Plant unit matched: CDU-02",
    "Discipline matched: Mechanical",
    "Installation action matched"
  ]
}
```

Do not expose hidden model chain-of-thought. Only show structured,
user-facing match factors.

## Test cases

### Exact

P-204 + CDU-02 + Mechanical Installation Expected: top match P-204
installation.

### Partial

P-204 + installation Expected: P-204-related candidates, possibly
review.

### Ambiguous

"pump area installation" Expected: multiple candidates and HUMAN_REVIEW.

### Wrong discipline

Electrical report mentioning P-204 should not automatically match a
mechanical installation activity unless the extracted action/discipline
supports it.

### Wrong location

Same asset naming in a different plant must be penalized/filtered.
