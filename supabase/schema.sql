-- 🌌 Space Project: Database Schema

-- 1. Knowledge Base
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    category TEXT CHECK (category IN ('Onboarding', 'FAQ', 'Curriculum', 'Policy', 'Support', 'General')) DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversations Audit
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_tag TEXT NOT NULL,
    channel TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    rating TEXT CHECK (rating IN ('good', 'wrong')) NULL,
    docs_used TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Community Registry
CREATE TABLE IF NOT EXISTS guild_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    discriminator TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('Member', 'Moderator', 'Admin', 'Owner', 'Patron')) DEFAULT 'Member',
    warnings INTEGER DEFAULT 0,
    notes TEXT,
    joined_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, user_id)
);

-- 4. Infrastructure Configuration
CREATE TABLE IF NOT EXISTS guild_configs (
    guild_id TEXT PRIMARY KEY,
    workspace_name TEXT DEFAULT 'Space Studio',
    bot_tone TEXT DEFAULT 'Warm & literary',
    welcome_message TEXT,
    welcome_channel_id TEXT,
    mod_log_channel_id TEXT,
    rag_channel_id TEXT,
    ai_provider TEXT DEFAULT 'OpenRouter',
    ai_base_url TEXT DEFAULT 'https://openrouter.ai/api/v1',
    ai_model TEXT,
    ai_api_key TEXT, -- Encrypt this in production
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Moderation Logs
CREATE TABLE IF NOT EXISTS mod_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT CHECK (action IN ('BAN', 'WARN', 'KICK', 'MUTE')) NOT NULL,
    target_id TEXT NOT NULL,
    target_tag TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    moderator_tag TEXT NOT NULL,
    reason TEXT,
    duration TEXT,
    guild_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
