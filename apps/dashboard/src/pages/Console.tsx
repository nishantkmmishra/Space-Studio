import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { supabase, botFetch, BOT_API_URL } from "@/lib/supabase";
import { toast } from "sonner";

interface BotStatus {
  online: boolean; uptime: number; guilds: number; latency: number; username: string | null;
  stats: { queriesAnswered: number; messagesProcessed: number };
}

interface LogEntry { ts: string; level: "info" | "warn" | "error"; msg: string; }

const levelColors: Record<string, string> = {
  info:  "text-warm-silver",
  warn:  "text-accent",
  error: "text-destructive",
};

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function Console() {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [logFilter, setLogFilter] = useState<"all" | "info" | "warn" | "error">("all");

  // Poll bot status every 5s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await botFetch("/status");
        if (res.ok) setStatus(await res.json());
        else setStatus(null);
      } catch {
        setStatus(null);
      }
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, []);

  // SSE log stream
  useEffect(() => {
    const secret = import.meta.env.VITE_BOT_API_SECRET;
    const url = `${BOT_API_URL}/events`;
    const headers: Record<string, string> = secret ? { Authorization: `Bearer ${secret}` } : {};
    // EventSource doesn't support headers, so we append it as query param if needed
    const fullUrl = secret ? `${url}?token=${encodeURIComponent(secret)}` : url;
    
    // Use EventSource (no headers) for local dev; fetch-based for production
    let es: EventSource;
    try {
      es = new EventSource(fullUrl);
      es.onopen = () => setSseConnected(true);
      es.onerror = () => setSseConnected(false);
      es.onmessage = (e) => {
        try {
          const entry = JSON.parse(e.data) as LogEntry;
          setLogs((prev) => [...prev.slice(-499), entry]);
        } catch {/* skip malformed */}
      };
    } catch {
      setSseConnected(false);
    }
    return () => es?.close();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const runAction = useCallback(async (action: string, label: string) => {
    setActionLoading(action);
    try {
      const res = await botFetch("/command", { method: "POST", body: JSON.stringify({ action }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      toast.success(data.message || `${label} complete`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Action failed";
      toast.error(`${label} failed`, { description: msg });
    } finally {
      setActionLoading(null);
    }
  }, []);

  // Recent chat stats from Supabase
  const { data: chatStats } = useQuery({
    queryKey: ["console-stats"],
    queryFn: async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase.from("chats")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());
      const { count: needsReview } = await supabase.from("chats")
        .select("*", { count: "exact", head: true })
        .eq("rating", "wrong");
      return { todayCount: todayCount || 0, needsReview: needsReview || 0 };
    },
    refetchInterval: 30_000,
  });

  const filteredLogs = logFilter === "all" ? logs : logs.filter((l) => l.level === logFilter);

  const statCards = [
    { label: "Status",         value: status?.online ? "Online" : "Offline",     icon: "wifi" as const,     accent: status?.online },
    { label: "Uptime",         value: status ? formatUptime(status.uptime) : "—", icon: "activity" as const, accent: false },
    { label: "Latency",        value: status ? `${status.latency}ms` : "—",       icon: "zap" as const,      accent: false },
    { label: "Guilds",         value: status?.guilds?.toString() ?? "—",           icon: "users" as const,    accent: false },
    { label: "Q&A today",      value: chatStats?.todayCount.toString() ?? "—",     icon: "message" as const,  accent: false },
    { label: "Needs review",   value: chatStats?.needsReview.toString() ?? "—",    icon: "warning" as const,  accent: false },
  ];

  const quickActions = [
    { action: "reload",       label: "Reload commands",  icon: "refresh" as const },
    { action: "sync_members", label: "Sync members",     icon: "users" as const },
  ];

  return (
    <div className="px-10 py-10 max-w-[1240px] mx-auto">
      <PageHeader eyebrow="Bot Console" title="Control room."
        subtitle="Watch the bot run. Tail live logs, trigger commands, and check health.">
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[12.5px] font-medium ${
          sseConnected ? "bg-green-50 border-green-200 text-green-700" : "bg-secondary border-border text-stone"
        }`}>
          <span className={`w-2 h-2 rounded-full ${sseConnected ? "bg-green-500 animate-pulse" : "bg-stone"}`} />
          {sseConnected ? "Live" : "Connecting…"}
        </div>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-6 gap-3 mb-7">
        {statCards.map((s) => (
          <div key={s.label} className="card-elevated p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name={s.icon} size={12} className="text-stone" />
              <div className="text-[10px] uppercase tracking-wider text-stone font-medium">{s.label}</div>
            </div>
            <div className={`font-mono text-[20px] font-semibold ${s.accent === true ? "text-green-600" : s.accent === false && s.label === "Status" ? "text-destructive" : "text-foreground"}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-5">
        {/* Live log stream */}
        <div className="card-elevated overflow-hidden flex flex-col" style={{ height: "560px" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-foreground/5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-destructive/70" />
                <span className="w-3 h-3 rounded-full bg-accent/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-[11.5px] font-mono text-stone ml-2">bot logs</span>
            </div>
            <div className="flex items-center gap-2">
              {(["all", "info", "warn", "error"] as const).map((f) => (
                <button key={f} onClick={() => setLogFilter(f)}
                  className={`px-2.5 py-1 rounded text-[10.5px] font-mono transition-colors ${logFilter === f ? "bg-foreground/10 text-foreground font-semibold" : "text-stone hover:text-foreground"}`}>
                  {f}
                </button>
              ))}
              <button onClick={() => setLogs([])} className="px-2.5 py-1 rounded text-[10.5px] text-stone hover:text-foreground transition-colors font-mono">clear</button>
              <button onClick={() => setAutoScroll((p) => !p)}
                className={`px-2.5 py-1 rounded text-[10.5px] font-mono transition-colors ${autoScroll ? "text-accent" : "text-stone"}`}>
                {autoScroll ? "↓ auto" : "⏸ paused"}
              </button>
            </div>
          </div>

          <div ref={logContainerRef} onScroll={(e) => {
            const el = e.currentTarget;
            const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
            setAutoScroll(atBottom);
          }} className="flex-1 overflow-y-auto bg-[hsl(60_3%_8%)] p-3 font-mono-warm text-[12px] leading-[1.6]">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-stone/50">
                <Icon name="terminal" size={24} strokeWidth={1.2} className="mb-3" />
                <p>{status ? "Waiting for log events…" : "Bot is not running. Start it with npm run dev."}</p>
              </div>
            ) : (
              filteredLogs.map((entry, i) => (
                <div key={i} className="flex gap-3 group hover:bg-white/3 rounded px-1">
                  <span className="text-stone/50 shrink-0 select-none">{new Date(entry.ts).toLocaleTimeString([], { hour12: false })}</span>
                  <span className={`shrink-0 w-[38px] ${levelColors[entry.level] || "text-warm-silver"}`}>[{entry.level}]</span>
                  <span className="text-warm-silver break-all">{entry.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: actions + connection info */}
        <div className="flex flex-col gap-4">
          <div className="card-elevated p-5">
            <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium mb-4">Quick actions</div>
            <div className="flex flex-col gap-2">
              {quickActions.map(({ action, label, icon }) => (
                <button key={action} onClick={() => runAction(action, label)} disabled={actionLoading !== null || !status?.online}
                  className="flex items-center gap-2.5 w-full h-10 px-3.5 rounded-lg bg-card border border-border text-[13px] text-foreground font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <Icon name={icon} size={14} strokeWidth={1.8} className={actionLoading === action ? "animate-spin" : "text-stone"} />
                  {actionLoading === action ? "Running…" : label}
                </button>
              ))}
            </div>
            {!status?.online && (
              <p className="text-[11.5px] text-stone mt-3">Start the bot to enable actions.</p>
            )}
          </div>

          <div className="card-elevated p-5">
            <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium mb-4">Bot details</div>
            <div className="space-y-2.5">
              {[
                { k: "Username",   v: status?.username || "—" },
                { k: "API URL",    v: BOT_API_URL },
                { k: "Guilds",     v: status?.guilds?.toString() ?? "—" },
                { k: "Queries",    v: status?.stats?.queriesAnswered?.toString() ?? "—" },
                { k: "Messages",   v: status?.stats?.messagesProcessed?.toString() ?? "—" },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-[11.5px] text-stone">{k}</span>
                  <span className="text-[11.5px] font-mono text-foreground truncate max-w-[140px]">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated p-5">
            <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium mb-3">How to start</div>
            <div className="bg-foreground text-background rounded-lg p-3 font-mono text-[11px] leading-relaxed">
              <p className="text-warm-silver"># From project root:</p>
              <p className="text-accent mt-1">npm run dev</p>
              <p className="text-warm-silver mt-2"># Bot → :3001</p>
              <p className="text-warm-silver"># Dashboard → :5173</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
