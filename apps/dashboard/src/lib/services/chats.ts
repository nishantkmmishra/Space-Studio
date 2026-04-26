import { supabase } from "../supabase";

export type ChatRating = "good" | "wrong" | null;

export interface ChatMessage {
  id: string;
  guild_id: string;
  user_id: string;
  user_tag: string;
  channel: string;
  question: string;
  answer: string;
  docs_used: string[];
  rating: ChatRating;
  feedback: string;
  created_at: string;
}

export interface UpdateChatRequest {
  id: string;
  rating?: ChatRating;
  answer?: string;
}

export const chatService = {
  async getAll(limit = 100): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ChatMessage[];
  },

  async update({ id, ...updates }: UpdateChatRequest): Promise<void> {
    const { error } = await supabase
      .from("chats")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  },

  subscribeToNewChats(onInsert: () => void) {
    const channel = supabase
      .channel("chats-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chats" },
        onInsert
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};
