# UI Screen Specification

## Design language

### Visual direction

Industrial EPC control room + enterprise SaaS.

### Avoid

-   neon AI aesthetics;
-   excessive gradients;
-   cartoon AI imagery;
-   oversized decorative elements;
-   generic analytics templates.

### Use

-   dark navy/slate navigation;
-   clean white/light surfaces;
-   restrained status colors;
-   dense data presentation;
-   clear hierarchy;
-   compact badges;
-   progress bars;
-   tables;
-   timeline/Gantt;
-   audit information.

## Global navigation

-   Command Center
-   Field Reports
    -   New Report
    -   Processing
    -   History
-   Schedule Intelligence
    -   Matching
    -   Schedule
-   Planner Triage
-   Gantt & Progress
-   Delay Intelligence
-   Audit Trail
-   Project Configuration

## Screen 1 --- Command Center

### Header

-   SYNCHROLINK
-   Project name
-   LIVE indicator

### KPI cards

-   Activities
-   Updated Today
-   Auto-Synced
-   Awaiting Review
-   Delayed Activities
-   Schedule Health

### Main sections

1.  Overall progress.
2.  Discipline progress.
3.  Live activity feed.
4.  Recent delay events.
5.  Pending review summary.

## Screen 2 --- Field Reports

### Tabs

-   Voice
-   Text
-   DPR/File

### Text form

Fields: - report text; - optional supervisor; - optional report date; -
optional plant/unit.

### Processing state

Display: - receiving; - extracting; - normalizing; - contextual
filtering; - matching; - decision.

## Screen 3 --- Extraction Result

Two-column layout: - left: original report; - right: structured
extraction.

Show: - discipline; - plant unit; - area; - asset; - action; -
progress; - status; - delay duration; - root cause.

Include source/evidence where possible.

## Screen 4 --- Schedule Intelligence

Show: - extracted context; - number of initial schedule activities; -
filtered candidates; - ranked candidates; - component scores; - final
confidence; - decision.

A candidate row must include: - activity ID; - activity name; - WBS; -
discipline; - plant; - asset; - similarity; - match status.

## Screen 5 --- Gantt

Must support: - activity rows; - planned timeline; - actual/progress; -
status; - filters; - activity details.

After synchronization: - update actual progress; - show timestamp; -
show source report.

## Screen 6 --- Planner Triage

Each review item: - report text; - extracted entities; - confidence; -
reason for review; - candidates; - match explanation; - Approve; -
Reject; - Select candidate.

Approval requires an explicit user action.

## Screen 7 --- Delay Intelligence

Show: - total delays; - total delay days; - root-cause distribution; -
discipline distribution; - plant/unit distribution; - top delayed
activities; - recent delay events.

## Screen 8 --- Audit Trail

Columns: - timestamp; - actor; - source; - activity; - old progress; -
new progress; - confidence; - decision; - root cause.

Allow opening an event to see full details.

## Interaction principles

-   Any mutation should show immediate visual confirmation only after
    backend success.
-   Use optimistic UI only where rollback is implemented.
-   Never hide errors.
-   Preserve report content during errors.
-   Use skeleton loaders for major dashboard sections.
