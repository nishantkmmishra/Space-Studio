import { supabase, botFetch } from "../supabase";

export interface GuildConfig {
  guild_id: string;
  workspace_name: string;
  bot_tone: string;
  welcome_message: string;
  welcome_channel_id: string;
  mod_log_channel_id: string;
  rag_channel_id: string;
  ai_provider: string;
  ai_model: string;
  ai_base_url: string;
  ai_api_key?: string;
  updated_at?: string;
}

export interface DiscordChannel {
  id: string;
  name: string;
  guildName: string;
}

export const settingsService = {
  async getConfig(): Promise<GuildConfig | null> {
    const { data, error } = await supabase
      .from("guild_configs")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data as GuildConfig | null;
  },

  async saveConfig(config: Partial<GuildConfig>): Promise<void> {
    const guildId = config.guild_id || "default";
    const { error } = await supabase
      .from("guild_configs")
      .upsert({
        ...config,
        guild_id: guildId,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async fetchChannels(): Promise<DiscordChannel[]> {
    const response = await botFetch("/channels");
    if (!response.ok) throw new Error(`Bot API error: ${response.status}`);
    const data = await response.json();
    return data.channels || [];
  },

  async createChannel(name: string): Promise<string> {
    const response = await botFetch("/channels", {
      method: "POST",
      body: JSON.stringify({ name })
    });

    if (!response.ok) throw new Error(`Bot API error: ${response.status}`);
    const data = await response.json();
    return data.id;
  },

  async testBotConnection(): Promise<any> {
    const response = await botFetch("/status");
    if (!response.ok) throw new Error("Bot unreachable");
    return await response.json();
  }
};
