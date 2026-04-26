import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Doc {
  id: string; title: string; content: string; source: string; category: string; created_at: string;
}

const categories = ["Onboarding", "FAQ", "Curriculum", "Policy", "Support", "General"];

export default function KnowledgeBase() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Doc | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Doc[];
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); toast.success("Document removed"); },
    onError: (e: Error) => toast.error("Delete failed", { description: e.message }),
  });

  const saveMut = useMutation({
    mutationFn: async (doc: Partial<Doc> & { id?: string }) => {
      if (doc.id) {
        const { error } = await supabase.from("documents").update({ title: doc.title, content: doc.content, source: doc.source, category: doc.category }).eq("id", doc.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("documents").insert({ title: doc.title, content: doc.content, source: doc.source, category: doc.category });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      setEditing(null); setCreating(false);
      toast.success("Document saved");
    },
    onError: (e: Error) => toast.error("Save failed", { description: e.message }),
  });

  const filtered = useMemo(() =>
    docs.filter((d) =>
      (filter === "All" || d.category === filter) &&
      d.title.toLowerCase().includes(search.toLowerCase())
    ), [docs, search, filter]);

  const onDelete = (id: string) => {
    if (!confirm("Remove this document from the knowledge base?")) return;
    deleteMut.mutate(id);
  };

  return (
    <div className="px-10 py-10 max-w-[1240px] mx-auto">
      <PageHeader eyebrow="Knowledge Base" title="A library, kept tidy."
        subtitle="Documents the bot reads from. Edit a passage and the answers in chat improve the next time someone asks.">
        <button onClick={() => setCreating(true)}
          className="h-9 px-4 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium hover:bg-[hsl(var(--brand-hover))] transition-colors flex items-center gap-1.5">
          <Icon name="plus" size={13} strokeWidth={2.4} /> New document
        </button>
      </PageHeader>

      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex gap-1.5 flex-wrap">
          {["All", ...categories].map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                filter === c ? "bg-foreground text-background border-foreground" : "bg-card text-olive border-border hover:border-accent hover:text-accent"
              }`}>{c}</button>
          ))}
        </div>
        <div className="relative">
          <Icon name="search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents…"
            className="input-claude pl-9 w-[260px] h-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="card-elevated p-10 text-center text-stone text-[14px] animate-pulse">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="book" title={docs.length === 0 ? "Your library is unwritten." : "Nothing matches."}
          description={docs.length === 0 ? "Upload your first document. The bot has nothing to read yet." : "Try a different keyword or clear the filter."}
          action={docs.length === 0 ? (
            <button onClick={() => setCreating(true)} className="h-10 px-4 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium hover:bg-[hsl(var(--brand-hover))] flex items-center gap-1.5">
              <Icon name="plus" size={13} strokeWidth={2.4} /> Add document
            </button>
          ) : (
            <button onClick={() => { setSearch(""); setFilter("All"); }} className="text-[13px] text-accent font-medium">Clear filters</button>
          )} />
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_120px_140px] gap-0 px-5 py-3 border-b border-border bg-background/60 text-[10.5px] uppercase tracking-wider text-stone font-medium">
            <div>Document</div><div>Category</div><div>Source</div><div className="text-right">Actions</div>
          </div>
          {filtered.map((d, i) => (
            <div key={d.id} className={`row-hover grid grid-cols-[1fr_120px_120px_140px] gap-0 items-center px-5 py-3.5 ${i < filtered.length - 1 ? "border-b border-border" : ""}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-secondary border border-border-warm flex items-center justify-center text-olive shrink-0">
                  <Icon name="file" size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium text-foreground truncate">{d.title}</div>
                  <div className="text-[11px] text-stone mt-0.5">{new Date(d.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <span className="badge-warm bg-accent/10 text-accent w-fit">{d.category || "General"}</span>
              <div className="text-[12px] text-stone truncate">{d.source || "—"}</div>
              <div className="flex justify-end gap-1">
                <button onClick={() => setEditing(d)} className="w-8 h-8 rounded-md text-stone hover:bg-secondary hover:text-foreground flex items-center justify-center transition-colors">
                  <Icon name="edit" size={14} />
                </button>
                <button onClick={() => onDelete(d.id)} className="w-8 h-8 rounded-md text-stone hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors">
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <DocEditor doc={editing} onClose={() => { setEditing(null); setCreating(false); }} onSave={(d) => saveMut.mutate(d)} saving={saveMut.isPending} />
      )}
    </div>
  );
}

function DocEditor({ doc, onClose, onSave, saving }: { doc: Doc | null; onClose: () => void; onSave: (d: Partial<Doc>) => void; saving: boolean }) {
  const [title, setTitle] = useState(doc?.title ?? "");
  const [category, setCategory] = useState(doc?.category ?? "FAQ");
  const [source, setSource] = useState(doc?.source ?? "");
  const [content, setContent] = useState(doc?.content ?? "");

  const handleSave = () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    onSave({ id: doc?.id, title, category, source, content });
  };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-50 bg-foreground/45 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in">
      <div className="bg-card border border-border-warm rounded-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto p-7 animate-slide-up">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-serif-display text-[26px] text-foreground leading-tight">{doc ? "Refine the passage" : "A new entry"}</h2>
            <p className="text-[13px] text-stone mt-1">Updates publish to the bot immediately.</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg text-stone hover:bg-secondary flex items-center justify-center"><Icon name="close" size={16} /></button>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-claude" placeholder="e.g. Refund Policy" />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-claude">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Source <span className="text-stone font-normal">(optional)</span></span>
            <input value={source} onChange={(e) => setSource(e.target.value)} className="input-claude" placeholder="e.g. onboarding, faq" />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Content</span>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10}
              placeholder="Write the source-of-truth here. Markdown is welcome."
              className="input-claude font-serif-display text-[15px] leading-relaxed resize-y" />
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-border">
          <button onClick={onClose} className="h-10 px-4 rounded-lg bg-card border border-border text-olive text-[13px] font-medium hover:bg-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="h-10 px-4 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium hover:bg-[hsl(var(--brand-hover))] flex items-center gap-1.5 disabled:opacity-60">
            <Icon name="save" size={13} strokeWidth={2} /> {saving ? "Saving…" : "Save document"}
          </button>
        </div>
      </div>
    </div>
  );
}
