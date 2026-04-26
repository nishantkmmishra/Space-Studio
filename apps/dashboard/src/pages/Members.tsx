import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Member {
  id: string; guild_id: string; user_id: string; username: string; discriminator: string;
  avatar_url: string; role: string; warnings: number; notes: string; joined_at: string; updated_at: string;
}

const roles = ["Member", "Moderator", "Admin", "Owner", "Patron"];

export default function Members() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selected, setSelected] = useState<Member | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guild_members").select("*").order("joined_at", { ascending: false });
      if (error) throw error;
      return data as Member[];
    },
  });

  const warnMut = useMutation({
    mutationFn: async ({ id, warnings }: { id: string; warnings: number }) => {
      const { error } = await supabase.from("guild_members").update({ warnings }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["members"] }); toast.success("Warning count updated"); },
    onError: (e: Error) => toast.error("Update failed", { description: e.message }),
  });

  const updateRoleMut = useMutation({
    mutationFn: async ({ id, role, notes }: { id: string; role?: string; notes?: string }) => {
      const { error } = await supabase.from("guild_members").update({ role, notes }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["members"] }); setSelected(null); toast.success("Member updated"); },
    onError: (e: Error) => toast.error("Update failed", { description: e.message }),
  });

  const filtered = useMemo(() =>
    members.filter((m) =>
      (roleFilter === "All" || m.role === roleFilter) &&
      (m.username || "").toLowerCase().includes(search.toLowerCase())
    ), [members, search, roleFilter]);

  return (
    <div className="px-10 py-10 max-w-[1240px] mx-auto">
      <PageHeader eyebrow="Members" title="Who's here."
        subtitle="Members synced from Discord. Update roles, add notes, or review warnings.">
        <div className="text-[12px] text-stone border border-border px-3 py-1.5 rounded-lg bg-card flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {members.length.toLocaleString()} synced
        </div>
      </PageHeader>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1.5">
          {["All", ...roles].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${roleFilter === r ? "bg-foreground text-background border-foreground" : "bg-card text-olive border-border hover:border-accent hover:text-accent"}`}>{r}</button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Icon name="search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members…" className="input-claude pl-9 w-[240px] h-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="card-elevated p-10 text-center text-stone text-[14px] animate-pulse">Loading members…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="users" title="No members yet."
          description="Run /setup in Discord and trigger a member sync from the Console page to populate this list." />
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="grid grid-cols-[2fr_120px_90px_120px_100px] px-5 py-3 border-b border-border bg-background/60 text-[10.5px] uppercase tracking-wider text-stone font-medium">
            <div>Member</div><div>Role</div><div>Warnings</div><div>Joined</div><div className="text-right">Actions</div>
          </div>
          {filtered.map((m, i) => (
            <div key={m.id} className={`row-hover grid grid-cols-[2fr_120px_90px_120px_100px] items-center px-5 py-3.5 ${i < filtered.length - 1 ? "border-b border-border" : ""}`}>
              <div className="flex items-center gap-2.5">
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-[12px] font-mono">
                    {(m.username || "?")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-[13.5px] font-medium text-foreground">{m.username || "Unknown"}</div>
                  {m.notes && <div className="text-[11px] text-stone truncate max-w-[260px]">{m.notes}</div>}
                </div>
              </div>
              <span className={`badge-warm w-fit ${m.role === "Admin" || m.role === "Owner" ? "bg-accent/10 text-accent" : m.role === "Moderator" ? "bg-foreground/8 text-foreground" : "bg-secondary text-olive"}`}>{m.role}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => warnMut.mutate({ id: m.id, warnings: Math.max(0, m.warnings - 1) })} className="w-5 h-5 rounded text-stone hover:bg-secondary flex items-center justify-center text-[12px]">−</button>
                <span className={`font-mono text-[13px] min-w-[20px] text-center ${m.warnings > 0 ? "text-accent font-semibold" : "text-stone"}`}>{m.warnings}</span>
                <button onClick={() => warnMut.mutate({ id: m.id, warnings: m.warnings + 1 })} className="w-5 h-5 rounded text-stone hover:bg-secondary flex items-center justify-center text-[12px]">+</button>
              </div>
              <div className="text-[12px] text-stone">{m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "—"}</div>
              <div className="flex justify-end">
                <button onClick={() => setSelected(m)} className="h-8 px-3 rounded-lg bg-card border border-border text-[12px] text-olive hover:bg-secondary flex items-center gap-1.5 font-medium transition-colors">
                  <Icon name="edit" size={12} /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <EditMember member={selected} onClose={() => setSelected(null)}
          onSave={(role, notes) => updateRoleMut.mutate({ id: selected.id, role, notes })} saving={updateRoleMut.isPending} />
      )}
    </div>
  );
}

function EditMember({ member, onClose, onSave, saving }: { member: Member; onClose: () => void; onSave: (role: string, notes: string) => void; saving: boolean }) {
  const [role, setRole] = useState(member.role || "Member");
  const [notes, setNotes] = useState(member.notes || "");
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-50 bg-foreground/45 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in">
      <div className="bg-card border border-border-warm rounded-2xl w-full max-w-[480px] p-7 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif-display text-[22px] text-foreground">Edit {member.username}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-lg text-stone hover:bg-secondary flex items-center justify-center"><Icon name="close" size={16} /></button>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input-claude">
              {roles.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Notes <span className="text-stone font-normal">(internal)</span></span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="input-claude resize-none" placeholder="Anything worth remembering…" />
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-border">
          <button onClick={onClose} className="h-10 px-4 rounded-lg bg-card border border-border text-olive text-[13px] font-medium hover:bg-secondary">Cancel</button>
          <button onClick={() => onSave(role, notes)} disabled={saving}
            className="h-10 px-4 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium hover:bg-[hsl(var(--brand-hover))] flex items-center gap-1.5 disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
