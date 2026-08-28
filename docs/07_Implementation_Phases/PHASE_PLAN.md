# Implementation Phase Plan

## Phase 0 --- Repository reconnaissance

### Goal

Understand the existing project before changing it.

### Tasks

-   inspect file structure;
-   identify frontend/backend;
-   identify package managers;
-   identify database;
-   identify existing routes/components;
-   run existing app;
-   run existing tests.

### Exit criteria

-   project starts;
-   architecture is documented;
-   no existing functionality is accidentally discarded.

------------------------------------------------------------------------

## Phase 1 --- Application shell

### Goal

Create the professional product shell.

### Build

-   sidebar;
-   header;
-   routing;
-   theme;
-   project selector;
-   reusable cards/tables/badges;
-   loading/error/empty states.

### Screens

-   Command Center shell;
-   Field Reports shell;
-   Schedule Intelligence shell;
-   Triage shell;
-   Gantt shell;
-   Delay Intelligence shell;
-   Audit shell.

### Tests

Browser agent verifies all routes load.

------------------------------------------------------------------------

## Phase 2 --- EPC dataset and database

### Goal

Create realistic schedule data.

### Build

-   database schema;
-   migrations;
-   seed project;
-   WBS;
-   activities;
-   disciplines;
-   plant units;
-   assets.

### Required dataset

Enough activities to make matching meaningful. Target roughly 200--500
seeded activities for the prototype; exact size may be adjusted for
performance.

### Tests

-   migration;
-   seed;
-   activity queries;
-   filters;
-   progress constraints.

------------------------------------------------------------------------

## Phase 3 --- Field report ingestion

### Goal

Create the field-report workflow.

### Build

-   text input;
-   report persistence;
-   processing states;
-   history;
-   report detail.

### Tests

-   valid submission;
-   empty submission;
-   long input;
-   persistence;
-   error state.

------------------------------------------------------------------------

## Phase 4 --- AI extraction

### Goal

Turn natural language into structured EPC facts.

### Build

-   extraction schema;
-   mock provider;
-   optional real provider;
-   validation;
-   evidence mapping;
-   extraction UI.

### Tests

-   golden report;
-   missing asset;
-   missing progress;
-   delay cause;
-   Hinglish normalization;
-   malformed provider output.

------------------------------------------------------------------------

## Phase 5 --- Schedule matching

### Goal

Implement hierarchical constrained matching.

### Build

-   context filters;
-   candidate retrieval;
-   scoring;
-   ranking;
-   confidence;
-   explanations.

### Tests

-   exact match;
-   partial match;
-   ambiguous match;
-   wrong discipline;
-   wrong location;
-   multiple candidates.

------------------------------------------------------------------------

## Phase 6 --- Confidence-gated synchronization

### Goal

Connect the decision engine to actual schedule state.

### Build

-   threshold config;
-   auto-sync;
-   transactional update;
-   audit event;
-   sync result.

### Tests

-   = 0.85 auto-sync;

-   \< 0.85 no auto-sync;

-   failed persistence;

-   progress bounds;

-   repeated submission/idempotency where implemented.

------------------------------------------------------------------------

## Phase 7 --- Planner Triage

### Goal

Make ambiguity safe and actionable.

### Build

-   queue;
-   candidate comparison;
-   match explanation;
-   approve;
-   reject;
-   audit.

### Tests

-   approval updates schedule;
-   rejection does not;
-   duplicate approval blocked;
-   stale review handled.

------------------------------------------------------------------------

## Phase 8 --- Gantt and project progress

### Goal

Make synchronization visually obvious.

### Build

-   schedule timeline;
-   baseline vs actual;
-   progress;
-   filters;
-   activity detail;
-   live refresh after mutation.

### Tests

-   activity appears;
-   progress changes;
-   status changes;
-   filters;
-   no broken timeline.

------------------------------------------------------------------------

## Phase 9 --- Delay intelligence

### Goal

Create institutional-memory visualization.

### Build

-   delay event persistence;
-   root cause aggregation;
-   charts;
-   filters;
-   activity drilldown.

### Tests

-   delay creation;
-   aggregation;
-   filter behavior;
-   report traceability.

------------------------------------------------------------------------

## Phase 10 --- Voice/multimodal

### Goal

Demonstrate low-friction field capture.

### Build

-   microphone UI;
-   transcript display;
-   optional DPR upload;
-   provider abstraction.

### Tests

-   supported browser;
-   unavailable provider;
-   transcript editing;
-   extraction from transcript.

------------------------------------------------------------------------

## Phase 11 --- Polish and reliability

### Goal

Prepare for external evaluation.

### Build

-   loading states;
-   error states;
-   animations used sparingly;
-   responsive layout;
-   empty states;
-   accessibility improvements;
-   performance tuning;
-   demo reset.

### Browser-agent regression

Run full golden demo twice from clean state.

------------------------------------------------------------------------

## Phase 12 --- Final packaging

### Deliver

-   setup instructions;
-   `.env.example`;
-   seed command;
-   test command;
-   build command;
-   architecture documentation;
-   demo script.

### Final gate

No critical defects.
