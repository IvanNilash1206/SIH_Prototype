# Test Plan

## Unit tests

### Extraction

-   schema validation;
-   percentage parsing;
-   status normalization;
-   delay cause normalization;
-   missing-field behavior.

### Matching

-   asset matching;
-   location matching;
-   discipline matching;
-   action matching;
-   semantic score;
-   confidence calculation;
-   threshold decision.

### Schedule

-   progress bounds;
-   status updates;
-   audit creation;
-   delay event creation.

## Integration tests

### Golden high-confidence pipeline

``` text
POST report
→ process
→ extraction
→ matching
→ AUTO_SYNC
→ activity progress updated
→ delay event created
→ audit event created
```

### Golden low-confidence pipeline

``` text
POST report
→ process
→ extraction
→ matching
→ HUMAN_REVIEW
→ activity unchanged
```

### Approval

``` text
triage approval
→ selected activity updated
→ audit created
→ review closed
```

### Rejection

``` text
triage rejection
→ activity unchanged
→ review closed
```

## Browser tests

### Dashboard

-   page loads;
-   KPI cards display;
-   activity feed displays.

### Field report

-   type report;
-   submit;
-   processing state;
-   result state.

### Matching

-   candidate table;
-   confidence;
-   explanation.

### Auto-sync

-   synchronized badge;
-   updated progress;
-   Gantt reflects update.

### Triage

-   review item;
-   candidate selection;
-   approve;
-   reject.

### Delay

-   chart;
-   filters;
-   detail.

### Audit

-   event appears;
-   source report traceable.

## Negative tests

-   empty report;
-   invalid progress;
-   unknown activity;
-   AI provider failure;
-   database unavailable;
-   duplicate submission;
-   stale approval;
-   unsupported file;
-   speech unavailable.

## Regression rule

Any change to matching, schedule mutation, or report processing requires
rerunning the golden high-confidence and low-confidence flows.
