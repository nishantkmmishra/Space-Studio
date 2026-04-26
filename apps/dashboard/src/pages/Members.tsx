import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { memberService, GuildMember, MemberRole } from "@/lib/services/members";
import { MemberEditor } from "@/components/members/MemberEditor";
import { toast } from "sonner";

const ROLES: (MemberRole | "All")[] = ["All", "Member", "Moderator", "Admin", "Owner", "Patron"];

export default function Members() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRole, setActiveRole] = useState<MemberRole | "All">("All");
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null);

  // -- Data Fetching ---------------------------------------------------------
  
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members-list"],
    queryFn: () => memberService.getAll(),
  });

  // -- Mutations -------------------------------------------------------------

  const { mutate: updateMember, isPending: isUpdating } = useMutation({
    mutationFn: (payload: { id: string; role?: MemberRole; notes?: string; warnings?: number }) => 
      memberService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members-list"] });
      setSelectedMember(null);
      toast.success("Registry updated successfully");
    },
    onError: (error) => toast.error("Update failed", { description: error.message }),
  });

  const { mutate: adjustWarnings } = useMutation({
    mutationFn: ({ id, current, direction }: { id: string; current: number; direction: "inc" | "dec" }) => 
      direction === "inc" 
        ? memberService.incrementWarnings(id, current)
        : memberService.decrementWarnings(id, current),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members-list"] }),
  });

  // -- Derived State ---------------------------------------------------------

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesRole = activeRole === "All" || m.role === activeRole;
      const matchesSearch = (m.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (m.user_id || "").includes(searchTerm);
      return matchesRole && matchesSearch;
    });
  }, [members, searchTerm, activeRole]);

  // -- Render Helpers --------------------------------------------------------

  return (
    <main className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-[24px] font-black tracking-tighter text-foreground">Community Registry</h2>
          <p className="text-[13px] text-stone font-medium">Manage user roles, track behavior, and maintain server integrity.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border border-border text-[13px] font-black text-stone shadow-sm">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {members.length.toLocaleString()} Active Members
        </div>
      </div>

      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {ROLES.map((role) => (
            <button 
              key={role} 
              onClick={() => setActiveRole(role)}
              className={`px-4 py-2 rounded-xl text-[12.5px] font-bold border transition-all whitespace-nowrap ${
                activeRole === role 
                  ? "bg-foreground text-background border-foreground shadow-sm" 
                  : "bg-card text-stone border-border hover:border-accent/40 hover:text-accent"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="relative group">
          <Icon 
            name="search" 
            size={14} 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone group-focus-within:text-accent transition-colors" 
          />
          <input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search by name or ID..."
            className="input-claude pl-10 w-full md:w-[280px] h-10 shadow-none focus:ring-accent/10" 
          />
        </div>
      </section>

      {isLoading ? (
        <div className="card-elevated p-20 text-center flex flex-col items-center gap-4">
          <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full" />
          <p className="text-stone text-[14px]">Accessing member database...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <EmptyState 
          icon="users" 
          title={members.length === 0 ? "The registry is empty" : "No matches found"}
          description={members.length === 0 
            ? "Sync members from the Console to populate the directory." 
            : "Adjust your filters or search term to find specific members."} 
        />
      ) : (
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[200px] bg-card border border-border rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <EmptyState 
          icon="users" 
          title={members.length === 0 ? "The registry is empty" : "No matches found"}
          description={members.length === 0 
            ? "Sync members from the Console to populate the directory." 
            : "Adjust your filters or search term to find specific members."} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className="bg-card border border-border rounded-3xl p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt="" className="w-14 h-14 rounded-2xl border-2 border-background shadow-lg" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center text-xl font-black border-2 border-background shadow-lg">
                        {member.username?.[0].toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background shadow-sm" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-black text-foreground tracking-tight">{member.username}</h3>
                    <p className="text-[11px] font-mono text-stone opacity-60">ID: {member.id}</p>
                  </div>
                </div>
                <RoleBadge role={member.role} />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <p className="text-[12px] text-stone font-medium leading-relaxed italic">
                    {member.notes || "No administrator notes added for this member."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => adjustWarnings({ id: member.id, current: member.warnings, direction: "dec" })}
                      className="w-8 h-8 rounded-xl bg-background border border-border text-stone hover:text-foreground hover:border-stone flex items-center justify-center transition-all shadow-sm"
                    >
                      <Icon name="minus" size={12} />
                    </button>
                    <div className="text-center min-w-[24px]">
                      <div className="text-[14px] font-black tabular-nums">{member.warnings}</div>
                      <div className="text-[8px] uppercase tracking-tighter text-stone font-black opacity-40">Strikes</div>
                    </div>
                    <button 
                      onClick={() => adjustWarnings({ id: member.id, current: member.warnings, direction: "inc" })}
                      className="w-8 h-8 rounded-xl bg-background border border-border text-stone hover:text-accent hover:border-accent flex items-center justify-center transition-all shadow-sm"
                    >
                      <Icon name="plus" size={12} />
                    </button>
                  </div>

                  <button 
                    onClick={() => setSelectedMember(member)}
                    className="h-10 px-5 rounded-2xl bg-foreground text-background text-[12px] font-black hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Icon name="settings" size={14} />
                    Manage
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] text-stone font-bold uppercase tracking-widest opacity-40">
                <span>Member Since</span>
                <span>{member.joined_at ? new Date(member.joined_at).toLocaleDateString([], { month: 'short', year: 'numeric' }) : "—"}</span>
              </div>
            </div>
          ))}
      )}

      {selectedMember && (
        <MemberEditor 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)}
          onSave={(role, notes) => updateMember({ id: selectedMember.id, role, notes })} 
          isSaving={isUpdating} 
        />
      )}
    </main>
  );
}

// -- Shared Subcomponents --------------------------------------------------

function RoleBadge({ role }: { role: string }) {
  const themes: Record<string, string> = {
    Owner: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Admin: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    Moderator: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    Patron: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Member: "bg-stone-500/10 text-stone-500 border-stone-500/20",
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${themes[role] || themes.Member}`}>
      {role}
    </span>
  );
}
