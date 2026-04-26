import { useRef, useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { LogEntry } from "@/lib/services/bot";

interface TerminalProps {
  logs: LogEntry[];
  onClear: () => void;
  isBotOnline: boolean;
}

const LEVEL_THEME: Record<LogEntry["level"], { text: string; bg: string; dot: string }> = {
  info:  { text: "text-blue-400",   bg: "bg-blue-500/10",   dot: "bg-blue-500" },
  warn:  { text: "text-orange-400", bg: "bg-orange-500/10", dot: "bg-orange-500" },
  error: { text: "text-red-400",    bg: "bg-red-500/10",    dot: "bg-red-500" },
};

export function Terminal({ logs, onClear, isBotOnline }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<LogEntry["level"] | "all">("all");
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter((l) => {
    const matchesFilter = filter === "all" || l.level === filter;
    const matchesSearch = l.msg.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
    <div className="card-elevated overflow-hidden flex flex-col h-[650px] border-none shadow-2xl bg-[#0a0a0b]">
      <header className="flex items-center justify-between px-6 py-4 bg-secondary/10 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[11px] font-mono text-stone uppercase tracking-widest font-black opacity-60">System Runtime Logs</span>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <div className="relative group">
            <Icon name="search" size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone opacity-40 group-focus-within:text-primary transition-colors" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="bg-white/5 border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-mono focus:outline-none focus:border-primary/50 w-[200px] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
            {(["all", "info", "warn", "error"] as const).map((lv) => (
              <button
                key={lv}
                onClick={() => setFilter(lv)}
                className={`px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-tighter transition-all ${
                  filter === lv ? "bg-white/10 text-white font-black" : "text-stone hover:text-stone/80"
                }`}
              >
                {lv}
              </button>
            ))}
          </div>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={onClear}
            className="px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase text-stone hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/5"
          >
            Clear
          </button>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase transition-all border ${
              autoScroll ? "bg-primary/10 border-primary/20 text-primary font-black" : "bg-white/5 border-white/5 text-stone"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${autoScroll ? "bg-primary animate-pulse" : "bg-stone opacity-40"}`} />
            {autoScroll ? "Live" : "Hold"}
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 font-mono text-[12px] leading-relaxed selection:bg-primary/30 scrollbar-thin scrollbar-thumb-white/10"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone/20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Icon name="terminal" size={32} strokeWidth={1} />
            </div>
            <div className="text-center">
              <p className="font-black text-[13px] text-stone/40">No activity detected</p>
              <p className="text-[11px] max-w-[220px] mt-1">
                {isBotOnline ? "Waiting for incoming events from the Discord gateway..." : "Bot is offline. Logs will stream here once the instance starts."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredLogs.map((entry, i) => (
              <div key={i} className="flex gap-5 group hover:bg-white/5 px-3 py-1 rounded-md transition-colors border border-transparent hover:border-white/5">
                <time className="text-stone/30 tabular-nums select-none shrink-0 font-medium">
                  {new Date(entry.ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                </time>
                <div className={`flex items-center gap-2 shrink-0 w-[70px] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight ${LEVEL_THEME[entry.level].bg} ${LEVEL_THEME[entry.level].text}`}>
                  <div className={`w-1 h-1 rounded-full ${LEVEL_THEME[entry.level].dot}`} />
                  {entry.level}
                </div>
                <span className="text-stone/90 break-all font-medium">{entry.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
