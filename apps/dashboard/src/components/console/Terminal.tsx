import { useRef, useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { LogEntry } from "@/lib/services/bot";

interface TerminalProps {
  logs: LogEntry[];
  onClear: () => void;
  isBotOnline: boolean;
}

const LEVEL_THEME: Record<LogEntry["level"], string> = {
  info: "text-warm-silver",
  warn: "text-accent",
  error: "text-destructive",
};

export function Terminal({ logs, onClear, isBotOnline }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<LogEntry["level"] | "all">("all");

  const filteredLogs = filter === "all" ? logs : logs.filter((l) => l.level === filter);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className="card-elevated overflow-hidden flex flex-col h-[600px] border-none shadow-lg">
      <header className="flex items-center justify-between px-5 py-3 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-accent/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[11px] font-mono text-stone uppercase tracking-widest font-bold">Bot Instance logs</span>
        </div>

        <div className="flex items-center gap-1">
          {(["all", "info", "warn", "error"] as const).map((lv) => (
            <button
              key={lv}
              onClick={() => setFilter(lv)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-tighter transition-all ${
                filter === lv ? "bg-foreground text-background font-bold" : "text-stone hover:text-foreground"
              }`}
            >
              {lv}
            </button>
          ))}
          <div className="w-px h-3 bg-border mx-1" />
          <button
            onClick={onClear}
            className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase text-stone hover:text-foreground transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase transition-all ${
              autoScroll ? "text-accent font-bold" : "text-stone"
            }`}
          >
            {autoScroll ? "↓ Auto" : "⏸ Hold"}
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[hsl(60_3%_8%)] p-5 font-mono text-[12.5px] leading-relaxed selection:bg-accent/30"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone/30 space-y-4">
            <Icon name="terminal" size={32} strokeWidth={1} />
            <p className="max-w-[200px] text-center">
              {isBotOnline ? "Streaming synchronized. Waiting for events..." : "Instance offline. Logs will appear once the bot starts."}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((entry, i) => (
              <div key={i} className="flex gap-4 group hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                <time className="text-stone/40 tabular-nums select-none shrink-0">
                  {new Date(entry.ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </time>
                <span className={`font-bold shrink-0 w-[45px] ${LEVEL_THEME[entry.level]}`}>
                  {entry.level.toUpperCase()}
                </span>
                <span className="text-warm-silver break-all">{entry.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
