import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth";
import { profileService, UserProfile } from "@/lib/services/profile";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // -- Initial Fetch ---------------------------------------------------------

  useEffect(() => {
    if (!user) return;
    
    profileService.getProfile(user.id)
      .then((data) => {
        if (data) {
          setDisplayName(data.display_name || user.user_metadata?.full_name || "");
          setBio(data.bio || "");
        }
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  // -- Mutations -------------------------------------------------------------

  const { mutate: saveProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: () => profileService.updateProfile({ 
      id: user!.id, 
      display_name: displayName, 
      bio,
      avatar_url: "" // Future expansion
    }),
    onSuccess: () => toast.success("Identity updated successfully"),
    onError: (error) => toast.error("Update failed", { description: error.message }),
  });

  const { mutate: updatePassword, isPending: isUpdatingPassword } = useMutation({
    mutationFn: () => profileService.updatePassword(newPassword),
    onSuccess: () => {
      setNewPassword("");
      toast.success("Security credentials updated");
    },
    onError: (error) => toast.error("Update failed", { description: error.message }),
  });

  const { mutate: globalSignOut } = useMutation({
    mutationFn: () => profileService.signOutGlobal(),
    onSuccess: () => toast.info("All sessions terminated"),
  });

  // -- Derived State ---------------------------------------------------------

  const initials = (displayName || user?.email || "??").slice(0, 2).toUpperCase();

  return (
    <main className="max-w-[800px] mx-auto px-8 py-12 space-y-10">
      <PageHeader 
        eyebrow="Account Settings" 
        title="Identity & Security"
        subtitle="Manage your personal information, update security credentials, and control active sessions." 
      />

      {isLoading ? (
        <div className="card-elevated p-20 text-center flex flex-col items-center gap-4">
          <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full" />
          <p className="text-stone text-[14px]">Synchronizing profile...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Identity Section */}
          <section className="card-elevated p-8 border-none shadow-sm space-y-8">
            <header className="flex items-center justify-between">
              <h3 className="text-[11px] uppercase tracking-widest text-stone font-bold">Public Identity</h3>
              <span className="text-[11px] text-stone font-medium">Last sync: {new Date().toLocaleDateString()}</span>
            </header>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-foreground text-background flex items-center justify-center font-serif-display text-[32px] shadow-lg">
                {initials}
              </div>
              <div>
                <h4 className="text-[18px] font-bold text-foreground">{displayName || "Anonymous User"}</h4>
                <p className="text-[14px] text-stone font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-dark-warm ml-1">Display Name</label>
                <input 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  className="input-claude h-11" 
                  placeholder="How you appear to others..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-dark-warm ml-1">
                  Personal Bio <span className="text-stone font-normal font-medium ml-1">(Optional)</span>
                </label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  rows={4} 
                  className="input-claude resize-none p-4" 
                  placeholder="Tell the community a bit about yourself..." 
                />
              </div>
            </div>

            <footer className="flex justify-end pt-6 border-t border-border">
              <button 
                onClick={() => saveProfile()} 
                disabled={isSavingProfile}
                className="h-11 px-8 rounded-xl bg-accent text-accent-foreground text-[13px] font-bold hover:bg-[hsl(var(--brand-hover))] flex items-center gap-2.5 transition-all shadow-sm disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Icon name="save" size={14} strokeWidth={2.5} />
                )}
                {isSavingProfile ? "Saving Identity..." : "Update Profile"}
              </button>
            </footer>
          </section>

          {/* Security Section */}
          <section className="card-elevated p-8 border-none shadow-sm space-y-8">
            <header>
              <h3 className="text-[11px] uppercase tracking-widest text-stone font-bold">Security Credentials</h3>
            </header>

            <div className="space-y-2 max-w-[400px]">
              <label className="text-[12px] font-bold text-dark-warm ml-1">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="input-claude h-11" 
                placeholder="Minimum 8 characters..." 
              />
            </div>

            <footer className="flex justify-end pt-6 border-t border-border">
              <button 
                onClick={() => updatePassword()} 
                disabled={isUpdatingPassword || newPassword.length < 8}
                className="h-11 px-8 rounded-xl bg-card border border-border text-foreground text-[13px] font-bold hover:bg-secondary flex items-center gap-2.5 transition-all disabled:opacity-50"
              >
                <Icon name="lock" size={14} strokeWidth={2.5} className="text-stone" />
                Change Password
              </button>
            </footer>
          </section>

          {/* Danger Zone */}
          <section className="card-elevated p-8 border-none shadow-sm bg-destructive/5 rounded-3xl">
            <header className="mb-6">
              <h3 className="text-[11px] uppercase tracking-widest text-destructive font-bold">Access Control</h3>
            </header>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h4 className="text-[15px] font-bold text-foreground">Global Sign Out</h4>
                <p className="text-[13px] text-stone font-medium mt-1">
                  Terminate all active sessions across all devices and browsers immediately.
                </p>
              </div>
              <button 
                onClick={() => globalSignOut()}
                className="h-10 px-6 rounded-xl bg-background border border-destructive/20 text-destructive text-[13px] font-bold hover:bg-destructive hover:text-white transition-all shadow-sm"
              >
                Invalidate All Sessions
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
