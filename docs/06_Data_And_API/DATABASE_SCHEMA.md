# Database Schema

## Project

``` text
projects
- id UUID PK
- name
- code
- description
- status
- created_at
- updated_at
```

## Plant units

``` text
plant_units
- id UUID PK
- project_id FK
- code
- name
```

## WBS nodes

``` text
wbs_nodes
- id UUID PK
- project_id FK
- parent_id FK nullable
- code
- name
- level
```

## Activities

``` text
activities
- id UUID PK
- project_id FK
- wbs_node_id FK
- activity_code UNIQUE
- name
- discipline
- plant_unit_id FK
- area
- asset_id nullable
- planned_start
- planned_finish
- baseline_progress
- actual_progress
- status
- is_delayed
- created_at
- updated_at
```

## Field reports

``` text
field_reports
- id UUID PK
- project_id FK
- submitted_by
- source_type
- raw_text
- transcript nullable
- file_reference nullable
- report_date
- processing_status
- created_at
- updated_at
```

## Extractions

``` text
extractions
- id UUID PK
- report_id FK
- discipline nullable
- plant_unit nullable
- area nullable
- asset_id nullable
- action nullable
- progress_percent nullable
- status nullable
- delay_days nullable
- delay_root_cause nullable
- raw_json
- extraction_confidence nullable
- created_at
```

## Match results

``` text
match_results
- id UUID PK
- report_id FK
- activity_id FK
- rank
- confidence
- asset_score
- location_score
- discipline_score
- action_score
- semantic_score
- decision
- explanation_json
- created_at
```

## Reviews

``` text
planner_reviews
- id UUID PK
- report_id FK
- selected_activity_id nullable
- decision
- reviewer
- comment
- reviewed_at
```

## Delay events

``` text
delay_events
- id UUID PK
- project_id FK
- activity_id FK
- report_id FK
- delay_days
- root_cause
- description
- created_at
```

## Audit events

``` text
audit_events
- id UUID PK
- project_id FK
- report_id FK nullable
- activity_id FK nullable
- actor_type
- actor_id nullable
- event_type
- old_value_json
- new_value_json
- confidence nullable
- decision nullable
- reason
- created_at
```

## Important invariants

1.  `actual_progress` must remain between 0 and 100.
2.  Schedule mutation must create an audit event.
3.  A HUMAN_REVIEW report cannot mutate an activity until approval.
4.  A rejected report must not mutate official progress.
5.  Every delay event should reference the source report when possible.
6.  Raw report content must remain traceable.
