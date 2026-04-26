# 🌌 Space Studio

> **A quiet management studio for louder communities.**

Space is a premium, AI-powered operations center for Discord. It replaces chaotic bot commands with a high-fidelity, "Literary Salon" interface designed for clarity, precision, and calm.

![Space Dashboard Hero](./docs/assets/console.png)

---

## ✨ Core Modules

### 📚 Knowledge Base
The source of truth for your AI. Curate documentation, manage categories, and refine the context used by your RAG engine to ensure accurate community support.
![Knowledge Base](./docs/assets/knowledge_base.png)

### 💬 Conversations Audit
Review every bot interaction in real-time. The "Refine" loop allows you to flag drifts and correct answers, training the bot for better future reasoning.
![Conversations](./docs/assets/chats.png)

### 👥 Community & Moderation
A unified registry of your members. Track behavior, manage roles, and maintain a professional ledger of all administrative interventions.
![Members](./docs/assets/members.png)
![Moderation Logs](./docs/assets/mod_logs.png)

### ⚙️ Infrastructure
Fine-tune your bot's personality and intelligence providers. Support for OpenRouter, Gemini, and more, all managed from a single, beautiful dashboard.
![Settings AI](./docs/assets/settings_ai.png)

---

## 🛠️ Technical Stack

- **Framework**: React 18 + Vite (SOA Architecture)
- **State**: TanStack Query v5 + Zustand
- **Persistence**: Supabase (PostgreSQL + RLS)
- **Aesthetics**: Custom Design System (Warm Parchment + Serif Typography)
- **Integrations**: Discord API (REST/SSE)

---

## 📖 Documentation Portal

| Guide | Description |
| :--- | :--- |
| [🏗️ Architecture](./docs/ARCHITECTURE.md) | Deep dive into the SOA layers, services, and intelligence patterns. |
| [🛠️ Development](./docs/DEVELOPMENT.md) | Setup instructions, environment variables, and database initialization. |
| [🤝 Contributing](./docs/CONTRIBUTING.md) | Coding standards, git workflow, and design philosophy. |

---

## 🚀 Getting Started

1. **Install**: `npm install`
2. **Configure**: Set up `.env.local` in `apps/dashboard` (see [Development Guide](./docs/DEVELOPMENT.md)).
3. **Initialize**: Execute the scripts in the `/supabase` folder.
4. **Launch**: `npm run dev`

---
*Developed with excellence by [Nishant Kumar Mishra](https://github.com/nishantkmmishra).*
