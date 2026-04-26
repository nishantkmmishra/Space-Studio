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
    <main className="max-w-[1240px] mx-auto px-10 py-12 space-y-8">
      <PageHeader 
        category="Community" 
        title="Members"
        subtitle="Manage user roles, track behavior, and maintain server integrity."
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-[13px] font-bold text-stone shadow-sm">
          <Icon name="users" size={14} className="text-accent" />
          {members.length.toLocaleString()} Members
        </div>
      </PageHeader>

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
        <div className="card-elevated overflow-hidden border-none shadow-sm">
        <div className="grid grid-cols-[2fr_130px_100px_130px_100px] px-6 py-4 bg-secondary/30 border-b border-border text-[11px] uppercase tracking-widest text-stone font-bold">
          <div>Member</div>
          <div>Role</div>
          <div>Warnings</div>
          <div>Joined</div>
          <div className="text-right">Actions</div>
        </div>

          <div className="divide-y divide-border/50">
            {filteredMembers.map((member) => (
              <div key={member.id} className="grid grid-cols-[2fr_130px_100px_130px_100px] items-center px-6 py-4 hover:bg-secondary/20 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-10 h-10 rounded-xl border border-border shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center text-[14px] font-bold border border-border shadow-sm">
                      {member.username?.[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[14.5px] font-bold text-foreground truncate">{member.username}</div>
                    <div className="text-[11px] text-stone truncate max-w-[200px] font-medium">{member.notes || "No internal notes"}</div>
                  </div>
                </div>

                <div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold tracking-tight border ${
                    member.role === "Admin" || member.role === "Owner" 
                      ? "bg-accent/5 text-accent border-accent/20" 
                      : member.role === "Moderator" ? "bg-foreground/5 text-foreground border-foreground/10" : "bg-secondary text-stone border-border"
                  }`}>
                    {member.role}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => adjustWarnings({ id: member.id, current: member.warnings, direction: "dec" })}
                    className="w-6 h-6 rounded-lg bg-background border border-border text-stone hover:text-foreground hover:border-stone flex items-center justify-center transition-all"
                  >
                    <Icon name="minus" size={10} />
                  </button>
                  <span className={`font-mono text-[14px] font-bold w-6 text-center ${member.warnings > 0 ? "text-accent" : "text-stone"}`}>
                    {member.warnings}
                  </span>
                  <button 
                    onClick={() => adjustWarnings({ id: member.id, current: member.warnings, direction: "inc" })}
                    className="w-6 h-6 rounded-lg bg-background border border-border text-stone hover:text-accent hover:border-accent flex items-center justify-center transition-all"
                  >
                    <Icon name="plus" size={10} />
                  </button>
                </div>

                <div className="text-[12px] text-stone font-medium tabular-nums">
                  {member.joined_at ? new Date(member.joined_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                </div>

                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setSelectedMember(member)}
                    className="h-9 px-4 rounded-xl bg-background border border-border text-[12px] text-foreground font-bold hover:bg-secondary hover:border-stone transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Icon name="edit" size={13} strokeWidth={2.5} />
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
