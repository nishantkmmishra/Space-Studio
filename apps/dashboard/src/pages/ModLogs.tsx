import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { modLogService, ModLogEntry, ModAction } from "@/lib/services/modlogs";
import { toast } from "sonner";

const ACTIONS: (ModAction | "All")[] = ["All", "BAN", "WARN", "KICK", "MUTE"];

const LOG_STYLES: Record<string, { color: string; icon: any }> = {
  BAN: { color: "bg-destructive/5 text-destructive border-destructive/10", icon: "ban" },
  WARN: { color: "bg-accent/5 text-accent border-accent/10", icon: "warning" },
  KICK: { color: "bg-foreground/5 text-foreground border-foreground/10", icon: "kick" },
  MUTE: { color: "bg-secondary text-stone border-border", icon: "mute" },
};

export default function ModLogs() {
  const [activeFilter, setActiveFilter] = useState<ModAction | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => modLogService.getAll(),
  });

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesAction = activeFilter === "All" || l.action === activeFilter;
      const content = `${l.target_tag} ${l.moderator_tag} ${l.reason}`.toLowerCase();
      const matchesSearch = content.includes(searchTerm.toLowerCase());
      return matchesAction && matchesSearch;
    });
  }, [logs, activeFilter, searchTerm]);

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast.error("No records to export");
      return;
    }
    modLogService.exportToCSV(filteredLogs);
    toast.success("Audit trail exported successfully");
  };

  return (
    <main className="max-w-[1240px] mx-auto px-10 py-12 space-y-10">
      <PageHeader 
        category="Moderation" 
        title="Logs"
        subtitle="Review the history of administrative interventions and moderation events."
      >
        <button 
          onClick={handleExport}
          className="h-10 px-5 rounded-xl bg-card border border-border text-[13px] font-bold text-olive hover:bg-secondary flex items-center gap-2.5 transition-all shadow-sm"
        >
          <Icon name="download" size={14} strokeWidth={2.5} /> 
          Export Dataset
        </button>
      </PageHeader>

      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {ACTIONS.map((action) => (
            <button 
              key={action} 
              onClick={() => setActiveFilter(action)}
              className={`px-4 py-2 rounded-xl text-[12.5px] font-bold border transition-all whitespace-nowrap ${
                activeFilter === action 
                  ? "bg-foreground text-background border-foreground shadow-sm" 
                  : "bg-card text-stone border-border hover:border-accent/40 hover:text-accent"
              }`}
            >
              {action}
            </button>
          ))}
        </div>

        <div className="relative group">
          <Icon 
            name="search" 
            size={14} 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone group-focus-within:text-accent transition-colors" 
          />
          <input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search by tag, ID, or reason..."
            className="input-claude pl-10 w-full md:w-[320px] h-10 shadow-none" 
          />
        </div>
      </section>

      {isLoading ? (
        <div className="card-elevated p-20 text-center flex flex-col items-center gap-4">
          <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full" />
          <p className="text-stone text-[14px]">Accessing audit logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState 
          icon="shield" 
          title={logs.length === 0 ? "The ledger is pristine" : "No entries matched"}
          description={logs.length === 0 
            ? "Administrative actions taken in Discord will appear here automatically." 
            : "Refine your search or filter to locate specific events."} 
        />
      ) : (
        <div className="card-elevated overflow-hidden border-none shadow-sm">
          <header className="grid grid-cols-[120px_1fr_1fr_1fr_180px] px-6 py-4 bg-secondary/30 border-b border-border text-[11px] uppercase tracking-widest text-stone font-bold">
            <div>Action</div>
            <div>Target</div>
            <div>Moderator</div>
            <div>Justification</div>
            <div className="text-right">Timestamp</div>
          </header>

          <div className="divide-y divide-border/50">
            {filteredLogs.map((log) => (
              <article key={log.id} className="grid grid-cols-[120px_1fr_1fr_1fr_180px] items-center px-6 py-4 hover:bg-secondary/20 transition-colors">
                <div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold tracking-tight border flex items-center gap-1.5 w-fit ${LOG_STYLES[log.action]?.color}`}>
                    <Icon name={LOG_STYLES[log.action]?.icon || "shield"} size={11} strokeWidth={3} />
                    {log.action}
                  </span>
                </div>

                <div className="min-w-0 pr-4">
                  <div className="text-[13.5px] font-mono text-foreground font-bold truncate">
                    {log.target_tag || log.target_id}
                  </div>
                </div>

                <div className="min-w-0 pr-4">
                  <div className="text-[13px] text-olive font-semibold truncate">
                    {log.moderator_tag || log.moderator_id}
                  </div>
                </div>

                <div className="min-w-0 pr-6">
                  <div className="text-[13px] text-stone font-medium truncate">
                    {log.reason || "No formal justification recorded"}
                  </div>
                  {log.duration && (
                    <div className="text-[10px] text-accent font-bold mt-0.5">
                      Span: {log.duration}
                    </div>
                  )}
                </div>

                <div className="text-[12px] text-stone font-medium text-right tabular-nums">
                  {new Date(log.created_at).toLocaleString(undefined, { 
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
