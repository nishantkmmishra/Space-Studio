import { supabase } from "../supabase";

export type MemberRole = "Member" | "Moderator" | "Admin" | "Owner" | "Patron";

export interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  username: string;
  discriminator: string;
  avatar_url: string;
  role: MemberRole;
  warnings: number;
  notes: string;
  joined_at: string;
  updated_at: string;
}

export interface UpdateMemberRequest {
  id: string;
  role?: MemberRole;
  notes?: string;
  warnings?: number;
}

export const memberService = {
  async getAll(): Promise<GuildMember[]> {
    const { data, error } = await supabase
      .from("guild_members")
      .select("*")
      .order("joined_at", { ascending: false });

    if (error) throw error;
    return data as GuildMember[];
  },

  async update({ id, ...updates }: UpdateMemberRequest): Promise<void> {
    const { error } = await supabase
      .from("guild_members")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  },

  async incrementWarnings(id: string, currentWarnings: number): Promise<void> {
    return this.update({ id, warnings: currentWarnings + 1 });
  },

  async decrementWarnings(id: string, currentWarnings: number): Promise<void> {
    return this.update({ id, warnings: Math.max(0, currentWarnings - 1) });
  }
};
