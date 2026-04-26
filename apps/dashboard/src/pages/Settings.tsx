import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { supabase, botFetch } from "@/lib/supabase";
import { toast } from "sonner";

interface GuildConfig {
  guild_id: string; welcome_channel_id: string; mod_log_channel_id: string; rag_channel_id: string;
  welcome_message: string; workspace_name: string; bot_tone: string;
}

const BOT_TONES = ["Warm & literary", "Precise & professional", "Casual & friendly", "Concise & direct"];
const AI_PROVIDERS = ["OpenRouter", "OpenAI", "Groq", "HuggingFace"];
const FREE_MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "mistralai/mistral-7b-instruct:free",
  "huggingfaceh4/zephyr-7b-beta:free"
];

export default function Settings() {
  const [tab, setTab] = useState<"general" | "discord" | "database">("general");
  const [config, setConfig] = useState<Partial<GuildConfig>>({});
  const [loading, setLoading] = useState(true);
  const [botStatus, setBotStatus] = useState<{ online: boolean; latency: number; guilds: number; username: string } | null>(null);
  const [testingBot, setTestingBot] = useState(false);
  const [channels, setChannels] = useState<{ id: string; name: string; guildName: string }[]>([]);
  const [fetchingChannels, setFetchingChannels] = useState(false);
  const [activePicker, setActivePicker] = useState<keyof GuildConfig | null>(null);
  const [creatingChannel, setCreatingChannel] = useState<keyof GuildConfig | null>(null);

  // Load config (use first row for demo — real apps would key by guild_id from auth)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from("guild_configs").select("*").limit(1).single();
        if (data) setConfig(data);
      } catch {
        // No config yet — that's fine
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveMut = useMutation({
    mutationFn: async (cfg: Partial<GuildConfig>) => {
      const guildId = cfg.guild_id || "default";
      const { error } = await supabase.from("guild_configs").upsert({ ...cfg, guild_id: guildId, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Settings saved"),
    onError: (e: Error) => toast.error("Save failed", { description: e.message }),
  });

  const testBot = async () => {
    setTestingBot(true);
    try {
      const res = await botFetch("/status");
      if (!res.ok) throw new Error("Bot API returned " + res.status);
      const data = await res.json();
      setBotStatus(data);
      toast.success("Bot is online!", { description: `${data.username} · Latency: ${data.latency}ms` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      setBotStatus(null);
      toast.error("Bot offline or unreachable", { description: msg });
    } finally {
      setTestingBot(false);
    }
  };

  const fetchChannels = async () => {
    if (channels.length > 0) return; // Only fetch once or when requested
    setFetchingChannels(true);
    try {
      const res = await botFetch("/channels");
      if (!res.ok) throw new Error("Bot API returned " + res.status);
      const data = await res.json();
      setChannels(data.channels || []);
    } catch (e) {
      toast.error("Failed to fetch channels", { description: e instanceof Error ? e.message : "Bot might be offline" });
    } finally {
      setFetchingChannels(false);
    }
  };

  const selectChannel = (key: keyof GuildConfig, id: string) => {
    setConfig({ ...config, [key]: id });
    setActivePicker(null);
  };

  const createChannel = async (key: keyof GuildConfig, name: string) => {
    setCreatingChannel(key);
    try {
      const res = await botFetch("/channels", {
        method: "POST",
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error("Bot API returned " + res.status);
      const data = await res.json();
      setConfig(prev => ({ ...prev, [key]: data.id }));
      toast.success(`Channel #${name} created!`, { description: "ID automatically applied." });
      setChannels([]); // Refresh list next time
    } catch (e) {
      toast.error("Failed to create channel", { description: e instanceof Error ? e.message : "Bot might be offline" });
    } finally {
      setCreatingChannel(null);
    }
  };

  const tabs = [
    { k: "general", l: "General", icon: "settings" as const },
    { k: "discord", l: "Discord",  icon: "discord" as const },
    { k: "ai", l: "AI Engine", icon: "sparkle" as const },
    { k: "database", l: "Database", icon: "database" as const },
  ];

  return (
    <div className="px-10 py-10 max-w-[820px] mx-auto">
      <PageHeader eyebrow="Configuration" title="Settings." subtitle="Tune the bot's behavior, channels, and connections." />

      <div className="flex gap-1.5 mb-7">
        {tabs.map(({ k, l, icon }) => (
          <button key={k} onClick={() => setTab(k as typeof tab)}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border flex items-center gap-1.5 transition-colors ${tab === k ? "bg-foreground text-background border-foreground" : "bg-card text-olive border-border hover:border-accent hover:text-accent"}`}>
            <Icon name={icon} size={12} /> {l}
          </button>
        ))}
      </div>

      {loading ? <div className="text-stone animate-pulse">Loading…</div> : (
        <>
          {tab === "general" && (
            <div className="card-elevated p-7 space-y-5">
              <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium">General</div>
              <label className="block">
                <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Workspace name</span>
                <input value={config.workspace_name || ""} onChange={(e) => setConfig({ ...config, workspace_name: e.target.value })} className="input-claude" placeholder="My server" />
              </label>
              <label className="block">
                <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Bot tone</span>
                <select value={config.bot_tone || "Warm & literary"} onChange={(e) => setConfig({ ...config, bot_tone: e.target.value })} className="input-claude">
                  {BOT_TONES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <p className="text-[11.5px] text-stone mt-1.5">The AI adjusts its writing style to match this tone in Discord replies.</p>
              </label>
              <label className="block">
                <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Welcome message <span className="text-stone font-normal">(use {"{"}user{"}"} as placeholder)</span></span>
                <textarea value={config.welcome_message || ""} onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })} rows={3}
                  className="input-claude resize-none" placeholder="Welcome to the server, {user}!" />
              </label>
              <div className="flex justify-end pt-3 border-t border-border">
                <button onClick={() => saveMut.mutate(config)} disabled={saveMut.isPending}
                  className="h-10 px-4 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium hover:bg-[hsl(var(--brand-hover))] flex items-center gap-1.5 disabled:opacity-60">
                  <Icon name="save" size={13} strokeWidth={2} /> {saveMut.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}

          {tab === "discord" && (
            <div className="card-elevated p-7 space-y-5">
              <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium">Discord connection</div>

              <div className="bg-background border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${botStatus?.online ? "bg-green-500" : "bg-stone"}`} />
                  <div>
                    <div className="text-[13.5px] font-medium text-foreground">{botStatus?.username || "Bot status unknown"}</div>
                    {botStatus && <div className="text-[11.5px] text-stone">{botStatus.guilds} guilds · {botStatus.latency}ms latency</div>}
                    {!botStatus && <div className="text-[11.5px] text-stone">Run the bot and click "Test connection"</div>}
                  </div>
                </div>
                <button onClick={testBot} disabled={testingBot}
                  className="h-9 px-3.5 rounded-lg bg-card border border-border text-[13px] text-olive font-medium hover:bg-secondary flex items-center gap-1.5 disabled:opacity-60 transition-colors">
                  <Icon name="wifi" size={13} strokeWidth={1.8} /> {testingBot ? "Testing…" : "Test connection"}
                </button>
              </div>

              {/* Welcome Channel */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-dark-warm">Welcome channel ID</span>
                  <div className="flex gap-3">
                    <button onClick={() => { fetchChannels(); setActivePicker(activePicker === "welcome_channel_id" ? null : "welcome_channel_id"); }}
                      className="text-[10px] uppercase tracking-wider text-accent font-semibold hover:underline">
                      {fetchingChannels ? "Fetching…" : activePicker === "welcome_channel_id" ? "Close" : "Fetch list"}
                    </button>
                    <button onClick={() => createChannel("welcome_channel_id", "welcome")} disabled={creatingChannel === "welcome_channel_id"}
                      className="text-[10px] uppercase tracking-wider text-green-600 font-semibold hover:underline disabled:opacity-50">
                      {creatingChannel === "welcome_channel_id" ? "Creating…" : "Create new"}
                    </button>
                  </div>
                </div>
                <input value={config.welcome_channel_id || ""} onChange={(e) => setConfig({ ...config, welcome_channel_id: e.target.value })} className="input-claude font-mono" placeholder="Channel snowflake ID" />
                {activePicker === "welcome_channel_id" && (
                  <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto p-1 grid grid-cols-1 gap-0.5">
                    {channels.length === 0 && !fetchingChannels && <div className="p-3 text-[12px] text-stone text-center">No channels found. Ensure the bot is in a server.</div>}
                    {channels.map(c => (
                      <button key={c.id} onClick={() => selectChannel("welcome_channel_id", c.id)} className="flex items-center justify-between px-3 py-2 rounded text-[12px] hover:bg-secondary text-left group">
                        <span><span className="text-stone font-medium mr-1.5">{c.guildName}</span> <span className="font-mono text-foreground">#{c.name}</span></span>
                        <span className="text-[10px] text-stone group-hover:text-accent font-mono">{c.id}</span>
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[11.5px] text-stone mt-1.5">Or run /setup welcome:#channel in your Discord server.</p>
              </div>

              {/* Mod Log Channel */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-dark-warm">Mod log channel ID</span>
                  <div className="flex gap-3">
                    <button onClick={() => { fetchChannels(); setActivePicker(activePicker === "mod_log_channel_id" ? null : "mod_log_channel_id"); }}
                      className="text-[10px] uppercase tracking-wider text-accent font-semibold hover:underline">
                      {activePicker === "mod_log_channel_id" ? "Close" : "Fetch list"}
                    </button>
                    <button onClick={() => createChannel("mod_log_channel_id", "mod-logs")} disabled={creatingChannel === "mod_log_channel_id"}
                      className="text-[10px] uppercase tracking-wider text-green-600 font-semibold hover:underline disabled:opacity-50">
                      {creatingChannel === "mod_log_channel_id" ? "Creating…" : "Create new"}
                    </button>
                  </div>
                </div>
                <input value={config.mod_log_channel_id || ""} onChange={(e) => setConfig({ ...config, mod_log_channel_id: e.target.value })} className="input-claude font-mono" placeholder="Channel snowflake ID" />
                {activePicker === "mod_log_channel_id" && (
                  <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto p-1 grid grid-cols-1 gap-0.5">
                    {channels.map(c => (
                      <button key={c.id} onClick={() => selectChannel("mod_log_channel_id", c.id)} className="flex items-center justify-between px-3 py-2 rounded text-[12px] hover:bg-secondary text-left group">
                        <span><span className="text-stone font-medium mr-1.5">{c.guildName}</span> <span className="font-mono text-foreground">#{c.name}</span></span>
                        <span className="text-[10px] text-stone group-hover:text-accent font-mono">{c.id}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Q&A Channel */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-dark-warm">Q&A channel ID <span className="text-stone font-normal">(where /ask is allowed)</span></span>
                  <div className="flex gap-3">
                    <button onClick={() => { fetchChannels(); setActivePicker(activePicker === "rag_channel_id" ? null : "rag_channel_id"); }}
                      className="text-[10px] uppercase tracking-wider text-accent font-semibold hover:underline">
                      {activePicker === "rag_channel_id" ? "Close" : "Fetch list"}
                    </button>
                    <button onClick={() => createChannel("rag_channel_id", "space-qa")} disabled={creatingChannel === "rag_channel_id"}
                      className="text-[10px] uppercase tracking-wider text-green-600 font-semibold hover:underline disabled:opacity-50">
                      {creatingChannel === "rag_channel_id" ? "Creating…" : "Create new"}
                    </button>
                  </div>
                </div>
                <input value={config.rag_channel_id || ""} onChange={(e) => setConfig({ ...config, rag_channel_id: e.target.value })} className="input-claude font-mono" placeholder="Channel snowflake ID" />
                {activePicker === "rag_channel_id" && (
                  <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto p-1 grid grid-cols-1 gap-0.5">
                    {channels.map(c => (
                      <button key={c.id} onClick={() => selectChannel("rag_channel_id", c.id)} className="flex items-center justify-between px-3 py-2 rounded text-[12px] hover:bg-secondary text-left group">
                        <span><span className="text-stone font-medium mr-1.5">{c.guildName}</span> <span className="font-mono text-foreground">#{c.name}</span></span>
                        <span className="text-[10px] text-stone group-hover:text-accent font-mono">{c.id}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <button onClick={() => saveMut.mutate(config)} disabled={saveMut.isPending}
                  className="h-10 px-4 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium hover:bg-[hsl(var(--brand-hover))] flex items-center gap-1.5 disabled:opacity-60">
                  <Icon name="save" size={13} strokeWidth={2} /> {saveMut.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}

          {tab === "ai" && (
            <div className="card-elevated p-7 space-y-5">
              <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium">AI Intelligence</div>
              
              <div className="bg-secondary/50 border border-border rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-[13px] font-medium text-accent mb-1">
                  <Icon name="sparkle" size={14} /> Free RAG Implementation
                </div>
                <p className="text-[12px] text-olive leading-relaxed">
                  Your bot uses "Retrieval Augmented Generation" (RAG). It will first search your Knowledge Base for answers. If it finds nothing, it will use its general AI knowledge to help.
                </p>
              </div>

              <label className="block">
                <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">AI Provider</span>
                <select value={config.ai_provider || "OpenRouter"} onChange={(e) => setConfig({ ...config, ai_provider: e.target.value })} className="input-claude">
                  {AI_PROVIDERS.map(p => <option key={p}>{p}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">AI Base URL</span>
                <input value={config.ai_base_url || ""} onChange={(e) => setConfig({ ...config, ai_base_url: e.target.value })} 
                  className="input-claude font-mono" placeholder="https://openrouter.ai/api/v1" />
                <p className="text-[10px] text-stone mt-1">Default: https://openrouter.ai/api/v1</p>
              </label>

              <label className="block">
                <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Model ID</span>
                <input value={config.ai_model || ""} onChange={(e) => setConfig({ ...config, ai_model: e.target.value })} 
                  className="input-claude font-mono" placeholder="e.g. google/gemini-2.0-flash-lite-preview-02-05:free" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {FREE_MODELS.map(m => (
                    <button key={m} onClick={() => setConfig({ ...config, ai_model: m })}
                      className="px-2 py-1 rounded border border-border text-[10px] text-stone hover:border-accent hover:text-accent transition-colors">
                      {m.split("/")[1]?.split(":")[0] || m}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">API Key</span>
                <input type="password" value={config.ai_api_key || ""} onChange={(e) => setConfig({ ...config, ai_api_key: e.target.value })} 
                  className="input-claude font-mono" placeholder="sk-..." />
                <p className="text-[11.5px] text-stone mt-1.5">Get a free key from <a href="https://openrouter.ai/keys" target="_blank" className="text-accent underline">OpenRouter</a> or <a href="https://aistudio.google.com/" target="_blank" className="text-accent underline">Gemini AI Studio</a>.</p>
              </label>

              <div className="flex justify-end pt-3 border-t border-border">
                <button onClick={() => saveMut.mutate(config)} disabled={saveMut.isPending}
                  className="h-10 px-4 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium hover:bg-[hsl(var(--brand-hover))] flex items-center gap-1.5 disabled:opacity-60">
                  <Icon name="save" size={13} strokeWidth={2} /> {saveMut.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}

          {tab === "database" && (
            <div className="card-elevated p-7 space-y-4">
              <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium">Database status</div>
              <div className="bg-background border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <div>
                  <div className="text-[13.5px] font-medium text-foreground">Supabase connected</div>
                  <div className="text-[11.5px] text-stone font-mono">{import.meta.env.VITE_SUPABASE_URL || "URL not set"}</div>
                </div>
              </div>
              <div className="bg-secondary border border-border rounded-xl p-5">
                <div className="text-[12px] font-medium text-dark-warm mb-3">Configure Supabase</div>
                <ol className="text-[13px] text-olive space-y-1.5 list-decimal list-inside">
                  <li>Open your project: <a href="https://supabase.com" target="_blank" rel="noopener" className="text-accent hover:underline underline-offset-2">supabase.com</a></li>
                  <li>Go to Settings → API</li>
                  <li>Copy <span className="font-mono bg-background px-1 rounded">Project URL</span> → <span className="font-mono">VITE_SUPABASE_URL</span></li>
                  <li>Copy <span className="font-mono bg-background px-1 rounded">anon public</span> key → <span className="font-mono">VITE_SUPABASE_ANON_KEY</span></li>
                  <li>Run <span className="font-mono bg-background px-1 rounded">supabase_schema.sql</span> in SQL editor</li>
                </ol>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
