import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Chat {
  id: string; guild_id: string; user_id: string; user_tag: string; channel: string;
  question: string; answer: string; docs_used: string[]; rating: "good" | "wrong" | null;
  feedback: string; created_at: string;
}

export default function Chats() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"all" | "needs_review">("all");
  const [editing, setEditing] = useState<Chat | null>(null);

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chats").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data as Chat[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase.channel("chats-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chats" }, () => {
        qc.invalidateQueries({ queryKey: ["chats"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const ratingMut = useMutation({
    mutationFn: async ({ id, rating, answer }: { id: string; rating?: string; answer?: string }) => {
      const patch: Record<string, unknown> = {};
      if (rating !== undefined) patch.rating = rating;
      if (answer !== undefined) patch.answer = answer;
      const { error } = await supabase.from("chats").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["chats"] }); setEditing(null); toast.success("Answer updated"); },
    onError: (e: Error) => toast.error("Update failed", { description: e.message }),
  });

  const list = useMemo(() => {
    if (tab === "needs_review") return chats.filter((c) => c.rating === "wrong" || c.rating === null);
    return chats;
  }, [chats, tab]);

  const needsReviewCount = useMemo(() => chats.filter((c) => c.rating === "wrong" || c.rating === null).length, [chats]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="px-10 py-10 max-w-[1100px] mx-auto">
      <PageHeader eyebrow="Conversations" title="What the bot said."
        subtitle="Review the bot's answers, edit anything that drifted, and the correction trains tomorrow's reply." />

      <div className="flex gap-1.5 mb-6">
        {[
          { k: "all", l: "All chats", n: chats.length },
          { k: "needs_review", l: "Needs review", n: needsReviewCount },
        ].map(({ k, l, n }) => (
          <button key={k} onClick={() => setTab(k as "all" | "needs_review")}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors flex items-center gap-2 ${
              tab === k ? "bg-foreground text-background border-foreground" : "bg-card text-olive border-border hover:border-accent hover:text-accent"
            }`}>
            {l}
            <span className={`text-[10.5px] font-mono px-1.5 rounded ${tab === k ? "bg-background/15" : "bg-secondary"}`}>{n}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card-elevated p-10 text-center text-stone text-[14px] animate-pulse">Loading conversations…</div>
      ) : list.length === 0 ? (
        <EmptyState icon="message" title={chats.length === 0 ? "No conversations yet." : "Nothing here."}
          description={chats.length === 0 ? "When your Discord bot answers its first question, it shows up here." : "All conversations are in good shape."} />
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((c) => (
            <article key={c.id} className="card-elevated p-6">
              <header className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-[12px] font-mono font-medium">
                    {(c.user_tag || "?")[0].toUpperCase()}
                  </div>
                  <div className="text-[13px]">
                    <span className="font-mono text-foreground font-medium">{c.user_tag || "unknown"}</span>
                    {c.channel && <span className="text-stone ml-2">in <span className="font-mono text-olive">#{c.channel}</span></span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone">{formatTime(c.created_at)}</span>
                  {(c.rating === "wrong" || c.rating === null) && <span className="badge-warm bg-accent/10 text-accent">Needs review</span>}
                  {c.rating === "good" && <span className="badge-warm bg-secondary text-olive">✓ Good</span>}
                </div>
              </header>

              <div className="mb-3">
                <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium mb-1.5">Question</div>
                <p className="font-serif-display text-[16.5px] text-foreground leading-relaxed">{c.question}</p>
              </div>

              <div className="bg-background border border-border rounded-xl p-4 mb-3">
                <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium mb-1.5">Bot answer</div>
                <p className="text-[14px] text-dark-warm leading-relaxed">{c.answer}</p>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-1.5 flex-wrap">
                  {(c.docs_used || []).map((d, i) => (
                    <span key={i} className="badge-warm bg-secondary text-olive">{d}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => ratingMut.mutate({ id: c.id, rating: "good" })}
                    className={`h-8 px-3 rounded-lg text-[12px] font-medium border transition-colors flex items-center gap-1 ${c.rating === "good" ? "bg-foreground text-background border-foreground" : "bg-card border-border text-olive hover:bg-secondary"}`}>
                    <Icon name="check" size={11} strokeWidth={2.5} /> Good
                  </button>
                  <button onClick={() => setEditing(c)}
                    className="h-8 px-3 rounded-lg bg-accent text-accent-foreground text-[12px] font-medium hover:bg-[hsl(var(--brand-hover))] flex items-center gap-1.5">
                    <Icon name="edit" size={12} strokeWidth={2} /> Edit answer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <EditModal chat={editing} onClose={() => setEditing(null)}
          onSave={(id, answer) => ratingMut.mutate({ id, answer, rating: "good" })} saving={ratingMut.isPending} />
      )}
    </div>
  );
}

function EditModal({ chat, onClose, onSave, saving }: { chat: Chat; onClose: () => void; onSave: (id: string, a: string) => void; saving: boolean }) {
  const [answer, setAnswer] = useState(chat.answer);
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-50 bg-foreground/45 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in">
      <div className="bg-card border border-border-warm rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-7 animate-slide-up">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-serif-display text-[24px] text-foreground leading-tight">Refine the answer</h2>
            <p className="text-[13px] text-stone mt-1">This corrects the source and improves future replies.</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg text-stone hover:bg-secondary flex items-center justify-center"><Icon name="close" size={16} /></button>
        </div>
        <div className="bg-background rounded-xl p-3.5 mb-4 border border-border">
          <div className="text-[10.5px] uppercase tracking-wider text-stone font-medium mb-1">Original question</div>
          <div className="text-[14px] text-foreground">{chat.question}</div>
        </div>
        <label className="block mb-5">
          <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Corrected answer</span>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} className="input-claude resize-y leading-relaxed" />
        </label>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-lg bg-card border border-border text-olive text-[13px] font-medium hover:bg-secondary">Cancel</button>
          <button onClick={() => onSave(chat.id, answer)} disabled={saving}
            className="h-10 px-4 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium hover:bg-[hsl(var(--brand-hover))] flex items-center gap-1.5 disabled:opacity-60">
            <Icon name="sparkle" size={13} strokeWidth={1.8} /> {saving ? "Saving…" : "Update & retrain"}
          </button>
        </div>
      </div>
    </div>
  );
}
