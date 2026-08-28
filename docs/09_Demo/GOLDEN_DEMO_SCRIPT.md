# Golden Demo Script

## Demo objective

Demonstrate the full value proposition in 5--8 minutes.

## Scene 1 --- Command Center

Say:

> "This is our EPC project control room. The schedule is the system of
> record, but field progress arrives as unstructured reports."

Show: - overall progress; - delayed activities; - pending review.

## Scene 2 --- Submit field report

Open Field Reports → New Report.

Paste:

"CDU Unit 2 mein P-204 pump mechanical installation 80 percent complete
hai. Material delivery ki wajah se 2 din delay hua."

Click Process.

## Scene 3 --- Extraction

Point out: - Mechanical; - CDU-02; - P-204; - Installation; - 80%; - 2
days; - Material Delivery.

Say:

> "The supervisor does not need to know the schedule activity ID.
> SynchroLink extracts the project-control facts."

## Scene 4 --- Matching

Open Schedule Intelligence.

Show candidate ranking.

Say:

> "We first constrain the search by project context such as discipline
> and plant unit. Then semantic/entity matching ranks the remaining
> schedule activities."

Highlight the P-204 installation activity.

Show: - asset match; - location match; - discipline match; - action; -
confidence.

## Scene 5 --- Auto-sync

Show confidence \>= 85%.

Say:

> "Above the confidence gate, the system can safely synchronize the
> actual progress."

Show: - old progress; - new progress; - timestamp; - source report.

Open Gantt.

Show the activity update.

## Scene 6 --- Ambiguous report

Submit:

"Pump area ka installation almost complete hai. Testing pending hai."

Show: - asset unknown; - multiple candidates; - confidence below 85%; -
AUTO-SYNC blocked.

Say:

> "When the evidence is insufficient, SynchroLink does not guess."

## Scene 7 --- Planner Triage

Open review.

Select correct candidate.

Approve.

Show: - schedule update; - audit record.

Say:

> "The planner remains in control of ambiguous decisions."

## Scene 8 --- Delay Intelligence

Open Delay Intelligence.

Show: - Material Delivery; - delay days; - affected activities; -
historical events.

Say:

> "Every field report becomes structured project memory instead of
> disappearing into a spreadsheet or chat thread."

## Closing

Use:

> "SynchroLink is not replacing project controls. It is eliminating the
> manual reconciliation layer between what happens on site and what the
> schedule knows."
