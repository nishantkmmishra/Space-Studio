# 🛡️ Space: System Architecture

Welcome to the internal blueprint of **Space**. This document details the infrastructure, service layers, and intelligence patterns that power the Management Studio.

---

## 🏗️ Core Architecture
Space is built as a production-grade **React 18** application using a **Service-Oriented Architecture (SOA)**. It prioritizes the separation of UI concerns from business logic and persistence layers.

### 1. Application Layers
- **View Layer**: React components (`apps/dashboard/src/pages`) focus exclusively on rendering and user interaction.
- **Service Layer**: (`apps/dashboard/src/lib/services/`) The "brain" of the application. Services handle all API calls (Supabase, Bot SSE), data transformations, and error handling.
- **Persistence Layer**: [Supabase](https://supabase.com) handles PostgreSQL storage, Auth, and Real-time subscriptions.

---

## 🧬 Service Catalog
Every feature in Space is backed by a dedicated service object to ensure type safety and maintainability.

| Service | Responsibility | Persistence |
| :--- | :--- | :--- |
| `documentService` | Knowledge Base CRUD | `documents` |
| `chatService` | Conversation logging | `chats` (Real-time) |
| `botService` | Bot Health & Actions | Bot API (REST/SSE) |
| `memberService` | User management | `guild_members` |
| `modLogService` | Audit trailing | `mod_logs` |
| `settingsService` | Infrastructure config | `guild_configs` |

---

## 🧠 Intelligence Patterns
Space implements **Retrieval Augmented Generation (RAG)** to provide accurate community assistance.

1. **Knowledge Retrieval**: Passages are retrieved from the `documents` table based on user queries.
2. **Provider Agnostic**: Support for OpenRouter, OpenAI, Groq, and HuggingFace.
3. **Refinement Loop**: The Conversations interface allows admins to flag and "Refine" AI responses, creating a high-quality human-in-the-loop feedback system.

---

## 🚀 Technical Standards
1. **Type Safety**: Zero `any` policy. Strict TypeScript interfaces for all service contracts.
2. **Persistence**: Row Level Security (RLS) is enforced for all tables.
3. **Aesthetics**: Follows the "Literary Salon" design system (Parchment backgrounds, Serif headers).

---
*Maintained by Nishant Kumar Mishra.*
