import { supabase } from "../supabase";
import { PostgrestError } from "@supabase/supabase-js";

export type KnowledgeCategory = "Onboarding" | "FAQ" | "Curriculum" | "Policy" | "Support" | "General";

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  category: KnowledgeCategory;
  created_at: string;
}

export type CreateDocumentRequest = Omit<KnowledgeDocument, "id" | "created_at">;
export type UpdateDocumentRequest = Partial<CreateDocumentRequest> & { id: string };

export const documentService = {
  async getAll(): Promise<KnowledgeDocument[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as KnowledgeDocument[];
  },

  async create(doc: CreateDocumentRequest): Promise<void> {
    const { error } = await supabase.from("documents").insert(doc);
    if (error) throw error;
  },

  async update({ id, ...updates }: UpdateDocumentRequest): Promise<void> {
    const { error } = await supabase.from("documents").update(updates).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) throw error;
  },
};
