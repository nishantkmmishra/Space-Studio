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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[220px] bg-card border border-border rounded-3xl animate-pulse" />
          ))}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <article 
            key={doc.id} 
            className="bg-card border border-border rounded-3xl p-7 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveDocument(doc)}
                  className="w-8 h-8 rounded-xl bg-background border border-border text-stone hover:text-foreground flex items-center justify-center transition-all shadow-sm"
                >
                  <Icon name="edit" size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="w-8 h-8 rounded-xl bg-background border border-border text-stone hover:text-destructive flex items-center justify-center transition-all shadow-sm"
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-stone group-hover:text-primary transition-colors border border-border/50">
                <Icon name="file" size={24} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">
                  {doc.category || "General"}
                </span>
                <h3 className="text-[15px] font-black text-foreground truncate">{doc.title}</h3>
              </div>
            </div>

            <p className="text-[13px] text-stone font-medium leading-relaxed line-clamp-3 mb-6 opacity-80">
              {doc.content.substring(0, 150)}...
            </p>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Icon name="sparkle" size={12} className="text-primary" />
                <span className="text-[11px] font-bold text-stone">RAG Ready</span>
              </div>
              <time className="text-[11px] font-mono text-stone opacity-40">
                {new Date(doc.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </time>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <main className="space-y-10 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-[24px] font-black tracking-tighter text-foreground">Source Material</h2>
          <p className="text-[13px] text-stone font-medium">Maintain the documents and data sources used to calibrate your AI response engine.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="h-12 px-8 rounded-2xl bg-foreground text-background text-[13px] font-black hover:opacity-90 transition-all flex items-center gap-3 shadow-2xl shadow-foreground/10"
        >
          <Icon name="plus" size={16} strokeWidth={3} /> 
          Index New Document
        </button>
      </div>

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
