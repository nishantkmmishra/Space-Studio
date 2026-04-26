# 🛠️ Development Setup

This guide provides step-by-step instructions for setting up the Space development environment locally.

## 📋 Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher
- **Supabase Account**: For database and authentication

## 🚀 Local Setup

### 1. Repository Initialization
```bash
git clone https://github.com/nishantkmmishra/spacebot.git
cd spacebot
npm install
```

### 2. Environment Configuration
Create `apps/dashboard/.env.local` with your Supabase credentials:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BOT_API_URL=http://localhost:3001
VITE_BOT_API_SECRET=your_secret_if_any
```

### 3. Database Initialization
Execute the SQL scripts located in the `supabase/` directory within your Supabase SQL Editor in this order:
1. `schema.sql`
2. `policies.sql`

### 4. Running the Dashboard
```bash
npm run dev
```

## 🧪 Testing & Verification
- **Linting**: `npm run lint`
- **Build**: `npm run build`
- **Manual**: Verify that the "Bot Health" page correctly connects to your local bot instance or returns a clean "Offline" state.

---
*Questions? Reach out to nishantkmmishra@gmail.com.*
