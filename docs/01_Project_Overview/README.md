# SYNCHROLINK --- Antigravity Prototype Build Package

## Purpose

This documentation package is the authoritative build specification for
the SynchroLink prototype for Smart India Hackathon 2026 Problem
Statement SIH26122.

The prototype is intended to demonstrate the core intelligence loop:

> **Unstructured field report → structured EPC data → context-aware
> schedule matching → confidence-gated decision → automatic
> synchronization or human review → live project progress and delay
> intelligence**

The prototype must feel like a credible EPC project-control product
rather than a generic AI dashboard.

## Source of truth

The supplied SIH proposal describes: - the problem as the disconnect
between unstructured daily field reports and rigid EPC schedule IDs; -
multimodal field ingestion; - AI extraction of EPC entities; -
hierarchical/context-aware schedule matching; - confidence-gated
synchronization; - planner triage for ambiguous matches; - delay
analytics and institutional memory; - a future integration direction
toward Primavera P6, SAP PMIS and Oracle ERP.

The prototype may simulate enterprise integrations, but it must
faithfully demonstrate the workflow above.

## Core product statement

SynchroLink does not replace the project planner. It removes the manual
reconciliation work between field execution and the enterprise schedule.

## Primary user

### Site Supervisor

Needs to report progress quickly in natural language, voice, or a
document.

### Project Planner

Needs trustworthy schedule updates and a clear review queue for
ambiguous reports.

### Project Manager

Needs real-time project health, delays, root causes, and downstream
impact.

## Prototype boundary

### Must be genuinely functional

-   Text field report ingestion
-   Structured AI/entity extraction
-   EPC schedule activity matching
-   Context filtering
-   Confidence score
-   Automatic synchronization for high-confidence matches
-   Human review for low-confidence matches
-   Interactive Gantt/progress view
-   Delay analytics
-   Audit history
-   Realistic seeded EPC project data
-   Clear success/error/loading states

### Can be simulated

-   Live Primavera P6 server connection
-   Enterprise PMIS
-   SAP/Oracle integrations
-   Production-scale Rust gateway
-   Actual WhatsApp integration
-   Production cloud infrastructure

Do not claim a simulated integration is a live enterprise connection.

## Golden demo

The primary demo must support this transaction:

Input:

> "CDU Unit 2 mein P-204 pump mechanical installation 80 percent
> complete hai. Material delivery ki wajah se 2 din delay hua."

Expected result: 1. Extract Mechanical, CDU-02, P-204, Installation,
80%, 2 days, Material Delivery. 2. Filter schedule candidates by
discipline and plant unit. 3. Rank matching activities. 4. Match
`MECH-CDU2-P204-002 — P-204 Mechanical Installation`. 5. Produce a
confidence score above the 85% auto-sync threshold. 6. Automatically
update actual progress. 7. Show the update on the Gantt. 8. Store the
delay event. 9. Store an audit record.

Second demo:

> "Pump area ka installation almost complete hai. Testing pending hai."

Expected result: 1. Asset remains unknown or ambiguous. 2. Multiple
schedule candidates remain. 3. Confidence is below 85%. 4. Automatic
synchronization is blocked. 5. Planner Triage displays the candidates.
6. Planner can approve, reject, or select a candidate. 7. Decision is
audited.

## Product quality bar

The application must: - look enterprise-grade; - have no dead
navigation; - never display fake success after a failed operation; -
never silently overwrite schedule data; - clearly distinguish planned vs
actual progress; - show confidence and decision state; - provide
traceability from schedule update back to the original report; - use
seeded realistic EPC data instead of lorem ipsum; - be runnable locally
with a clear setup command; - be demonstrable without external
enterprise credentials.
