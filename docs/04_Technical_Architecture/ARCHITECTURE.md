# Technical Architecture

## Prototype architecture

``` text
                    ┌───────────────────────────┐
                    │        Web Frontend       │
                    │       React / Next.js     │
                    └─────────────┬─────────────┘
                                  │ HTTP/JSON
                                  ▼
                    ┌───────────────────────────┐
                    │       FastAPI Backend     │
                    └─────────────┬─────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
       │ Extraction   │   │ Matching     │   │ Analytics    │
       │ Service      │   │ Engine       │   │ Service      │
       └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 ▼
                       ┌────────────────────┐
                       │    PostgreSQL      │
                       │ WBS / Activities   │
                       │ Reports / Matches  │
                       │ Delays / Audit     │
                       └────────────────────┘
```

## Suggested stack

### Frontend

-   Next.js or React
-   TypeScript
-   Tailwind CSS or existing project styling system
-   Gantt library suitable for React
-   Charting library for analytics

### Backend

-   Python
-   FastAPI
-   Pydantic
-   SQLAlchemy or equivalent ORM

### Database

-   PostgreSQL

### Semantic matching

-   Embedding provider behind an abstraction.
-   Qdrant/FAISS can be added if needed.
-   Prototype can use in-process vector search for a small seeded
    dataset.

### Speech

-   Browser speech recognition or speech-to-text service behind an
    abstraction.
-   The prototype must remain functional without voice if the speech
    service is unavailable.

## Production direction from the proposal

The proposal describes Rust for a high-concurrency API gateway,
Python/FastAPI for LLM orchestration, PostgreSQL for rigid WBS data, and
Qdrant/FAISS for semantic search.

Those production concerns should not complicate the prototype
unnecessarily.

## Service boundaries

### Report Service

Responsibilities: - create report; - retrieve report; - report status.

### Extraction Service

Responsibilities: - convert report text/audio transcript to structured
EPC entities; - validate schema; - preserve evidence.

### Matching Service

Responsibilities: - filter candidates; - compute similarity; - calculate
confidence; - return ranked candidates.

### Decision Service

Responsibilities: - apply confidence threshold; - return AUTO_SYNC or
HUMAN_REVIEW.

### Schedule Service

Responsibilities: - read activities; - update actual progress; -
maintain schedule state; - calculate progress metrics.

### Delay Service

Responsibilities: - create delay events; - aggregate root causes; -
compute delay metrics.

### Audit Service

Responsibilities: - append schedule mutation records; - preserve source
references.

## Adapter pattern

Create interfaces:

``` text
LLMProvider
EmbeddingProvider
SpeechProvider
ScheduleProvider
```

The default prototype implementations may be local/mock providers.

Future integrations should implement the same interfaces.

## State machine

``` text
RECEIVED
   ↓
PROCESSING
   ↓
EXTRACTED
   ↓
MATCHED
   ↓
   ├── confidence >= threshold → AUTO_SYNCED
   │                                ↓
   │                            ANALYTICS_UPDATED
   │
   └── confidence < threshold → HUMAN_REVIEW
                                    ↓
                              APPROVED / REJECTED
                                    ↓
                              ANALYTICS_UPDATED
```

If a step fails:

``` text
PROCESSING → FAILED
MATCHED → MATCH_FAILED
SYNC → SYNC_FAILED
```

A failure must never be reported as success.

## Security basics

-   Do not store API keys in source.
-   Validate all user inputs.
-   Sanitize file uploads.
-   Restrict file types.
-   Do not execute uploaded files.
-   Add basic request logging without exposing secrets.
