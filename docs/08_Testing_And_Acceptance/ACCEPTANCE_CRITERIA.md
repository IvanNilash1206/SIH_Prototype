# Acceptance Criteria

## AC-01 --- End-to-end high-confidence synchronization

Given the golden report, when processing completes: - P-204 is
identified; - CDU-02 is identified; - mechanical installation is
identified; - progress is 80%; - material delivery delay is
identified; - correct schedule activity is top-ranked; - confidence is
at least 0.85; - activity is automatically updated; - Gantt reflects the
new actual; - delay event exists; - audit event exists.

## AC-02 --- Safe ambiguity handling

Given the ambiguous pump report: - asset is not invented; - multiple
candidates are shown; - confidence is below threshold; - automatic
synchronization is blocked; - planner review is created.

## AC-03 --- Human approval

When planner selects a candidate and approves: - activity is updated; -
review is closed; - audit event is created; - UI reflects the update.

## AC-04 --- Human rejection

When planner rejects: - schedule remains unchanged; - review is
closed; - rejection is auditable.

## AC-05 --- Explainability

For every match: - component scores are visible; - top candidate is
visible; - decision reason is visible.

## AC-06 --- Traceability

Every schedule update can be traced:
`activity → update event → field report`.

## AC-07 --- No fake integration

Any P6/enterprise integration shown in the prototype must be clearly
labeled as simulated/mock unless a real connection is implemented and
verified.

## AC-08 --- Demo reliability

The golden demo must be repeatable from a clean seeded database.

## AC-09 --- UI quality

No: - broken routes; - overlapping components; - unreadable text; -
console errors that affect functionality; - dead primary buttons.

## AC-10 --- Local reproducibility

A developer can: 1. install dependencies; 2. configure environment; 3.
initialize database; 4. seed data; 5. start application; 6. run the
demo.
