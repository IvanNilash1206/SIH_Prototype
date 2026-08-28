# Source Alignment

## What the SIH proposal establishes

The supplied proposal identifies: - the problem of unstructured field
reports versus rigid EPC schedule IDs; - a Multimodal Ingestion Agent; -
a Hierarchical AI Matcher; - Confidence-Gated Sync; - Planner Triage; -
a Delay Analytics Database; - context-aware filtering by discipline and
plant location; - human-in-the-loop review; - deterministic extraction
with strict EPC schema; - PostgreSQL + vector search architecture; -
future Primavera P6 integration; - institutional memory for future
predictive risk modelling.

## Prototype interpretation

The prototype should demonstrate these concepts without pretending to
have completed enterprise deployment.

### Demonstrated directly

-   ingestion;
-   extraction;
-   constrained matching;
-   confidence gate;
-   automatic update;
-   planner review;
-   delay memory;
-   live progress;
-   auditability.

### Represented through adapters/mocks

-   Primavera;
-   enterprise PMIS;
-   WhatsApp;
-   large-scale infrastructure.

## Important claims discipline

Do not present prototype metrics as measured field performance.

For example: - "95% faster" from a concept/proposal graphic should not
be presented as a measured prototype benchmark unless actually
measured. - "90%+ root-cause capture" should not be presented as an
experimentally validated result unless tested. - "million-rupee
penalties prevented" should not be claimed from the prototype.

Instead use language such as: - "prototype demonstrates the mechanism
intended to reduce update latency"; - "foundation for delay root-cause
capture"; - "designed for future predictive risk modelling."

## Architecture alignment

The proposal's technical approach references: - Rust; - FastAPI; -
Whisper/IndicWhisper; - Llama-family extraction; - BGE-M3 embeddings; -
Qdrant; - PostgreSQL; - Redis; - React; - Next.js.

The prototype does not need every component. Use the simplest
architecture that visibly proves the product concept, while keeping
provider interfaces extensible.
