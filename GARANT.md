# Space Project - System Architecture & Guide (GARANT)

This document provides a comprehensive overview of the Space Dashboard project, detailing the tech stack, connections, and core logic.

## 1. System Overview
**Space** is a modern management dashboard designed to interface with a Discord bot ecosystem (bot currently under construction). It provides a central hub for managing knowledge bases, moderation logs, server members, and system settings.

## 2. Technology Stack

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Languages** | TypeScript (TSX), SQL, JSON | Core logic, DB schema, and configuration. |
| **Frontend Framework** | React 18 + Vite | High-performance UI rendering and development. |
| **Routing** | React Router Dom v6 | Client-side navigation. |
| **State Management** | TanStack Query (v5) | Server-state management and data fetching. |
| **Styling** | Tailwind CSS | Utility-first styling with custom theme tokens. |
| **UI Components** | Shadcn UI (Radix UI) | Accessible, premium-feel interactive components. |
| **Database/Auth** | Supabase | PostgreSQL database and user authentication. |
| **Forms/Validation** | React Hook Form + Zod | Type-safe form handling and validation. |
| **Monorepo Tools** | Turborepo | Optimized build pipelines and workspace management. |

---

## 3. Architecture & Connections

### 3.1. Infrastructure Connections
The system follows a Client-Server architecture where the frontend communicates directly with Supabase:
- **Client (Dashboard)**: Runs in the browser, authenticated via Supabase Auth.
- **Backend (Supabase)**: Provides REST and Realtime APIs for PostgreSQL.
- **Connection Method**: Uses `@supabase/supabase-js` client initialized in `apps/dashboard/src/lib/supabase.ts`.

### 3.2. Authentication Flow
1. User enters credentials in `Login.tsx` or `Register.tsx`.
2. Request is sent to Supabase Auth.
3. On success, a JWT is stored in the browser.
4. `AuthCallback.tsx` handles OAuth or email verification redirects.

---

## 4. Key Directory & File Map

### 4.1. Root Level
- `package.json`: Root monorepo configuration (npm workspaces).
- `turbo.json`: Turborepo pipeline configuration for caching and task execution.
- `README.md`: Public-facing project overview and quick-start.
- `GARANT.md`: Technical system guide and roadmap.
- `*.sql`: Database schema and security policies.

### 4.2. Applications (`apps/`)
- `dashboard/`:
    - `public/`: Static assets (logos, icons).
    - `src/`:
        - `components/ui/`: Atomic design components (Shadcn/Radix).
        - `lib/`: Shared logic, API clients (Supabase), and utilities.
        - `pages/`: Page-level components and routing targets.
        - `App.tsx`: Main application router and state providers.
    - `vite.config.ts`: Frontend build configuration.
    - `tailwind.config.ts`: Design system tokens (colors, fonts, spacing).

---

## 5. Development Workflow

### Requirements
- **Node.js**: v18+ 
- **NPM**: v9+ (Workspaces support)

### Setup Commands
```bash
# 1. Install all dependencies for the monorepo
npm install

# 2. Configure environment
# Create apps/dashboard/.env.local with:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

---

## 6. Security Implementation
Security is handled at the database level using **Row Level Security (RLS)**:
- Users can only read/write their own profiles.
- Knowledge base access is restricted to authenticated managers.
- Audit logs (`mod_logs`) are append-only for integrity.

---

## 8. Future Improvements & Roadmap

The following enhancements are proposed to evolve the Space project from a dashboard-only setup into a full-scale AI ecosystem:

### 8.1. High Priority
- **Bot Core Development**: Implement the Discord bot using `discord.js` within a new `apps/bot` workspace.
- **Semantic Vector Search**: Integrate OpenAI or HuggingFace embeddings into the Supabase knowledge base for more accurate AI responses (shifting from text-search to vector-search).
- **Authentication Handover**: Finalize the link between Discord OAuth and Supabase Auth for seamless server management.

### 8.2. UI/UX Enhancements
- **Theming**: Add a "Dark Mode" toggle while maintaining the premium "Parchment" aesthetic.
- **Real-time Console**: Enhance the system console with WebSocket-driven live logs from the Discord bot.
- **Data Visualization**: Integrate `Recharts` to show bot activity trends and server growth.

### 8.3. Advanced Features
- **Multi-Guild Management**: Allow users to switch between different Discord servers they manage from a single dropdown.
- **Automated Ingestion**: Add a feature to upload PDFs or scrape websites directly into the knowledge base.
- **Granular Team Roles**: Implement Admin, Editor, and Viewer roles using Postgres Roles and custom RLS.

### 8.4. DevOps & Reliability
- **CI/CD Pipeline**: Setup GitHub Actions for automated linting, testing, and deployment to platforms like Vercel (Dashboard) and Railway (Bot).
- **Error Tracking**: Integrate Sentry for frontend and backend error monitoring.
