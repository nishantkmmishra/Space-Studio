# Space Studio: System Architecture & Integration Blueprint

This guide details the end-to-end architecture and implementation of the Space Studio ecosystem. The system is designed to isolate concerns between a web-based management interface, a persistent bot service, and a Retrieval-Augmented Generation (RAG) intelligence pipeline.

---

## 1. System Overview

Space Studio provides a centralized operations center for Discord community management. It moves server administration from fragmented terminal commands to a unified web interface, enabling real-time knowledge curation and automated moderation.

### Data Flow Overview
```text
[Discord User]
     ↓
[Bot Service] → [AI Pipeline (Embeddings/Vector Search)]
     ↓                ↑
[Supabase DB] ↔ [Dashboard]
```

---

## 2. Design Decisions

The following architectural choices were made to prioritize resilience and operational agility:

*   **Supabase as Shared State**: Chosen over a custom REST/WebSocket backend to leverage built-in real-time synchronization and reduce infrastructure overhead.
*   **RAG over Fine-tuning**: Retrieval-Augmented Generation enables dynamic knowledge updates without the cost or latency of model retraining.
*   **Decoupled Services**: The bot and dashboard are independent services. This ensures that UI failures do not impact bot uptime or moderation event processing.

---

## 3. Architecture Design

The system uses a service-oriented architecture to isolate concerns and allow independent scaling of the dashboard and bot components.

*   **View Layer (React)**: Focuses exclusively on state presentation and operator input, communicating with the persistence layer via the Supabase SDK.
*   **Persistence Layer (Supabase)**: Acts as the shared state layer between the dashboard and bot. Enforces security via Row Level Security (RLS).
*   **Bot Service (Node.js)**: A persistent, event-driven service that reacts to Discord events and subscribes to configuration changes in the database.
*   **AI Pipeline**: Generates embeddings and performs vector similarity search (pgvector) to provide contextual answers.

---

## 4. Database Design (Supabase)

The schema is designed to support multi-guild isolation and real-time state mirroring.

### Core Tables
| Table | Columns | Purpose |
| :--- | :--- | :--- |
| `guild_configs` | `id (PK)`, `ai_model`, `bot_tone` | Shared state for bot behavior. |
| `guild_admins` | `user_id`, `guild_id`, `role` | Scopes dashboard access. |
| `documents` | `id`, `content`, `embedding` | Vector store for knowledge retrieval. |
| `chats` | `id`, `question`, `answer` | Persistent interaction logs. |
| `mod_logs` | `id`, `action`, `moderator_id` | Audit trail for server events. |

### Security Model
All client-side requests are scoped through Supabase RLS policies, ensuring no direct trust is placed on the frontend. The database strictly enforces ownership and permissions at the row level.

---

## 5. Dashboard ↔ Bot Connection

The system treats Supabase as a shared state layer rather than relying on direct API communication between services.

1.  **State Write**: The dashboard writes configuration changes (e.g., updating a welcome message) to the database.
2.  **State Reaction**: The bot subscribes to the `guild_configs` table and reacts to updates instantly without requiring a service restart or polling.

---

## 6. AI Integration: The RAG Pipeline

### Implementation Constraints
Real-world RAG systems involve trade-offs that are managed within this architecture:
*   **Latency**: Embedding generation and vector lookup adds ~100–300ms to response times.
*   **Context Density**: LLM context windows require strategic truncation of retrieved documents to maintain relevance.
*   **Cost**: Operational costs scale linearly with `/ask` command usage.

---

## 7. Failure Scenarios & Resilience

*   **Supabase Realtime Outage**: The bot falls back to polling the configuration at 5-minute intervals to ensure state eventually converges.
*   **AI Provider Failure**: The bot returns a pre-configured fallback response and logs the exception for operator review.
*   **Database Write Contention**: Failed event logs are queued and retried with exponential backoff to prevent data loss.

---

## 8. Scalability & Deployment

The architecture supports horizontal scaling by running multiple bot instances, each subscribing to relevant guild events while sharing the centralized Supabase backend. This allows for increased throughput without increasing the complexity of the shared state management.

---

## 9. End-to-End Flow Examples

*   **Operator Update**: Admin changes moderation rules in the Dashboard ➔ Database updates ➔ Bot reacts and applies new rules to Discord channels.
*   **AI Query**: User runs `/ask` ➔ Bot generates embedding ➔ Supabase performs vector match ➔ Bot sends context to LLM ➔ User receives answer.

---

Copyright © 2026 Operational Intelligence. Maintained by Nishant Kumar Mishra.
