import { cn } from "@/lib/utils";

interface StatusItemProps {
  label: string;
  status: "online" | "offline" | "loading" | "error";
  active?: boolean;
}

function StatusItem({ label, status, active = true }: StatusItemProps) {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-stone-500",
    loading: "bg-blue-500 animate-pulse",
    error: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/50">
      <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]", statusColors[status])} />
      <span className="text-[11px] font-bold uppercase tracking-wider text-stone/80">{label}:</span>
      <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
        {status === "online" ? "Active" : status.toUpperCase()}
      </span>
    </div>
  );
}

export function GlobalStatus() {
  return (
    <div className="flex items-center gap-2">
      <StatusItem label="Bot" status="online" />
      <StatusItem label="Database" status="online" />
      <StatusItem label="AI" status="online" />
    </div>
  );
}
