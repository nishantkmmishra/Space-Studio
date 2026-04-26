import { supabase } from "../supabase";

export type ModAction = "BAN" | "WARN" | "KICK" | "MUTE";

export interface ModLogEntry {
  id: string;
  action: ModAction;
  target_id: string;
  target_tag: string;
  moderator_id: string;
  moderator_tag: string;
  reason: string;
  duration: string;
  guild_id: string;
  created_at: string;
}

export const modLogService = {
  async getAll(limit = 200): Promise<ModLogEntry[]> {
    const { data, error } = await supabase
      .from("mod_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ModLogEntry[];
  },

  exportToCSV(logs: ModLogEntry[]): void {
    const header = "Timestamp,Action,Target,Moderator,Reason,Duration";
    const rows = logs.map((log) => [
      new Date(log.created_at).toISOString(),
      log.action,
      log.target_tag,
      log.moderator_tag,
      `"${log.reason?.replace(/"/g, '""') || "No reason"}"`,
      log.duration || "N/A"
    ].join(","));

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `space_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
