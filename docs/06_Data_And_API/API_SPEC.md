# API Specification

The exact framework syntax may vary, but behavior and contracts should
remain stable.

## Health

### GET /api/health

Response:

``` json
{
  "status": "ok"
}
```

## Dashboard

### GET /api/dashboard/summary

Returns: - total activities; - updated today; - auto-synced; - pending
review; - delayed activities; - schedule health; - overall progress.

### GET /api/dashboard/activity-feed

Returns recent events.

## Reports

### POST /api/reports

Request:

``` json
{
  "source_type": "TEXT",
  "raw_text": "CDU Unit 2 mein P-204..."
}
```

Response:

``` json
{
  "report_id": "uuid",
  "status": "RECEIVED"
}
```

### POST /api/reports/{report_id}/process

Runs extraction + matching + decision.

Response includes: - extraction; - candidates; - confidence; -
decision; - sync result if applicable.

For a production system this would normally be asynchronous; for the
prototype it can be synchronous if response times are acceptable.

### GET /api/reports/{report_id}

Returns: - source; - processing state; - extraction; - match results; -
decision; - audit references.

## Schedule

### GET /api/activities

Filters: - project; - discipline; - plant unit; - status; - delayed.

### GET /api/activities/{activity_id}

Returns activity details and history.

### PATCH /api/activities/{activity_id}/progress

Internal/protected mutation endpoint.

Request:

``` json
{
  "actual_progress": 80,
  "status": "IN_PROGRESS",
  "source_report_id": "uuid",
  "reason": "Field report synchronization"
}
```

Must: - validate progress; - persist; - create audit event.

## Matching

### POST /api/matching

Request:

``` json
{
  "report_id": "uuid"
}
```

Response: - candidates; - component scores; - confidence; - decision.

## Triage

### GET /api/triage

Returns pending review records.

### POST /api/triage/{review_id}/approve

Request:

``` json
{
  "activity_id": "uuid",
  "comment": "Verified against field report."
}
```

Must: - verify review is still pending; - update selected activity; -
create audit event; - mark review approved.

### POST /api/triage/{review_id}/reject

Request:

``` json
{
  "comment": "Insufficient evidence."
}
```

Must not update schedule.

## Delays

### GET /api/delays/summary

Returns aggregate root causes.

### GET /api/delays

Supports filters.

## Audit

### GET /api/audit

Supports: - activity; - report; - event type; - date range.

## Error contract

Use a consistent format:

``` json
{
  "error": {
    "code": "MATCHING_FAILED",
    "message": "Unable to calculate schedule match.",
    "details": {}
  }
}
```

Never return stack traces to the browser in production-like mode.
