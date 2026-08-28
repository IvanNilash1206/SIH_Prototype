# Recommended Project Structure

Adapt this structure to the existing repository instead of blindly
recreating it.

``` text
synchrolink/
├── README.md
├── .env.example
├── docker-compose.yml
├── package.json
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   └── api/
│       ├── app/
│       │   ├── main.py
│       │   ├── api/
│       │   ├── models/
│       │   ├── schemas/
│       │   ├── services/
│       │   ├── providers/
│       │   └── repositories/
│       └── tests/
├── data/
│   ├── seed/
│   │   ├── projects.json
│   │   ├── activities.json
│   │   └── reports.json
│   └── imports/
├── migrations/
├── scripts/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
```

## Frontend feature organization

Prefer feature-oriented organization:

``` text
features/
├── dashboard/
├── field-reports/
├── extraction/
├── matching/
├── triage/
├── gantt/
├── delays/
└── audit/
```

## Backend service organization

``` text
services/
├── extraction.py
├── matching.py
├── decision.py
├── schedule.py
├── delay.py
└── audit.py
```

Keep business logic out of route handlers.

## Environment

Provide `.env.example` containing only non-secret examples such as:

``` text
DATABASE_URL=
AI_PROVIDER=
AI_API_KEY=
EMBEDDING_PROVIDER=
EMBEDDING_API_KEY=
CONFIDENCE_THRESHOLD=0.85
```

The application must have safe defaults for local demo mode.
