# Antigravity Master Build Instruction

## Role

You are the principal software engineer and product engineer responsible
for implementing the SynchroLink prototype from this documentation
package.

Treat this documentation as the implementation contract.

## Primary objective

Build a fully working, polished prototype that demonstrates:

> field report → AI extraction → constrained schedule matching →
> confidence gate → auto-sync/human review → live schedule and delay
> intelligence.

## Operating principles

1.  Build in phases.
2.  After every phase, run the required tests.
3.  Do not move to the next phase while critical failures remain.
4.  Use the browser agent to test the UI after every UI phase.
5.  Use realistic EPC data.
6.  Prefer deterministic seeded demo behavior over unstable external
    model behavior.
7.  Never fake a successful backend mutation.
8.  Keep the architecture modular so real AI/Primavera integrations can
    be added later.
9.  Do not remove functionality to make tests pass.
10. Do not redesign the product away from the documented workflow.

## Required implementation behavior

### Source-of-truth hierarchy

When making implementation decisions: 1. This documentation package. 2.
Existing project files if they already implement a documented
requirement. 3. Normal engineering best practices. 4. General
assumptions only when explicitly marked as prototype assumptions.

If a conflict exists, preserve the core product behavior and document
the conflict.

## Mandatory workflow

For each phase:

### Step 1 --- Inspect

Inspect: - current file structure; - package configuration; - existing
application; - database configuration; - available environment
variables; - existing tests.

Do not overwrite working code blindly.

### Step 2 --- Plan

Before modifying files, identify: - files to create; - files to
modify; - dependencies; - migration requirements; - tests.

### Step 3 --- Implement

Implement the smallest coherent increment that satisfies the phase.

### Step 4 --- Test backend

Run: - type checking; - linting; - unit tests; - API tests; - database
tests where relevant.

### Step 5 --- Test frontend

Use the browser agent to: - launch application; - navigate through the
relevant flow; - interact with forms; - verify state changes; - inspect
console errors; - verify responsive layout at desktop dimensions.

### Step 6 --- Fix

Fix all critical and high-severity issues before continuing.

### Step 7 --- Verify

Record: - what works; - what was tested; - known limitations.

## Never do these things

-   Do not create placeholder buttons that appear functional.
-   Do not hard-code UI values when the value should come from the
    database.
-   Do not silently auto-sync a low-confidence match.
-   Do not claim a live Primavera connection if using a mock adapter.
-   Do not expose raw model chain-of-thought.
-   Do not make the UI dependent on an AI API being available for the
    basic demo.
-   Do not use arbitrary lorem ipsum data.
-   Do not leave broken routes.
-   Do not ignore failed network requests.
-   Do not ship with obvious console errors.

## Prototype strategy

Use a hybrid architecture: - deterministic EPC schedule data; -
structured extraction service; - deterministic/semantic matching
engine; - confidence gate; - persistence; - real UI.

If an external LLM or embedding service is unavailable, use a
deterministic fallback/mock provider behind the same interface. The demo
must still work.

## Required final state

At the end: - the app starts from a documented command; - seeded data
exists; - the golden demo works end-to-end; - low-confidence review
works; - Gantt changes after approved/automatic updates; - delay
analytics update; - audit records are visible; - tests pass; -
browser-agent walkthrough passes; - no critical console errors exist.
