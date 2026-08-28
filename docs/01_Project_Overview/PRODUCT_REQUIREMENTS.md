# Product Requirements Specification

## 1. Problem

In EPC infrastructure projects, field progress is often recorded as
free-form notes, voice messages, spreadsheets, or daily progress
reports. The official project schedule uses rigid WBS/activity
identifiers. Manually reconciling these two representations causes
delays in schedule updates and reduces the usefulness of real-time
project analytics.

SynchroLink is the intelligent reconciliation layer between field
execution and the project schedule.

## 2. Product goals

### G1 --- Capture field progress with minimal friction

Allow a supervisor to submit: - natural-language text; - voice input
where supported; - DPR/Excel/file input.

### G2 --- Convert unstructured reports into structured EPC facts

Extract: - project; - plant/unit; - discipline; - area; - asset ID; -
activity/action; - progress percentage; - status; - planned/expected
completion when stated; - delay duration; - delay root cause; -
evidence/source text.

### G3 --- Map the report to the correct schedule activity

Use: - deterministic filters; - lexical/entity matching; - semantic
similarity; - candidate ranking.

### G4 --- Prevent unsafe automation

Use a confidence gate: - `confidence >= 0.85`: eligible for auto-sync; -
`confidence < 0.85`: planner review.

The threshold must be configurable but default to 85%.

### G5 --- Make the effect visible

A successful update must propagate to: - activity actual progress; -
project progress; - Gantt; - delay analytics; - activity history; -
audit log.

### G6 --- Preserve institutional memory

Store delay causes and report-to-activity relationships for historical
analysis.

## 3. Non-goals for the prototype

Do not attempt: - full Primavera P6 EPPM implementation; - enterprise
authentication/SSO; - multi-tenant billing; - production-grade
distributed ingestion; - real WhatsApp APIs; - full BIM/digital-twin
integration; - autonomous schedule replanning; - predictive ML claims
without actual evaluation data.

## 4. Functional requirements

### FR-01 Dashboard

The command center must show: - overall progress; - total activities; -
updated today; - auto-synced count; - pending review count; - delayed
activities; - schedule health; - recent activity feed.

### FR-02 New field report

The user can enter a report and submit it for processing.

### FR-03 Extraction

The system produces structured JSON conforming to the defined extraction
schema.

### FR-04 Matching

The system produces ranked candidates with component scores.

### FR-05 Confidence decision

The system makes one of: - AUTO_SYNC; - HUMAN_REVIEW; - REJECT.

### FR-06 Auto-sync

High-confidence reports update the selected activity without manual
approval.

### FR-07 Human review

Low-confidence reports cannot alter official actual progress until the
planner approves.

### FR-08 Gantt

The schedule view must distinguish: - baseline/planned; - actual; -
delayed/at-risk; - completed.

### FR-09 Delay intelligence

The system must aggregate delay events by root cause, discipline,
plant/unit, and activity.

### FR-10 Audit trail

Every schedule mutation must record: - timestamp; - source report; -
user/system actor; - activity; - old value; - new value; - confidence; -
decision; - reason.

### FR-11 Explainability

Every match must expose why it was selected: - asset match; - location
match; - discipline match; - action match; - semantic score; - final
confidence.

### FR-12 Failure handling

If extraction fails, matching fails, or persistence fails: - show an
actionable error; - do not mutate schedule data; - preserve the original
report.

## 5. Quality requirements

### Performance

For a local demo dataset, normal text processing should return within a
few seconds where external AI latency permits.

### Reliability

The UI must never show a synchronized state until the backend confirms
persistence.

### Safety

Low-confidence records must not update the official schedule.

### Explainability

The evaluator must be able to understand the match without inspecting
source code.

### Reproducibility

Seeded demo scenarios must produce stable results.

## 6. Success metrics for the prototype

Track: - extraction success rate; - correct top-1 schedule match rate on
seeded test cases; - percentage of high-confidence reports
auto-synced; - percentage of ambiguous reports routed to review; -
schedule update latency; - delay root-cause capture rate.

These are prototype evaluation metrics, not claims about real-world
deployment.
