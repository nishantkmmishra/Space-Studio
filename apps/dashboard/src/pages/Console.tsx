import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { Terminal } from "@/components/console/Terminal";
import { useLogStream } from "@/hooks/useLogStream";
import { botService, BotAction, BotStatus } from "@/lib/services/bot";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Console() {
  const { logs, isConnected: isLive, clearLogs } = useLogStream();
  const [activeAction, setActiveAction] = useState<BotAction | null>(null);
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);

  // -- Bot Status Polling ---------------------------------------------------
  
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await botService.getStatus();
      setBotStatus(status);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // -- Infrastructure Stats -------------------------------------------------

  const { data: metrics } = useQuery({
    queryKey: ["console-metrics"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [chatsToday, flaggedChats] = await Promise.all([
        supabase.from("chats").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("chats").select("id", { count: "exact", head: true }).eq("rating", "wrong")
      ]);

      return {
        dailyActivity: chatsToday.count || 0,
        pendingReview: flaggedChats.count || 0
      };
    },
    refetchInterval: 30000,
  });

  // -- Handlers --------------------------------------------------------------

  const handleAction = async (action: BotAction, label: string) => {
    setActiveAction(action);
    try {
      const { message } = await botService.executeAction(action);
      toast.success(message);
    } catch (error) {
      toast.error(`${label} failed`, { description: (error as Error).message });
    } finally {
      setActiveAction(null);
    }
  };

  // -- Derived UI State -----------------------------------------------------

  const statusCards = useMemo(() => [
    { label: "Bot Instance", v: botStatus?.online ? "Online" : "Offline", icon: "bot", color: botStatus?.online ? "text-primary" : "text-destructive" },
    { label: "API Latency", v: botStatus ? `${botStatus.latency}ms` : "—", icon: "zap", color: "text-foreground" },
    { label: "Active Guilds", v: botStatus?.guilds?.toString() ?? "—", icon: "users", color: "text-foreground" },
    { label: "Daily Queries", v: metrics?.dailyActivity.toString() ?? "—", icon: "message", color: "text-foreground" },
  ], [botStatus, metrics]);

  return (
    <main className="space-y-10 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card) => (
          <div key={card.label} className="bg-card border border-border p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:shadow-lg group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-stone group-hover:text-primary transition-colors">
                <Icon name={card.icon as any} size={20} />
              </div>
              <Icon name="chevronRight" size={14} className="text-stone opacity-0 group-hover:opacity-40 transition-all -translate-x-2 group-hover:translate-x-0" />
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-stone font-black opacity-60 mb-1">{card.label}</div>
            <div className={`text-2xl font-black tracking-tighter ${card.color}`}>
              {card.v}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-6">
          <Terminal 
            logs={logs} 
            onClear={clearLogs} 
            isBotOnline={!!botStatus?.online} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-black uppercase tracking-widest text-stone">System Control</h3>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
              </div>
              <div className="space-y-4">
                <FeatureToggle label="Auto Moderation" description="Automated spam & toxicity filtering" enabled={true} />
                <FeatureToggle label="AI Conversations" description="RAG-powered intelligent responses" enabled={true} />
                <FeatureToggle label="Event Logging" description="Sync moderation events to database" enabled={false} />
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
              <h3 className="text-[13px] font-black uppercase tracking-widest text-stone">Administrative</h3>
              <div className="space-y-3">
                <ActionButton 
                  icon="refresh" 
                  label="Refresh Slash Commands" 
                  loading={activeAction === "reload"}
                  disabled={!botStatus?.online}
                  onClick={() => handleAction("reload", "Reload")}
                />
                <ActionButton 
                  icon="users" 
                  label="Sync Member Directory" 
                  loading={activeAction === "sync_members"}
                  disabled={!botStatus?.online}
                  onClick={() => handleAction("sync_members", "Sync")}
                />
              </div>
              {!botStatus?.online && (
                <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-center">
                  <p className="text-[11px] text-destructive font-bold uppercase tracking-widest">Bot Offline</p>
                  <p className="text-[11px] text-stone mt-1">Actions disabled until instance returns online.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
            <h3 className="text-[13px] font-black uppercase tracking-widest text-stone">Monitor Hub</h3>
            <div className="space-y-5">
              <DetailRow label="Bot Tag" value={botStatus?.username ?? "Space#0000"} />
              <DetailRow label="API Status" value={botStatus?.online ? "Operational" : "Offline"} />
              <DetailRow label="Uptime" value={botStatus ? formatUptime(botStatus.uptime) : "0h 0m"} />
              <DetailRow label="Processed" value={botStatus?.stats.messagesProcessed.toLocaleString() ?? "0"} />
              <DetailRow label="Answers" value={botStatus?.stats.queriesAnswered.toLocaleString() ?? "0"} />
            </div>
            
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-stone">Network Load</span>
                <span className="text-[11px] font-mono font-black text-primary">Normal</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-[40%] bg-primary rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-foreground text-background rounded-3xl p-8 shadow-2xl shadow-primary/10 relative overflow-hidden group">
            <Icon name="terminal" size={120} className="absolute -right-10 -bottom-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <h3 className="text-[13px] font-black uppercase tracking-widest opacity-40 mb-6">Runtime Config</h3>
            <div className="space-y-4 relative z-10">
              <code className="block font-mono text-[11px] leading-relaxed">
                <span className="opacity-40">// Bot Instance</span>
                <br />
                <span className="text-primary-foreground/60">ID:</span> {import.meta.env.VITE_BOT_API_URL?.split('/')[2] || "localhost"}
                <br />
                <span className="text-primary-foreground/60">NODE_ENV:</span> development
                <br />
                <span className="text-primary-foreground/60">REGION:</span> local-01
              </code>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

// -- Shared Subcomponents --------------------------------------------------

function FeatureToggle({ label, description, enabled }: { label: string; description: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between group">
      <div>
        <div className="text-[13px] font-bold text-foreground">{label}</div>
        <div className="text-[11px] text-stone font-medium">{description}</div>
      </div>
      <button className={`w-10 h-6 rounded-full transition-all flex items-center px-1 ${enabled ? "bg-primary" : "bg-secondary border border-border"}`}>
        <div className={`w-4 h-4 rounded-full shadow-sm transition-all ${enabled ? "translate-x-4 bg-primary-foreground" : "translate-x-0 bg-stone"}`} />
      </button>
    </div>
  );
}

function ActionButton({ icon, label, loading, disabled, onClick }: any) {
  return (
    <Button 
      onClick={onClick} 
      disabled={disabled || loading}
      variant="outline"
      className="w-full h-12 justify-start rounded-2xl font-bold text-[13px] hover:bg-secondary border-border/60"
    >
      <Icon name={icon} size={16} className={loading ? "animate-spin mr-3" : "text-stone mr-3"} />
      {loading ? "Synchronizing..." : label}
    </Button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-[12.5px]">
      <dt className="text-stone font-bold uppercase tracking-wider text-[10px] opacity-60">{label}</dt>
      <dd className="font-black text-foreground">{value}</dd>
    </div>
  );
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${seconds % 60}s`;
}
