# Demo Data and Product Copy

## Project

**CDU Capacity Expansion --- Unit 2**

## Disciplines

-   Civil
-   Mechanical
-   Piping
-   Electrical
-   Instrumentation

## Plant units

-   CDU-01
-   CDU-02
-   CDU-03
-   TANK-FARM
-   UTILITIES
-   CONTROL-ROOM

## Example assets

-   P-201
-   P-202
-   P-203
-   P-204
-   P-205
-   V-101
-   V-102
-   V-103
-   HX-201
-   HX-202
-   TK-301
-   TK-302

## Golden schedule activities

### MECH-CDU2-P204-001

P-204 Foundation Preparation

### MECH-CDU2-P204-002

P-204 Mechanical Installation

### MECH-CDU2-P204-003

P-204 Alignment

### MECH-CDU2-P204-004

P-204 Testing

### MECH-CDU2-P204-005

P-204 Commissioning

## Golden report

"CDU Unit 2 mein P-204 pump mechanical installation 80 percent complete
hai. Material delivery ki wajah se 2 din delay hua."

## Golden expected extraction

``` json
{
  "discipline": "MECHANICAL",
  "plant_unit": "CDU-02",
  "asset_id": "P-204",
  "action": "MECHANICAL_INSTALLATION",
  "progress_percent": 80,
  "status": "IN_PROGRESS",
  "delay_days": 2,
  "delay_root_cause": "MATERIAL_DELIVERY"
}
```

## Golden expected match

Activity: `MECH-CDU2-P204-002`

Expected decision: `AUTO_SYNC`

Expected confidence: high, \>= 0.85.

The exact numerical score can vary if the matching engine is genuinely
calculated, but the seeded demo must remain above the threshold.

## Ambiguous report

"Pump area ka installation almost complete hai. Testing pending hai."

Expected: - asset unknown; - more than one plausible candidate; -
confidence \< 0.85; - decision HUMAN_REVIEW.

## Additional test reports

### Civil

"CDU-02 mein foundation F-102 ka concrete pour 95 percent complete ho
gaya."

### Electrical

"Control room panel EP-07 cable termination 60 percent complete hai."

### Delay

"P-208 installation ruk gaya because required gasket material abhi
receive nahi hua."

### Completion

"P-203 mechanical installation complete, actual progress 100 percent."

## Status vocabulary

-   NOT_STARTED
-   IN_PROGRESS
-   COMPLETED
-   BLOCKED
-   DELAYED
-   ON_HOLD

## Delay vocabulary

-   MATERIAL_DELIVERY
-   LABOUR_SHORTAGE
-   EQUIPMENT_FAILURE
-   WEATHER
-   DESIGN_CHANGE
-   ACCESS_RESTRICTION
-   CONTRACTOR_DELAY
-   OTHER

Normalize synonyms into these categories.
