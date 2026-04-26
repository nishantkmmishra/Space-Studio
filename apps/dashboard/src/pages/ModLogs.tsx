import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ModLog {
  id: string; action: string; target_id: string; target_tag: string; moderator_id: string;
  moderator_tag: string; reason: string; duration: string; guild_id: string; created_at: string;
}

const actionColors: Record<string, string> = {
  BAN: "bg-destructive/10 text-destructive",
  WARN: "bg-accent/10 text-accent",
  KICK: "bg-foreground/8 text-foreground",
  MUTE: "bg-secondary text-olive",
};

const actionIcons: Record<string, string> = {
  BAN: "ban",
  WARN: "warning",
  KICK: "kick",
  MUTE: "mute",
};

export default function ModLogs() {
  const [actionFilter, setActionFilter] = useState("All");
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["mod_logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mod_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data as ModLog[];
    },
  });

  const filtered = useMemo(() =>
    logs.filter((l) =>
      (actionFilter === "All" || l.action === actionFilter) &&
      `${l.target_tag} ${l.moderator_tag} ${l.reason}`.toLowerCase().includes(search.toLowerCase())
    ), [logs, search, actionFilter]);

  const exportCSV = () => {
    const header = "Time,Action,Target,Moderator,Reason,Duration";
    const rows = filtered.map((l) =>
      [new Date(l.created_at).toISOString(), l.action, l.target_tag, l.moderator_tag, l.reason, l.duration || ""].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mod-logs.csv";
    a.click();
    toast.success("Exported CSV");
  };

  return (
    <div className="px-10 py-10 max-w-[1240px] mx-auto">
      <PageHeader eyebrow="Moderation" title="The ledger."
        subtitle="Every ban, kick, warn, and mute is recorded here. Filter, search, and export.">
        <button onClick={exportCSV} className="h-9 px-3.5 rounded-lg bg-card border border-border text-[13px] text-olive font-medium hover:bg-secondary flex items-center gap-1.5 transition-colors">
          <Icon name="download" size={13} strokeWidth={1.8} /> Export CSV
        </button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1.5">
          {["All", "BAN", "WARN", "KICK", "MUTE"].map((a) => (
            <button key={a} onClick={() => setActionFilter(a)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${actionFilter === a ? "bg-foreground text-background border-foreground" : "bg-card text-olive border-border hover:border-accent hover:text-accent"}`}>{a}</button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Icon name="search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs…" className="input-claude pl-9 w-[240px] h-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="card-elevated p-10 text-center text-stone text-[14px] animate-pulse">Loading logs…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="shield" title={logs.length === 0 ? "The ledger is clean." : "Nothing matches."}
          description={logs.length === 0 ? "When moderators take action in Discord, it shows up here." : "Try a different keyword or action filter."} />
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="grid grid-cols-[100px_1fr_1fr_1fr_180px] gap-0 px-5 py-3 border-b border-border bg-background/60 text-[10.5px] uppercase tracking-wider text-stone font-medium">
            <div>Action</div><div>Target</div><div>Moderator</div><div>Reason</div><div>Time</div>
          </div>
          {filtered.map((l, i) => (
            <div key={l.id} className={`row-hover grid grid-cols-[100px_1fr_1fr_1fr_180px] items-center px-5 py-3.5 ${i < filtered.length - 1 ? "border-b border-border" : ""}`}>
              <div>
                <span className={`badge-warm ${actionColors[l.action] || "bg-secondary text-olive"} flex items-center gap-1 w-fit`}>
                  <Icon name={actionIcons[l.action] as Parameters<typeof Icon>[0]["name"] || "shield"} size={10} strokeWidth={2} />
                  {l.action}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-mono text-foreground truncate">{l.target_tag || l.target_id}</div>
              </div>
              <div className="min-w-0">
                <div className="text-[13px] text-olive truncate">{l.moderator_tag || l.moderator_id}</div>
              </div>
              <div className="min-w-0 pr-4">
                <div className="text-[13px] text-stone truncate">{l.reason || "No reason provided"}</div>
                {l.duration && <div className="text-[11px] text-stone mt-0.5">Duration: {l.duration}</div>}
              </div>
              <div className="text-[12px] text-stone">{new Date(l.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
