import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    "\n⚠️  Supabase is not configured.\n" +
    "Create apps/dashboard/.env.local with:\n" +
    "  VITE_SUPABASE_URL=https://your-project.supabase.co\n" +
    "  VITE_SUPABASE_ANON_KEY=your-anon-key\n"
  );
}

// Supabase v2 throws if URL or key are invalid at module init time.
// Use valid-shaped placeholders so the app loads even without .env.local.
// All queries will simply fail gracefully with auth errors until configured.
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
// A structurally valid (but fake) JWT so supabase-js doesn't throw
const PLACEHOLDER_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIwIiwicm9sZSI6ImFub24iLCJleHAiOjk5OTk5OTk5OTl9." +
  "placeholder";

export const supabase = createClient(
  supabaseUrl || PLACEHOLDER_URL,
  supabaseAnonKey || PLACEHOLDER_KEY
);

export const SUPABASE_CONFIGURED = isConfigured;

// ── Bot API helper ──────────────────────────────────────────────────────────
export const BOT_API_URL = import.meta.env.VITE_BOT_API_URL || "http://localhost:3001";
export const BOT_API_SECRET = import.meta.env.VITE_BOT_API_SECRET || "";

export async function botFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (BOT_API_SECRET) headers["Authorization"] = `Bearer ${BOT_API_SECRET}`;
  return fetch(`${BOT_API_URL}${path}`, { ...options, headers });
}
