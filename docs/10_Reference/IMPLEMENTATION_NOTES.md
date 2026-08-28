# Implementation Notes

## 1. Build for the judge, not for theoretical completeness

The strongest prototype is a reliable end-to-end demonstration, not a
collection of partially implemented enterprise integrations.

## 2. Keep AI replaceable

Do not scatter LLM calls through UI components.

Use:

``` text
ExtractionProvider
EmbeddingProvider
SpeechProvider
```

so providers can be swapped.

## 3. Keep schedule mutation centralized

Only the Schedule Service should mutate official activity progress.

This prevents: - duplicate business logic; - accidental low-confidence
updates; - inconsistent audit trails.

## 4. Make demo behavior deterministic

The golden report must always match the intended P-204 activity.

A deterministic demo provider is acceptable because it is a prototype
fallback, as long as the architecture supports real providers.

## 5. Do not expose hidden reasoning

The product should show: - structured match factors; - candidate
ranking; - confidence; - decision reason.

Do not display private model chain-of-thought.

## 6. Gantt is a payoff visualization

The Gantt should not be an isolated page.

It must visibly change after: - automatic synchronization; - planner
approval.

## 7. Delay analytics should be linked to source

Clicking a delay should lead to: - activity; - report; - extracted root
cause; - timestamp; - audit event.

## 8. Demo mode

If possible, provide: - DEMO mode indicator; - seed/reset; - sample
reports; - predictable mock AI provider.

## 9. Enterprise honesty

If an integration is simulated, label it: - "Demo Adapter"; - "Simulated
P6 Sync"; - "Prototype Export".

Do not use misleading language such as "Connected to Primavera" unless
it is actually connected.

## 10. Final presentation polish

Prioritize: 1. end-to-end reliability; 2. matching explanation; 3.
confidence gate; 4. Gantt update; 5. triage safety; 6. delay
intelligence; 7. visual polish.
