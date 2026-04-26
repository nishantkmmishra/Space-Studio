# Space Studio: System Architecture & Implementation Guide

This guide details the end-to-end architecture and implementation of **Space Studio**, an AI-powered ecosystem for Discord community management. The system consists of a React management studio, a Node.js Discord bot, and a Retrieval-Augmented Generation (RAG) intelligence layer.

---

## 1. System Overview

**Space Studio** serves as a centralized operations center for Discord servers. It moves community management from chaotic terminal commands to a high-fidelity web interface.

*   **Dashboard**: A React-based studio where admins curate knowledge, monitor logs, and tune AI.
*   **Database**: Supabase (PostgreSQL) acts as the single source of truth and the real-time bridge.
*   **Bot**: A persistent Node.js service that executes commands and interacts with users based on the dashboard's configuration.

**Use Case**: A Discord server for an AI startup uses the bot to answer technical questions via `/ask`. Admins monitor these answers on the dashboard, correcting "AI drift" by updating the knowledge base in real-time.

---

## 2. Architecture Design

The system follows a **Service-Oriented Architecture (SOA)** to ensure modularity.

*   **View Layer (React)**: Handles state and presentation. Communicates with Supabase via the client SDK.
*   **Persistence Layer (Supabase)**: Handles Auth, PostgreSQL storage, and the **Realtime** bus for Dashboard ↔ Bot synchronization.
*   **Bot Service (Node.js)**: An event-driven service using `discord.js`. It listens to Discord events and subscribes to database changes.
*   **AI Service**: A RAG pipeline that handles text embeddings (OpenAI/Gemini) and vector similarity search (pgvector).

---

## 3. Dashboard Implementation

Built with **React 18** and **Vite**, the dashboard uses a "Service Object" pattern to keep components "dumb."

### Folder Structure
```text
src/
├── components/         # Reusable UI (Button, Card, Sidebar)
├── hooks/              # Real-time subscriptions & shared logic
├── lib/
│   ├── supabase.ts     # Client initialization
│   └── services/       # Business logic (botService, documentService)
└── pages/              # Route-level views (KnowledgeBase, Console)
```

### Data Fetching
Using **TanStack Query v5** for caching and optimistic updates:
```typescript
const { data: documents } = useQuery({
  queryKey: ['documents'],
  queryFn: () => documentService.getAll()
});
```

---

## 4. Database Design (Supabase)

### Core Tables
| Table | Columns | Relationship |
| :--- | :--- | :--- |
| `guild_configs` | `id (PK)`, `workspace_name`, `ai_model`, `bot_tone` | 1:1 with Discord Guild |
| `documents` | `id`, `title`, `content`, `category`, `embedding` | Metadata for RAG |
| `chats` | `id`, `user_id`, `question`, `answer`, `rating` | Log of AI interactions |
| `mod_logs` | `id`, `action`, `reason`, `moderator_id` | Audit trail |

### Security (RLS)
Every table has **Row Level Security** enabled.
```sql
CREATE POLICY "Guild admins can manage their config" 
ON guild_configs FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM guild_admins WHERE guild_id = id));
```

---

## 5. Bot Integration (discord.js)

The bot is a long-running process that bridges Discord with Supabase.

### Setup & Connection
```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const supabase = createClient(process.env.URL, process.env.KEY);

client.once('ready', () => console.log('Bot Synchronized'));
client.login(process.env.TOKEN);
```

### Event Handling
When a member joins, the bot writes to the DB, which instantly updates the Dashboard:
```javascript
client.on('guildMemberAdd', async (member) => {
  await supabase.from('members').upsert({ user_id: member.id, guild_id: member.guild.id });
});
```

---

## 6. Slash Commands System

Commands are defined as JSON and registered via the Discord REST API.

*   `/ask`: Triggers the AI pipeline.
*   `/config`: Fetches the current `guild_configs` from Supabase to show current settings.
*   `/ban /warn`: Executes moderation and writes to `mod_logs`.

---

## 7. Dashboard ↔ Bot Connection

The connection is **Real-time & Asynchronous**.

1.  **Dashboard → Bot**: Admin toggles "Slow Mode" in the Dashboard. Supabase updates the `guild_configs` table. The Bot, subscribed to `guild_configs` via `.on('postgres_changes', ...)`, receives the update and applies the change to the Discord channel immediately.
2.  **Bot → Dashboard**: User runs a command. Bot writes to `mod_logs`. Dashboard, using a `useQuery` or `Realtime` hook, reflects the new log entry without a page refresh.

---

## 8. AI Integration (The RAG Pipeline)

### The `/ask` Flow
1.  **Ingestion**: User runs `/ask "How do I upgrade?"`.
2.  **Vectorization**: Bot sends the query to the Embedding API (e.g., `text-embedding-3-small`).
3.  **Search**: Bot queries Supabase using vector similarity:
    ```sql
    SELECT content FROM documents 
    ORDER BY embedding <=> query_embedding 
    LIMIT 3;
    ```
4.  **Completion**: Bot sends the retrieved context + user query to the LLM (Gemini/OpenAI) and returns the answer.

---

## 9. Configuration System

Everything is controlled via the `guild_configs` table:
*   **Permissions**: `allowed_roles` array in the config.
*   **AI Personality**: `bot_tone` (e.g., "Professional", "Helpful") is injected into the LLM system prompt.
*   **Feature Toggles**: Boolean flags like `enable_auto_mod`.

---

## 10. End-to-End Flow Examples

### Case A: Knowledge Update
1.  Admin adds "New Refund Policy" in the Dashboard.
2.  `documentService.create()` writes to Supabase.
3.  Next time a user runs `/ask`, the bot retrieves this new policy automatically.

### Case B: Moderation
1.  Bot detects a banned word.
2.  Bot deletes message and writes a "WARN" to `mod_logs`.
3.  Admin sees the "Audit Logs" page update in real-time on the Dashboard.

---

## 11. Best Practices

*   **Graceful Degradation**: If the AI API is down, the bot should fallback to a standard "I can't answer that right now" message.
*   **Rate Limiting**: Implement per-user rate limits on the `/ask` command to prevent API cost spikes.
*   **Clean Architecture**: Keep the Bot's command logic separate from its Discord client logic (use a command handler).
*   **Security**: Never store the Bot Token or AI API Key in the database as plain text. Use environment variables or a Secrets Manager.

---

## 12. Conclusion

By using Supabase as a real-time state machine between a React frontend and a Node.js bot, you create a seamless, high-fidelity management experience. This architecture is highly scalable and allows for complex "human-in-the-loop" AI workflows that are impossible with standalone bots.
