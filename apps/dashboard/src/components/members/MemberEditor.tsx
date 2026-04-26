import { useState } from "react";
import { Icon } from "@/components/Icon";
import { GuildMember, MemberRole } from "@/lib/services/members";

const ROLES: MemberRole[] = ["Member", "Moderator", "Admin", "Owner", "Patron"];

interface MemberEditorProps {
  member: GuildMember;
  onClose: () => void;
  onSave: (role: MemberRole, notes: string) => void;
  isSaving: boolean;
}

export function MemberEditor({ member, onClose, onSave, isSaving }: MemberEditorProps) {
  const [role, setRole] = useState<MemberRole>(member.role || "Member");
  const [notes, setNotes] = useState(member.notes || "");

  return (
    <div 
      className="fixed inset-0 z-50 bg-foreground/45 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border-warm rounded-2xl w-full max-w-[500px] p-8 animate-slide-up shadow-2xl">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-12 h-12 rounded-xl border border-border" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center text-[18px] font-bold">
                {member.username?.[0].toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-serif-display text-[24px] text-foreground leading-tight">{member.username}</h2>
              <p className="text-[12px] text-stone">UID: {member.user_id}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-xl text-stone hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="space-y-6">
          <section className="space-y-2">
            <label className="text-[12px] font-bold text-dark-warm ml-1 uppercase tracking-wider">Assigned Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as MemberRole)} 
              className="input-claude h-11 font-semibold"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </section>

          <section className="space-y-2">
            <label className="text-[12px] font-bold text-dark-warm ml-1 uppercase tracking-wider">
              Moderator Notes <span className="text-stone font-normal">(Internal only)</span>
            </label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              rows={4} 
              className="input-claude resize-none p-4 leading-relaxed text-[14px]" 
              placeholder="Record behavioral patterns or administrative decisions..." 
            />
          </section>
        </div>

        <footer className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <button 
            onClick={onClose} 
            className="h-11 px-6 rounded-xl bg-card border border-border text-olive text-[13px] font-bold hover:bg-secondary transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={() => onSave(role, notes)} 
            disabled={isSaving}
            className="h-11 px-6 rounded-xl bg-accent text-accent-foreground text-[13px] font-bold hover:bg-[hsl(var(--brand-hover))] flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm"
          >
            {isSaving ? (
              <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Icon name="save" size={14} strokeWidth={2.5} />
            )}
            {isSaving ? "Updating Profile..." : "Apply Changes"}
          </button>
        </footer>
      </div>
    </div>
  );
}
