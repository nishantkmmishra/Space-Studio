import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Profile {
  id: string; display_name: string; bio: string; avatar_url: string;
}

export default function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      setProfile(data);
      setDisplayName(data?.display_name || user.user_metadata?.full_name || "");
      setBio(data?.bio || "");
      setLoading(false);
    });
  }, [user]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName,
        bio,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile saved"); },
    onError: (e: Error) => toast.error("Save failed", { description: e.message }),
  });

  const changePasswordMut = useMutation({
    mutationFn: async ({ current, next }: { current: string; next: string }) => {
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Password changed"),
    onError: (e: Error) => toast.error("Password change failed", { description: e.message }),
  });

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const initials = displayName.slice(0, 2).toUpperCase() || "??";

  return (
    <div className="px-10 py-10 max-w-[800px] mx-auto">
      <PageHeader eyebrow="Account" title="Your profile." />

      {loading ? (
        <div className="text-stone animate-pulse text-[14px]">Loading…</div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Avatar + name */}
          <div className="card-elevated p-7">
            <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium mb-5">Identity</div>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center font-serif-display text-[26px]">
                {initials}
              </div>
              <div>
                <div className="text-[16px] font-medium text-foreground">{displayName || "No name set"}</div>
                <div className="text-[13px] text-stone">{user?.email}</div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Display name</span>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-claude" placeholder="Your name" />
              </label>
              <label className="block">
                <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Bio <span className="text-stone font-normal">(optional)</span></span>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input-claude resize-none" placeholder="A few words about yourself" />
              </label>
            </div>
            <div className="flex justify-end mt-5 pt-5 border-t border-border">
              <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
                className="h-10 px-4 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium hover:bg-[hsl(var(--brand-hover))] flex items-center gap-1.5 disabled:opacity-60">
                <Icon name="save" size={13} strokeWidth={2} /> {saveMut.isPending ? "Saving…" : "Save profile"}
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="card-elevated p-7">
            <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium mb-5">Security</div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">New password</span>
                <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="input-claude" placeholder="Min. 8 characters" />
              </label>
            </div>
            <div className="flex justify-end mt-5 pt-5 border-t border-border">
              <button onClick={() => changePasswordMut.mutate({ current: curPass, next: newPass })} disabled={changePasswordMut.isPending || newPass.length < 8}
                className="h-10 px-4 rounded-lg bg-card border border-border text-foreground text-[13px] font-medium hover:bg-secondary flex items-center gap-1.5 disabled:opacity-60">
                <Icon name="lock" size={13} /> {changePasswordMut.isPending ? "Updating…" : "Change password"}
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="card-elevated p-7 border-destructive/20">
            <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium mb-5">Danger zone</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13.5px] font-medium text-foreground">Sign out everywhere</div>
                <div className="text-[12px] text-stone">Ends all active sessions across devices.</div>
              </div>
              <button onClick={() => supabase.auth.signOut({ scope: "global" }).then(() => toast.info("Signed out everywhere"))}
                className="h-9 px-3.5 rounded-lg bg-card border border-destructive/30 text-destructive text-[12.5px] font-medium hover:bg-destructive/10 transition-colors">
                Sign out all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
