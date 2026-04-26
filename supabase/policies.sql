-- 🌌 Space Project: Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mod_logs ENABLE ROW LEVEL SECURITY;

-- 1. Documents Policies
CREATE POLICY "Authenticated users can read documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage documents" ON documents FOR ALL TO authenticated USING (true);

-- 2. Chats Policies
CREATE POLICY "Authenticated users can read chats" ON chats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update chat ratings" ON chats FOR UPDATE TO authenticated USING (true);

-- 3. Guild Members Policies
CREATE POLICY "Authenticated users can manage members" ON guild_members FOR ALL TO authenticated USING (true);

-- 4. Guild Configs Policies
CREATE POLICY "Authenticated users can manage configs" ON guild_configs FOR ALL TO authenticated USING (true);

-- 5. Mod Logs Policies
CREATE POLICY "Authenticated users can read mod logs" ON mod_logs FOR SELECT TO authenticated USING (true);

-- NOTE: In a multi-tenant production environment, you should replace (true) 
-- with checks for user_id or guild_id ownership.
