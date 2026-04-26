import { useState } from "react";
import { Icon } from "@/components/Icon";
import { toast } from "sonner";
import { KnowledgeDocument, KnowledgeCategory } from "@/lib/services/documents";

const CATEGORIES: KnowledgeCategory[] = ["Onboarding", "FAQ", "Curriculum", "Policy", "Support", "General"];

interface DocumentEditorProps {
  document: KnowledgeDocument | null;
  onClose: () => void;
  onSave: (payload: Partial<KnowledgeDocument>) => void;
  isSaving: boolean;
}

export function DocumentEditor({
  document,
  onClose,
  onSave,
  isSaving,
}: DocumentEditorProps) {
  const [formData, setFormData] = useState({
    title: document?.title ?? "",
    category: document?.category ?? ("General" as KnowledgeCategory),
    source: document?.source ?? "",
    content: document?.content ?? "",
  });

  const isValid = formData.title.trim().length > 0 && formData.content.trim().length > 0;

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    onSave({ id: document?.id, ...formData });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/45 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border-warm rounded-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto p-7 animate-slide-up">
        <header className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-serif-display text-[26px] text-foreground leading-tight">
              {document ? "Refine entry" : "New entry"}
            </h2>
            <p className="text-[13px] text-stone mt-1">
              Changes are published to the AI engine immediately.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-stone hover:bg-secondary flex items-center justify-center transition-colors"
            aria-label="Close editor"
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="space-y-5">
          <section className="space-y-1.5">
            <label htmlFor="doc-title" className="text-[12px] font-medium text-dark-warm">Title</label>
            <input
              id="doc-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input-claude"
              placeholder="e.g., Refund Policy"
            />
          </section>

          <div className="grid grid-cols-2 gap-4">
            <section className="space-y-1.5">
              <label htmlFor="doc-category" className="text-[12px] font-medium text-dark-warm">Category</label>
              <select
                id="doc-category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as KnowledgeCategory }))}
                className="input-claude"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </section>

            <section className="space-y-1.5">
              <label htmlFor="doc-source" className="text-[12px] font-medium text-dark-warm">Source</label>
              <input
                id="doc-source"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className="input-claude"
                placeholder="e.g., wiki, support-v2"
              />
            </section>
          </div>

          <section className="space-y-1.5">
            <label htmlFor="doc-content" className="text-[12px] font-medium text-dark-warm">Content</label>
            <textarea
              id="doc-content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={12}
              placeholder="The source of truth. Markdown is supported."
              className="input-claude font-serif-display text-[15px] leading-relaxed resize-y min-h-[200px]"
            />
          </section>
        </div>

        <footer className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-lg bg-card border border-border text-olive text-[13px] font-medium hover:bg-secondary transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !isValid}
            className="h-10 px-5 rounded-lg bg-accent text-accent-foreground text-[13px] font-medium hover:bg-[hsl(var(--brand-hover))] flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {isSaving ? (
              <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Icon name="save" size={13} strokeWidth={2} />
            )}
            {isSaving ? "Publishing..." : "Save entry"}
          </button>
        </footer>
      </div>
    </div>
  );
}
