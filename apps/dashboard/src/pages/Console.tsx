import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { Terminal } from "@/components/console/Terminal";
import { useLogStream } from "@/hooks/useLogStream";
import { botService, BotAction, BotStatus } from "@/lib/services/bot";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
    { label: "Status", v: botStatus?.online ? "Online" : "Offline", icon: "wifi", color: botStatus?.online ? "text-green-600" : "text-destructive" },
    { label: "Uptime", v: botStatus ? formatUptime(botStatus.uptime) : "—", icon: "activity", color: "text-foreground" },
    { label: "Latency", v: botStatus ? `${botStatus.latency}ms` : "—", icon: "zap", color: "text-foreground" },
    { label: "Guilds", v: botStatus?.guilds?.toString() ?? "—", icon: "users", color: "text-foreground" },
    { label: "Today's Q&A", v: metrics?.dailyActivity.toString() ?? "—", icon: "message", color: "text-foreground" },
    { label: "Review Queue", v: metrics?.pendingReview.toString() ?? "—", icon: "warning", color: metrics?.pendingReview ? "text-accent" : "text-foreground" },
  ], [botStatus, metrics]);

  return (
    <main className="max-w-[1240px] mx-auto px-10 py-12 space-y-8">
      <PageHeader 
        category="System" 
        title="Bot Health"
        subtitle="Monitor instance performance, inspect runtime logs, and execute administrative actions."
      >
        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[13px] font-semibold transition-all ${
          isLive ? "bg-green-50 border-green-200 text-green-700 shadow-sm" : "bg-secondary border-border text-stone"
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-stone"}`} />
          {isLive ? "Live Stream Active" : "Attempting Handshake..."}
        </div>
      </PageHeader>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statusCards.map((card) => (
          <div key={card.label} className="card-elevated p-5 flex flex-col justify-between border-none shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Icon name={card.icon as any} size={13} className="text-stone" />
              <span className="text-[10px] uppercase tracking-widest text-stone font-bold">{card.label}</span>
            </div>
            <div className={`text-[22px] font-mono font-bold tracking-tight ${card.color}`}>
              {card.v}
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <Terminal 
          logs={logs} 
          onClear={clearLogs} 
          isBotOnline={!!botStatus?.online} 
        />

        <aside className="space-y-6">
          <div className="card-elevated p-6 space-y-5 shadow-sm border-none">
            <h3 className="text-[11px] uppercase tracking-widest text-stone font-bold">Quick Actions</h3>
            <div className="space-y-2">
              <ActionButton 
                icon="refresh" 
                label="Reload Commands" 
                loading={activeAction === "reload"}
                disabled={!botStatus?.online}
                onClick={() => handleAction("reload", "Reload")}
              />
              <ActionButton 
                icon="users" 
                label="Sync Members" 
                loading={activeAction === "sync_members"}
                disabled={!botStatus?.online}
                onClick={() => handleAction("sync_members", "Sync")}
              />
            </div>
            {!botStatus?.online && (
              <p className="text-[11px] text-stone italic text-center">
                Instance must be online to execute actions.
              </p>
            )}
          </div>

          <div className="card-elevated p-6 space-y-4 shadow-sm border-none">
            <h3 className="text-[11px] uppercase tracking-widest text-stone font-bold">Instance Identity</h3>
            <dl className="space-y-3">
              <DetailRow label="Username" value={botStatus?.username ?? "—"} />
              <DetailRow label="Queries" value={botStatus?.stats.queriesAnswered.toString() ?? "—"} />
              <DetailRow label="Processed" value={botStatus?.stats.messagesProcessed.toString() ?? "—"} />
              <DetailRow label="API" value={import.meta.env.VITE_BOT_API_URL ?? "localhost:3001"} />
            </dl>
          </div>

          <div className="card-elevated p-6 bg-foreground text-background shadow-lg border-none rounded-2xl">
            <h3 className="text-[11px] uppercase tracking-widest opacity-60 font-bold mb-4">CLI Reference</h3>
            <pre className="font-mono text-[11.5px] leading-relaxed">
              <span className="opacity-40"># Start services</span>
              <br />
              <span className="text-accent">npm run dev</span>
              <br /><br />
              <span className="opacity-40"># Build production</span>
              <br />
              <span className="text-accent">npm run build</span>
            </pre>
          </div>
        </aside>
      </section>
    </main>
  );
}

// -- Shared Subcomponents --------------------------------------------------

function ActionButton({ icon, label, loading, disabled, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className="flex items-center gap-3 w-full h-11 px-4 rounded-xl bg-background border border-border text-[13.5px] font-semibold hover:bg-secondary disabled:opacity-40 transition-all shadow-sm"
    >
      <Icon name={icon} size={15} className={loading ? "animate-spin" : "text-stone"} />
      {loading ? "Processing..." : label}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-[12px]">
      <dt className="text-stone font-medium">{label}</dt>
      <dd className="font-mono text-foreground font-bold truncate max-w-[150px]">{value}</dd>
    </div>
  );
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${seconds % 60}s`;
}
