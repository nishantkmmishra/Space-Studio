import { useState, useEffect } from "react";
import { LogEntry, botService } from "@/lib/services/bot";

export function useLogStream() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const url = botService.getLogStreamUrl();
    let eventSource: EventSource | null = null;

    const connect = () => {
      try {
        eventSource = new EventSource(url);

        eventSource.onopen = () => setIsConnected(true);
        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Attempt reconnection after 5s
          setTimeout(connect, 5000);
        };

        eventSource.onmessage = (event) => {
          try {
            const entry = JSON.parse(event.data) as LogEntry;
            setLogs((prev) => {
              const updated = [...prev, entry];
              // Keep only last 1000 logs for performance
              return updated.length > 1000 ? updated.slice(-1000) : updated;
            });
          } catch (e) {
            console.error("Failed to parse log event:", e);
          }
        };
      } catch (error) {
        console.error("EventSource connection failed:", error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      eventSource?.close();
    };
  }, []);

  const clearLogs = () => setLogs([]);

  return { logs, isConnected, clearLogs };
}
