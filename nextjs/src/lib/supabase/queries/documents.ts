import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type Document = Database["public"]["Tables"]["documents"]["Row"];
type NewDocument = Database["public"]["Tables"]["documents"]["Insert"];
type UpdateDocument = Database["public"]["Tables"]["documents"]["Update"] & {
  id: string;
};

// Get all documents, with optional filters
export async function getDocuments(filter?: {
  property_id?: string;
  tenant_id?: string;
  lease_id?: string;
  type_id?: string;
  uploaded_by?: string;
}): Promise<Document[]> {
  const client = await createSPASassClient();
  let query = client
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (filter?.property_id) query = query.eq("property_id", filter.property_id);
  if (filter?.tenant_id) query = query.eq("tenant_id", filter.tenant_id);
  if (filter?.lease_id) query = query.eq("lease_id", filter.lease_id);
  if (filter?.type_id) query = query.eq("type_id", filter.type_id);
  if (filter?.uploaded_by) query = query.eq("uploaded_by", filter.uploaded_by);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Get document by ID
export async function getDocumentById(id: string): Promise<Document | null> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new document
export async function createDocument(payload: NewDocument): Promise<Document> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("documents")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a document
export async function updateDocument(
  update: UpdateDocument
): Promise<Document> {
  const { id, ...fields } = update;
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("documents")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a document
export async function deleteDocument(id: string): Promise<void> {
  const client = await createSPASassClient();
  const { error } = await client.from("documents").delete().eq("id", id);

  if (error) throw error;
}
