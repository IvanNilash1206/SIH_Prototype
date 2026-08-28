# Agent Handoff --- Quick Start

## Read first

1.  `01_Project_Overview/README.md`
2.  `01_Project_Overview/PRODUCT_REQUIREMENTS.md`
3.  `02_Agent_Instructions/ANTIGRAVITY_MASTER_INSTRUCTION.md`
4.  `07_Implementation_Phases/PHASE_PLAN.md`
5.  `08_Testing_And_Acceptance/ACCEPTANCE_CRITERIA.md`

## First action

Inspect the existing repository and determine whether it already
contains: - frontend; - backend; - database; - authentication; -
existing components; - tests.

Do not assume the repository is empty.

## Build order

``` text
Foundation
→ Database + seed
→ Reports
→ Extraction
→ Matching
→ Confidence gate
→ Auto-sync
→ Triage
→ Gantt
→ Delay analytics
→ Voice/file
→ Polish
→ Full regression
```

## Non-negotiable behavior

``` text
confidence >= 0.85
        ↓
AUTO_SYNC

confidence < 0.85
        ↓
HUMAN_REVIEW
```

Unless an additional ambiguity/conflict guard forces review.

## Golden activity

`MECH-CDU2-P204-002 — P-204 Mechanical Installation`

## Golden input

"CDU Unit 2 mein P-204 pump mechanical installation 80 percent complete
hai. Material delivery ki wajah se 2 din delay hua."

## Golden ambiguity

"Pump area ka installation almost complete hai. Testing pending hai."

## Final command expectations

Document exact commands for: - install; - database setup; - seed; -
development start; - tests; - production build.
