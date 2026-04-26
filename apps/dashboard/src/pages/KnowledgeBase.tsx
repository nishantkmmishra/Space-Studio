import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { 
  documentService, 
  KnowledgeDocument, 
  KnowledgeCategory 
} from "@/lib/services/documents";
import { DocumentEditor } from "@/components/knowledge/DocumentEditor";

const CATEGORIES: (KnowledgeCategory | "All")[] = [
  "All", "Onboarding", "FAQ", "Curriculum", "Policy", "Support", "General"
];

export default function KnowledgeBase() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | "All">("All");
  const [activeDocument, setActiveDocument] = useState<KnowledgeDocument | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // -- Data Fetching ---------------------------------------------------------
  
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["knowledge-base"],
    queryFn: () => documentService.getAll(),
  });

  // -- Mutations -------------------------------------------------------------

  const { mutate: deleteDocument } = useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      toast.success("Entry removed from library");
    },
    onError: (error) => toast.error("Failed to delete entry", { description: error.message }),
  });

  const { mutate: saveDocument, isPending: isSaving } = useMutation({
    mutationFn: (payload: Partial<KnowledgeDocument>) => {
      return payload.id 
        ? documentService.update(payload as any) 
        : documentService.create(payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      closeEditor();
      toast.success("Entry synchronized");
    },
    onError: (error) => toast.error("Synchronization failed", { description: error.message }),
  });

  // -- Handlers --------------------------------------------------------------

  const closeEditor = () => {
    setActiveDocument(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Permanently remove this entry from the knowledge base?")) {
      deleteDocument(id);
    }
  };

  // -- Derived State ---------------------------------------------------------

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesCategory = activeCategory === "All" || doc.category === activeCategory;
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [documents, searchTerm, activeCategory]);

  // -- Render Helpers --------------------------------------------------------

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="card-elevated p-20 text-center flex flex-col items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full mb-4" />
          <p className="text-stone text-[14px]">Cataloging library...</p>
        </div>
      );
    }

    if (filteredDocuments.length === 0) {
      const isLibraryEmpty = documents.length === 0;
      return (
        <EmptyState 
          icon="book" 
          title={isLibraryEmpty ? "Your library is empty" : "No entries found"}
          description={isLibraryEmpty 
            ? "Start by adding your first source of truth for the AI engine." 
            : "Adjust your search or filters to find what you're looking for."
          }
          action={isLibraryEmpty ? (
            <button 
              onClick={() => setIsCreating(true)} 
              className="btn-primary flex items-center gap-2"
            >
              <Icon name="plus" size={14} /> Add first entry
            </button>
          ) : (
            <button 
              onClick={() => { setSearchTerm(""); setActiveCategory("All"); }} 
              className="text-accent text-[13px] font-medium hover:underline"
            >
              Reset filters
            </button>
          )} 
        />
      );
    }

    return (
      <div className="card-elevated overflow-hidden border-none shadow-sm">
        <header className="grid grid-cols-[1fr_140px_140px_100px] gap-4 px-6 py-4 bg-secondary/30 border-b border-border text-[11px] uppercase tracking-widest text-stone font-semibold">
          <div>Document</div>
          <div>Category</div>
          <div>Source</div>
          <div className="text-right">Actions</div>
        </header>

        <div className="divide-y divide-border/50">
          {filteredDocuments.map((doc) => (
            <article 
              key={doc.id} 
              className="grid grid-cols-[1fr_140px_140px_100px] gap-4 items-center px-6 py-4 hover:bg-secondary/20 transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-stone group-hover:text-accent transition-colors">
                  <Icon name="file" size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-medium text-foreground truncate">{doc.title}</h3>
                  <time className="text-[11px] text-stone tabular-nums">
                    Added {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                </div>
              </div>

              <div>
                <span className="badge-warm px-2.5 py-0.5 rounded-full bg-accent/5 text-accent border border-accent/10 text-[11px] font-medium">
                  {doc.category || "General"}
                </span>
              </div>

              <div className="text-[12.5px] text-stone truncate font-medium">
                {doc.source || "—"}
              </div>

              <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setActiveDocument(doc)}
                  className="w-8 h-8 rounded-lg text-stone hover:bg-background hover:text-foreground flex items-center justify-center border border-transparent hover:border-border transition-all"
                  title="Edit entry"
                >
                  <Icon name="edit" size={15} />
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="w-8 h-8 rounded-lg text-stone hover:bg-destructive/10 hover:text-destructive flex items-center justify-center border border-transparent hover:border-destructive/20 transition-all"
                  title="Delete entry"
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-12 space-y-8">
      <PageHeader 
        category="Knowledge Base" 
        title="Source Material"
        subtitle="Maintain the documents and data sources used to calibrate your AI response engine."
      >
        <button 
          onClick={() => setIsCreating(true)}
          className="h-10 px-5 rounded-xl bg-foreground text-background text-[13px] font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
        >
          <Icon name="plus" size={14} strokeWidth={2.5} /> 
          New Document
        </button>
      </PageHeader>

      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[12.5px] font-semibold border transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? "bg-foreground text-background border-foreground shadow-sm" 
                  : "bg-card text-stone border-border hover:border-accent/40 hover:text-accent"
              }`}
            >
              {cat}
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
            placeholder="Search entries..."
            className="input-claude pl-10 w-full md:w-[320px] h-10 bg-secondary/20 border-transparent hover:border-border focus:bg-background focus:border-accent/50 shadow-none transition-all" 
          />
        </div>
      </section>

      {renderContent()}

      {(activeDocument || isCreating) && (
        <DocumentEditor 
          document={activeDocument} 
          onClose={closeEditor} 
          onSave={(payload) => saveDocument(payload)} 
          isSaving={isSaving} 
        />
      )}
    </main>
  );
}
