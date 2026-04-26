import { botFetch } from "../supabase";

export interface BotStatus {
  online: boolean;
  username: string | null;
  uptime: number;
  guilds: number;
  latency: number;
  stats: {
    queriesAnswered: number;
    messagesProcessed: number;
  };
}

export interface LogEntry {
  ts: string;
  level: "info" | "warn" | "error";
  msg: string;
}

export type BotAction = "reload" | "sync_members" | "restart";

export const botService = {
  async getStatus(): Promise<BotStatus | null> {
    try {
      const response = await botFetch("/status");
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch bot status:", error);
      return null;
    }
  },

  async executeAction(action: BotAction): Promise<{ message: string }> {
    const response = await botFetch("/command", {
      method: "POST",
      body: JSON.stringify({ action }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Failed to execute ${action}`);
    }

    return data;
  },

  getLogStreamUrl(): string {
    const apiSecret = import.meta.env.VITE_BOT_API_SECRET;
    const baseUrl = import.meta.env.VITE_BOT_API_URL || "http://localhost:3001";
    const eventUrl = `${baseUrl}/events`;
    
    return apiSecret 
      ? `${eventUrl}?token=${encodeURIComponent(apiSecret)}`
      : eventUrl;
  }
};
