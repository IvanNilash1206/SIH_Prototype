# Definition of Done

A phase is complete only when all applicable criteria below are
satisfied.

## Engineering

-   Code is organized into logical modules.
-   No dead imports or obvious dead code.
-   Errors are handled.
-   Configuration is environment-driven.
-   Secrets are not committed.
-   API contracts are typed/validated.

## Backend

-   Endpoint returns correct HTTP status.
-   Request validation works.
-   Persistence is transactional where mutation occurs.
-   Invalid input cannot mutate schedule state.
-   Audit data is generated for schedule mutations.

## AI

-   Extraction output conforms to schema.
-   Missing fields are represented explicitly.
-   Match candidates are ranked.
-   Confidence is bounded 0--1.
-   Decision threshold is configurable.
-   Low confidence cannot auto-sync.

## Frontend

-   Loading state exists.
-   Empty state exists.
-   Error state exists.
-   Success state exists.
-   Navigation works.
-   Tables are readable.
-   Gantt is usable.
-   Mobile/responsive behavior is reasonable, with desktop optimized for
    judging.

## Browser verification

The browser agent must verify: - dashboard loads; - new report
submission works; - processing state appears; - extraction appears; -
candidate match appears; - auto-sync works; - low-confidence review
works; - Gantt changes; - delay analytics changes; - audit trail
appears.

## Documentation

Update README/setup documentation if commands, environment variables, or
architecture change.
