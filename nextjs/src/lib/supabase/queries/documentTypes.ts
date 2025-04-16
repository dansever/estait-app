import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type DocumentType = Database["public"]["Tables"]["document_types"]["Row"];
type NewDocumentType = Database["public"]["Tables"]["document_types"]["Insert"];
type UpdateDocumentType =
  Database["public"]["Tables"]["document_types"]["Update"] & { id: string };

// Get all document types
export async function getAllDocumentTypes(): Promise<DocumentType[]> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("document_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// Get a document type by ID
export async function getDocumentTypeById(
  id: string
): Promise<DocumentType | null> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("document_types")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new document type
export async function createDocumentType(
  payload: NewDocumentType
): Promise<DocumentType> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("document_types")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a document type
export async function updateDocumentType(
  update: UpdateDocumentType
): Promise<DocumentType> {
  const { id, ...fields } = update;
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("document_types")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a document type
export async function deleteDocumentType(id: string): Promise<void> {
  const client = await createSPASassClient();
  const { error } = await client.from("document_types").delete().eq("id", id);

  if (error) throw error;
}
