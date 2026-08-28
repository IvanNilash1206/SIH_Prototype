# Voice and Multimodal Input

## Prototype objective

Demonstrate that field workers can provide information naturally without
learning EPC schedule IDs.

## Voice flow

``` text
Microphone
   ↓
Speech-to-text
   ↓
Transcript
   ↓
Extraction
   ↓
Matching
```

## Example Hinglish transcript

"CDU ke second unit mein P-204 ka installation assi percent ho gaya hai,
lekin material late aane ke wajah se do din delay hua."

Expected normalized facts: - plant: CDU-02; - asset: P-204; - action:
installation; - progress: 80%; - delay: 2 days; - root cause: material
delivery.

## Provider strategy

Create:

``` text
SpeechProvider.transcribe(audio) -> Transcript
```

Implement: - browser/local demo provider where feasible; - external
provider behind an adapter.

If speech service is unavailable: - show a clear unavailable message; -
keep text workflow fully functional.

## File/DPR ingestion

For prototype: - accept CSV/XLSX if practical; - parse structured
rows; - map columns to report fields; - create field-report records.

Do not execute uploaded files.

## Safety

-   validate MIME/type;
-   enforce size limits;
-   sanitize filenames;
-   store outside executable paths;
-   reject unsupported formats with an actionable error.
