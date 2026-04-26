import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { chatService, ChatMessage, ChatRating } from "@/lib/services/chats";
import { AnswerEditor } from "@/components/chats/AnswerEditor";
import { toast } from "sonner";

type FilterType = "all" | "flagged";

export default function Chats() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedChat, setSelectedChat] = useState<ChatMessage | null>(null);

  // -- Data Sync -------------------------------------------------------------
  
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatService.getAll(),
  });

  useEffect(() => {
    return chatService.subscribeToNewChats(() => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });
  }, [queryClient]);

  // -- Mutations -------------------------------------------------------------

  const { mutate: updateChat, isPending: isUpdating } = useMutation({
    mutationFn: (payload: { id: string; rating?: ChatRating; answer?: string }) => 
      chatService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedChat(null);
      toast.success("Conversation state updated");
    },
    onError: (error) => toast.error("Update failed", { description: error.message }),
  });

  // -- Derived State ---------------------------------------------------------

  const filteredChats = useMemo(() => {
    if (activeFilter === "flagged") {
      return chats.filter((c) => c.rating === "wrong" || c.rating === null);
    }
    return chats;
  }, [chats, activeFilter]);

  const flaggedCount = useMemo(() => 
    chats.filter((c) => c.rating === "wrong" || c.rating === null).length, 
  [chats]);

  // -- Render Helpers --------------------------------------------------------

  return (
    <main className="max-w-[1100px] mx-auto px-8 py-12 space-y-10">
      <PageHeader 
        category="Audit" 
        title="Conversations"
        subtitle="Review and refine bot responses to improve AI accuracy and reasoning." 
      />

      <nav className="flex gap-2">
        <FilterButton 
          label="All Activity" 
          count={chats.length} 
          active={activeFilter === "all"} 
          onClick={() => setActiveFilter("all")} 
        />
        <FilterButton 
          label="Flagged / Review" 
          count={flaggedCount} 
          active={activeFilter === "flagged"} 
          onClick={() => setActiveFilter("flagged")} 
          urgent={flaggedCount > 0}
        />
      </nav>

      {isLoading ? (
        <div className="card-elevated p-20 text-center flex flex-col items-center gap-4">
          <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full" />
          <p className="text-stone text-[14px]">Retrieving chat history...</p>
        </div>
      ) : filteredChats.length === 0 ? (
        <EmptyState 
          icon="message" 
          title={chats.length === 0 ? "No activity recorded" : "Inbox cleared"}
          description={chats.length === 0 
            ? "When the bot starts interacting with users, logs will appear here." 
            : "Excellent. All current conversations have been reviewed."} 
        />
      ) : (
        <div className="space-y-6">
          {filteredChats.map((chat) => (
            <ChatCard 
              key={chat.id} 
              chat={chat} 
              onApprove={() => updateChat({ id: chat.id, rating: "good" })}
              onEdit={() => setSelectedChat(chat)}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      )}

      {selectedChat && (
        <AnswerEditor 
          chat={selectedChat} 
          onClose={() => setSelectedChat(null)}
          onSave={(id, answer) => updateChat({ id, answer, rating: "good" })} 
          isSaving={isUpdating} 
        />
      )}
    </main>
  );
}

// -- Subcomponents ---------------------------------------------------------

function FilterButton({ label, count, active, onClick, urgent }: any) {
  return (
    <button 
      onClick={onClick}
      className={`h-11 px-5 rounded-2xl text-[13px] font-bold border transition-all flex items-center gap-3 shadow-sm ${
        active 
          ? "bg-foreground text-background border-foreground" 
          : "bg-card text-stone border-border hover:border-accent/40 hover:text-accent"
      }`}
    >
      {label}
      <span className={`px-2 py-0.5 rounded-lg text-[10.5px] tabular-nums font-mono ${
        active 
          ? "bg-background/15" 
          : urgent ? "bg-accent/10 text-accent" : "bg-secondary"
      }`}>
        {count}
      </span>
    </button>
  );
}

function ChatCard({ chat, onApprove, onEdit, isUpdating }: { chat: ChatMessage; onApprove: () => void; onEdit: () => void; isUpdating: boolean }) {
  const isFlagged = chat.rating === "wrong" || chat.rating === null;
  
  return (
    <article className="card-elevated p-8 border-none shadow-sm hover:shadow-md transition-shadow group">
      <header className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground font-bold text-[14px] border border-border">
            {chat.user_tag?.[0].toUpperCase() ?? "?"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[14px] text-foreground font-bold">{chat.user_tag}</span>
              <span className="text-[11px] text-stone">via</span>
              <span className="font-mono text-[11px] text-accent font-bold">#{chat.channel}</span>
            </div>
            <time className="text-[11px] text-stone font-medium mt-1 block">
              {formatRelativeTime(chat.created_at)}
            </time>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isFlagged ? (
            <span className="px-3 py-1 rounded-full bg-accent/5 text-accent border border-accent/10 text-[10.5px] font-bold tracking-tight">
              Flagged
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-secondary text-olive text-[10.5px] font-bold tracking-tight">
              ✓ Reviewed
            </span>
          )}
        </div>
      </header>

      <div className="space-y-6">
        <section>
          <h4 className="text-[10px] uppercase tracking-widest text-stone font-bold mb-3">User Prompt</h4>
          <p className="font-serif-display text-[19px] text-foreground leading-snug">
            {chat.question}
          </p>
        </section>

        <section className="bg-secondary/20 rounded-2xl p-6 border border-border/40 relative">
          <h4 className="text-[10px] uppercase tracking-widest text-stone font-bold mb-3">Bot Response</h4>
          <p className="text-[15px] text-dark-warm leading-relaxed">
            {chat.answer}
          </p>
        </section>

        <footer className="flex justify-between items-center pt-2">
          <div className="flex gap-1.5 overflow-hidden">
            {chat.docs_used?.map((doc, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-background border border-border text-[11px] text-stone font-medium">
                {doc}
              </span>
            ))}
          </div>
          
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onApprove}
              disabled={isUpdating || chat.rating === "good"}
              className={`h-9 px-4 rounded-xl text-[12px] font-bold border transition-all flex items-center gap-2 ${
                chat.rating === "good" 
                  ? "bg-secondary text-olive border-transparent pointer-events-none" 
                  : "bg-background border-border text-foreground hover:bg-secondary"
              }`}
            >
              <Icon name="check" size={12} strokeWidth={3} />
              Approve
            </button>
            <button 
              onClick={onEdit}
              disabled={isUpdating}
              className="h-9 px-4 rounded-xl bg-accent text-accent-foreground text-[12px] font-bold hover:bg-[hsl(var(--brand-hover))] transition-all flex items-center gap-2 shadow-sm"
            >
              <Icon name="edit" size={13} strokeWidth={2.5} />
              Refine
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
}

// -- Utilities -------------------------------------------------------------

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
