import { useState } from "react";
import { Icon } from "@/components/Icon";
import { ChatMessage } from "@/lib/services/chats";

interface AnswerEditorProps {
  chat: ChatMessage;
  onClose: () => void;
  onSave: (id: string, correctedAnswer: string) => void;
  isSaving: boolean;
}

export function AnswerEditor({ chat, onClose, onSave, isSaving }: AnswerEditorProps) {
  const [correctedAnswer, setCorrectedAnswer] = useState(chat.answer);

  return (
    <div 
      className="fixed inset-0 z-50 bg-foreground/45 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border-warm rounded-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto p-8 animate-slide-up shadow-2xl">
        <header className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-serif-display text-[26px] text-foreground leading-tight">Refine Response</h2>
            <p className="text-[13px] text-stone mt-1.5">
              Correcting this answer helps calibrate the AI for future interactions.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-xl text-stone hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <section className="bg-secondary/30 rounded-xl p-5 mb-6 border border-border/50">
          <h3 className="text-[10px] uppercase tracking-widest text-stone font-bold mb-2">User Query</h3>
          <p className="text-[15px] text-foreground leading-relaxed font-medium">{chat.question}</p>
        </section>

        <section className="space-y-2">
          <label htmlFor="corrected-answer" className="text-[12px] font-bold text-dark-warm ml-1">Corrected Answer</label>
          <textarea 
            id="corrected-answer"
            value={correctedAnswer} 
            onChange={(e) => setCorrectedAnswer(e.target.value)} 
            rows={8} 
            className="input-claude resize-y leading-relaxed font-serif-display text-[16px] p-4 focus:ring-accent/20" 
            placeholder="Write the ideal response here..."
          />
        </section>

        <footer className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <button 
            onClick={onClose} 
            className="h-10 px-6 rounded-xl bg-card border border-border text-olive text-[13px] font-bold hover:bg-secondary transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={() => onSave(chat.id, correctedAnswer)} 
            disabled={isSaving || correctedAnswer === chat.answer}
            className="h-10 px-6 rounded-xl bg-accent text-accent-foreground text-[13px] font-bold hover:bg-[hsl(var(--brand-hover))] flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm"
          >
            {isSaving ? (
              <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Icon name="sparkle" size={13} strokeWidth={2.5} />
            )}
            {isSaving ? "Synchronizing..." : "Update & Calibrate"}
          </button>
        </footer>
      </div>
    </div>
  );
}
