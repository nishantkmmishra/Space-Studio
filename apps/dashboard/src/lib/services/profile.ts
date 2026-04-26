import { supabase } from "../supabase";

export interface UserProfile {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  updated_at?: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows found"
    return data as UserProfile | null;
  },

  async updateProfile(profile: UserProfile): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async signOutGlobal(): Promise<void> {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) throw error;
  }
};
