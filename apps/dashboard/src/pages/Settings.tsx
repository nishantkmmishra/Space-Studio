import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { settingsService, GuildConfig, DiscordChannel } from "@/lib/services/settings";
import { toast } from "sonner";

type SettingTab = "general" | "discord" | "ai" | "database";

const TONES = ["Warm & literary", "Precise & professional", "Casual & friendly", "Concise & direct"];
const PROVIDERS = ["OpenRouter", "OpenAI", "Groq", "HuggingFace"];
const MODELS = [
  { id: "google/gemini-2.0-flash-lite-preview-02-05:free", label: "Gemini 2.0 Flash" },
  { id: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B" },
  { id: "huggingfaceh4/zephyr-7b-beta:free", label: "Zephyr 7B" }
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingTab>("general");
  const [config, setConfig] = useState<Partial<GuildConfig>>({});
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [activePicker, setActivePicker] = useState<string | null>(null);

  // -- Initialization --------------------------------------------------------

  const { isLoading } = useQuery({
    queryKey: ["guild-config"],
    queryFn: async () => {
      const data = await settingsService.getConfig();
      if (data) setConfig(data);
      return data;
    },
  });

  // -- Mutations -------------------------------------------------------------

  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: (updates: Partial<GuildConfig>) => settingsService.saveConfig(updates),
    onSuccess: () => toast.success("Configuration synchronized"),
    onError: (error) => toast.error("Save failed", { description: error.message }),
  });

  const { mutate: fetchChannels, isPending: isFetchingChannels } = useMutation({
    mutationFn: () => settingsService.fetchChannels(),
    onSuccess: (data) => setChannels(data),
    onError: (error) => toast.error("Channel sync failed", { description: error.message }),
  });

  const { mutate: createChannel, isPending: isCreatingChannel } = useMutation({
    mutationFn: (name: string) => settingsService.createChannel(name),
    onSuccess: (id, name) => {
      toast.success(`Channel #${name} initialized`);
      setChannels([]); // Force refresh
    },
    onError: (error) => toast.error("Channel creation failed", { description: error.message }),
  });

  // -- Derived State ---------------------------------------------------------

  const tabs = useMemo(() => [
    { id: "general", label: "General", icon: "settings" },
    { id: "discord", label: "Discord", icon: "discord" },
    { id: "ai", label: "Intelligence", icon: "sparkle" },
    { id: "database", label: "Database", icon: "database" },
  ], []);

  // -- Render Helpers --------------------------------------------------------

  if (isLoading) {
    return (
      <div className="max-w-[820px] mx-auto px-10 py-20 text-center flex flex-col items-center gap-4">
        <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full" />
        <p className="text-stone text-[14px]">Fetching configuration...</p>
      </div>
    );
  }

  return (
    <main className="max-w-[820px] mx-auto px-10 py-12 space-y-10">
      <PageHeader 
        category="Infrastructure" 
        title="Settings"
        subtitle="Configure the behavior, intelligence providers, and core integrations of your bot instance."
      />

      <nav className="flex gap-2">
        {tabs.map((t) => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as SettingTab)}
            className={`h-11 px-5 rounded-2xl text-[13px] font-bold border transition-all flex items-center gap-3 shadow-sm ${
              activeTab === t.id 
                ? "bg-foreground text-background border-foreground" 
                : "bg-card text-stone border-border hover:border-accent/40 hover:text-accent"
            }`}
          >
            <Icon name={t.icon as any} size={14} />
            {t.label}
          </button>
        ))}
      </nav>

      <div className="space-y-8 animate-fade-in">
        {activeTab === "general" && (
          <section className="card-elevated p-8 border-none shadow-sm space-y-8">
            <h3 className="text-[11px] uppercase tracking-widest text-stone font-bold">General Parameters</h3>
            <div className="space-y-6">
              <FormField label="Environment Name">
                <input 
                  value={config.workspace_name || ""} 
                  onChange={(e) => setConfig({ ...config, workspace_name: e.target.value })} 
                  className="input-claude h-11" 
                  placeholder="e.g., Space Alpha" 
                />
              </FormField>

              <FormField label="Bot Personality" description="The linguistic style of generated responses.">
                <select 
                  value={config.bot_tone || TONES[0]} 
                  onChange={(e) => setConfig({ ...config, bot_tone: e.target.value })} 
                  className="input-claude h-11 font-semibold"
                >
                  {TONES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </FormField>

              <FormField label="Protocol: Welcome Message" description="Markdown supported. Use {user} for dynamic targeting.">
                <textarea 
                  value={config.welcome_message || ""} 
                  onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })} 
                  rows={4} 
                  className="input-claude resize-none p-4" 
                  placeholder="Welcome to the ecosystem, {user}..." 
                />
              </FormField>
            </div>
            <footer className="flex justify-end pt-6 border-t border-border">
              <SaveButton onClick={() => saveSettings(config)} loading={isSaving} />
            </footer>
          </section>
        )}

        {activeTab === "discord" && (
          <section className="card-elevated p-8 border-none shadow-sm space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] uppercase tracking-widest text-stone font-bold">Discord Integration</h3>
              <button 
                onClick={() => settingsService.testBotConnection().then(d => toast.success("Bot Online", { description: `${d.username} is connected.` }))}
                className="text-[11px] text-accent font-bold hover:underline"
              >
                Test Connectivity
              </button>
            </div>

            <div className="space-y-8">
              <ChannelPicker 
                label="Welcome Channel" 
                description="Where new members are announced."
                value={config.welcome_channel_id}
                channels={channels}
                onSync={fetchChannels}
                onSelect={(id) => setConfig({ ...config, welcome_channel_id: id })}
                onCreate={() => createChannel("welcome")}
                isSyncing={isFetchingChannels}
              />

              <ChannelPicker 
                label="Logging Channel" 
                description="Where moderation events are recorded."
                value={config.mod_log_channel_id}
                channels={channels}
                onSync={fetchChannels}
                onSelect={(id) => setConfig({ ...config, mod_log_channel_id: id })}
                onCreate={() => createChannel("mod-logs")}
                isSyncing={isFetchingChannels}
              />

              <ChannelPicker 
                label="Command Channel" 
                description="Authorized channel for bot interactions."
                value={config.rag_channel_id}
                channels={channels}
                onSync={fetchChannels}
                onSelect={(id) => setConfig({ ...config, rag_channel_id: id })}
                onCreate={() => createChannel("space-qa")}
                isSyncing={isFetchingChannels}
              />
            </div>
            <footer className="flex justify-end pt-6 border-t border-border">
              <SaveButton onClick={() => saveSettings(config)} loading={isSaving} />
            </footer>
          </section>
        )}

        {activeTab === "ai" && (
          <section className="card-elevated p-8 border-none shadow-sm space-y-8">
            <div className="bg-accent/5 border border-accent/10 rounded-2xl p-6 flex gap-4">
              <Icon name="sparkle" size={20} className="text-accent shrink-0" />
              <div>
                <h4 className="text-[14px] font-bold text-foreground">Advanced RAG Infrastructure</h4>
                <p className="text-[12.5px] text-stone font-medium leading-relaxed mt-1">
                  Your instance uses Retrieval Augmented Generation to synthesize answers from the Knowledge Base. This reduces hallucinations and ensures contextual accuracy.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <FormField label="Intelligence Provider">
                <select 
                  value={config.ai_provider || "OpenRouter"} 
                  onChange={(e) => setConfig({ ...config, ai_provider: e.target.value })} 
                  className="input-claude h-11 font-semibold"
                >
                  {PROVIDERS.map(p => <option key={p}>{p}</option>)}
                </select>
              </FormField>

              <FormField label="Endpoint URL">
                <input 
                  value={config.ai_base_url || ""} 
                  onChange={(e) => setConfig({ ...config, ai_base_url: e.target.value })} 
                  className="input-claude h-11 font-mono text-[13px]" 
                  placeholder="https://openrouter.ai/api/v1" 
                />
              </FormField>

              <FormField label="AI Model">
                <input 
                  value={config.ai_model || ""} 
                  onChange={(e) => setConfig({ ...config, ai_model: e.target.value })} 
                  className="input-claude h-11 font-mono text-[13px]" 
                />
                <div className="flex gap-2 mt-3">
                  {MODELS.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => setConfig({ ...config, ai_model: m.id })}
                      className="px-3 py-1.5 rounded-lg border border-border text-[10.5px] font-bold text-stone hover:border-accent hover:text-accent transition-all"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="Authorization Key">
                <input 
                  type="password"
                  value={config.ai_api_key || ""} 
                  onChange={(e) => setConfig({ ...config, ai_api_key: e.target.value })} 
                  className="input-claude h-11 font-mono" 
                  placeholder="sk-••••••••••••••••" 
                />
              </FormField>
            </div>
            <footer className="flex justify-end pt-6 border-t border-border">
              <SaveButton onClick={() => saveSettings(config)} loading={isSaving} />
            </footer>
          </section>
        )}

        {activeTab === "database" && (
          <section className="card-elevated p-8 border-none shadow-sm space-y-8">
            <header className="flex items-center justify-between">
              <h3 className="text-[11px] uppercase tracking-widest text-stone font-bold">Persistence Layer</h3>
              <span className="flex items-center gap-2 text-[11px] text-green-600 font-bold">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Synchronized
              </span>
            </header>

            <div className="space-y-6">
              <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50">
                <h4 className="text-[10px] uppercase tracking-widest text-stone font-bold mb-2">Endpoint Identity</h4>
                <p className="font-mono text-[13px] text-foreground truncate">{import.meta.env.VITE_SUPABASE_URL}</p>
              </div>

              <div className="bg-foreground text-background rounded-2xl p-8 space-y-4">
                <h4 className="text-[13px] font-bold">Architecture Setup</h4>
                <ol className="text-[12.5px] space-y-3 list-decimal list-inside opacity-80 font-medium">
                  <li>Configure Project URL & ANON KEY in local environment.</li>
                  <li>Execute <code className="bg-background/10 px-1.5 py-0.5 rounded text-accent">supabase_schema.sql</code> in SQL Editor.</li>
                  <li>Ensure RLS policies are enabled for public read access.</li>
                </ol>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

// -- Shared UI Subcomponents -----------------------------------------------

function FormField({ label, description, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-bold text-dark-warm ml-1 uppercase tracking-wider">{label}</label>
      {description && <p className="text-[11px] text-stone font-medium ml-1 mb-2">{description}</p>}
      {children}
    </div>
  );
}

function SaveButton({ onClick, loading }: any) {
  return (
    <button 
      onClick={onClick} 
      disabled={loading}
      className="h-11 px-10 rounded-xl bg-accent text-accent-foreground text-[13px] font-bold hover:bg-[hsl(var(--brand-hover))] flex items-center gap-2.5 transition-all shadow-sm disabled:opacity-50"
    >
      {loading ? (
        <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <Icon name="save" size={14} strokeWidth={2.5} />
      )}
      {loading ? "Persisting..." : "Save Settings"}
    </button>
  );
}

function ChannelPicker({ label, description, value, channels, onSync, onSelect, onCreate, isSyncing }: any) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between ml-1">
        <label className="text-[12px] font-bold text-dark-warm uppercase tracking-wider">{label}</label>
        <div className="flex gap-4">
          <button onClick={() => { onSync(); setIsOpen(!isOpen); }} className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
            {isSyncing ? "Syncing..." : isOpen ? "Close" : "Fetch"}
          </button>
          <button onClick={onCreate} className="text-[10px] font-bold text-green-600 uppercase tracking-widest hover:underline">
            Auto-Create
          </button>
        </div>
      </div>
      <p className="text-[11px] text-stone font-medium ml-1 mb-1">{description}</p>
      <input 
        value={value || ""} 
        onChange={(e) => onSelect(e.target.value)}
        className="input-claude h-11 font-mono text-[13px]" 
        placeholder="Discord Snowflake ID" 
      />
      
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-card border border-border rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 animate-slide-up">
          {channels.length === 0 && !isSyncing && (
            <div className="p-8 text-center text-[12px] text-stone font-medium">
              No active channels detected. Ensure the bot is connected to a guild.
            </div>
          )}
          <div className="grid gap-1">
            {channels.map((c: any) => (
              <button 
                key={c.id} 
                onClick={() => { onSelect(c.id); setIsOpen(false); }}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-secondary text-left transition-colors group"
              >
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-stone block mb-0.5">{c.guildName}</span>
                  <span className="font-mono text-[13px] text-foreground font-bold">#{c.name}</span>
                </div>
                <span className="text-[11px] font-mono text-stone group-hover:text-accent font-bold">{c.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
