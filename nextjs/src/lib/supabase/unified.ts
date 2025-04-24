import { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import { Database } from "@/lib/types";
import { STORAGE_BUCKET } from "@/lib/constants";

export enum ClientType {
  SERVER = "server",
  SPA = "spa",
}

const PROPERTIES_TABLE = "properties";
const LEASES_TABLE = "leases";
const ADDRESSES_TABLE = "addresses";
const MAINTENANCE_TASKS_TABLE = "maintenance_tasks";
const DOCUMENTS_TABLE = "documents";
const TRANSACTIONS_TABLE = "transactions";

type PropertyRow = Database["public"]["Tables"][typeof PROPERTIES_TABLE]["Row"];
type PropertyInsert =
  Database["public"]["Tables"][typeof PROPERTIES_TABLE]["Insert"];
type PropertyUpdate =
  Database["public"]["Tables"][typeof PROPERTIES_TABLE]["Update"];

type LeaseRow = Database["public"]["Tables"][typeof LEASES_TABLE]["Row"];
type LeaseInsert = Database["public"]["Tables"][typeof LEASES_TABLE]["Insert"];
type LeaseUpdate = Database["public"]["Tables"][typeof LEASES_TABLE]["Update"];

type AddressRow = Database["public"]["Tables"][typeof ADDRESSES_TABLE]["Row"];
type AddressInsert =
  Database["public"]["Tables"][typeof ADDRESSES_TABLE]["Insert"];
type AddressUpdate =
  Database["public"]["Tables"][typeof ADDRESSES_TABLE]["Update"];

type TaskRow =
  Database["public"]["Tables"][typeof MAINTENANCE_TASKS_TABLE]["Row"];
type TaskInsert =
  Database["public"]["Tables"][typeof MAINTENANCE_TASKS_TABLE]["Insert"];
type TaskUpdate =
  Database["public"]["Tables"][typeof MAINTENANCE_TASKS_TABLE]["Update"];

type DocumentRow = Database["public"]["Tables"][typeof DOCUMENTS_TABLE]["Row"];
type DocumentInsert =
  Database["public"]["Tables"][typeof DOCUMENTS_TABLE]["Insert"];
type DocumentUpdate =
  Database["public"]["Tables"][typeof DOCUMENTS_TABLE]["Update"];

type TransactionRow =
  Database["public"]["Tables"][typeof TRANSACTIONS_TABLE]["Row"];
type TransactionInsert =
  Database["public"]["Tables"][typeof TRANSACTIONS_TABLE]["Insert"];
type TransactionUpdate =
  Database["public"]["Tables"][typeof TRANSACTIONS_TABLE]["Update"];

// Basic error handling function
const handleSupabaseError = (error: PostgrestError | null) => {
  if (error) {
    console.error("Supabase Error:", error);
    throw error; // Re-throw the error for the calling function to handle
  }
};

export class SassClient {
  private client: SupabaseClient<Database>;
  private clientType: ClientType;

  constructor(client: SupabaseClient, clientType: ClientType) {
    this.client = client;
    this.clientType = clientType;
  }

  async loginEmail(
    email: string,
    password: string
  ): Promise<{
    data: { session: any; user: any } | null;
    error: PostgrestError | null;
  }> {
    return this.client.auth.signInWithPassword({ email, password });
  }

  async registerEmail(
    email: string,
    password: string
  ): Promise<{
    data: { session: any; user: any } | null;
    error: PostgrestError | null;
  }> {
    return this.client.auth.signUp({ email, password });
  }

  async exchangeCodeForSession(code: string): Promise<{
    data: { session: any; user: any } | null;
    error: PostgrestError | null;
  }> {
    return this.client.auth.exchangeCodeForSession(code);
  }

  async resendVerificationEmail(
    email: string
  ): Promise<{ data: any; error: PostgrestError | null }> {
    return this.client.auth.resend({ email, type: "signup" });
  }

  async logout(): Promise<void> {
    const { error } = await this.client.auth.signOut({ scope: "local" });
    handleSupabaseError(error);
    if (this.clientType === ClientType.SPA) {
      window.location.href = "/auth/login";
    }
  }

  getSupabaseClient(): SupabaseClient<Database> {
    return this.client;
  }

  /* FILES & DOCUMENT METHODS */
  /* Storage Utility Methods */
  private async uploadToStorage(
    userId: string,
    file: File,
    propertyId?: string
  ): Promise<string> {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Unsupported file type");
    }
    if (file.size > 50 * 1024 * 1024) {
      throw new Error("File exceeds 50MB limit");
    }
    if (!file.name) {
      throw new Error("File name is required");
    }
    const filename = file.name
      ? file.name.replace(/[^0-9a-zA-Z!\-_.*'()]/g, "_")
      : `file_${Date.now()}`;
    const child_folder = propertyId ?? "general";
    const fullpath = `${userId}/${child_folder}/${filename}`;

    const { error } = await this.client.storage
      .from(STORAGE_BUCKET)
      .upload(fullpath, file, { upsert: false });
    handleSupabaseError(error);

    return fullpath;
  }

  private async deleteFileFromStorage(fullpath: string): Promise<void> {
    const { error } = await this.client.storage
      .from(STORAGE_BUCKET)
      .remove([fullpath]);
    handleSupabaseError(error);
  }

  private async generateSignedUrl(
    fullPath: string,
    expiresInSec: number,
    forDownload: boolean = false
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(fullPath, expiresInSec, { download: forDownload });
    handleSupabaseError(error);
    return data?.signedUrl || "";
  }

  async getDocumentDownloadUrl(
    fullpath: string,
    expiresInSec: number = 60
  ): Promise<string> {
    return await this.generateSignedUrl(fullpath, expiresInSec);
  }

  /* Document Table Methods */
  private async createDocumentEntry(params: {
    userId: string;
    propertyId?: string;
    file: File;
    fullpath: string;
    documentType?: string;
  }): Promise<DocumentRow> {
    const { userId, propertyId, file, fullpath } = params;
    const { data, error } = await this.client
      .from(DOCUMENTS_TABLE)
      .insert({
        property_id: propertyId ?? null,
        uploaded_by: userId,
        file_name: file.name,
        file_size_kb: Math.round(file.size / 1024),
        mime_type: file.type,
        document_type: params.documentType ?? "other",
        storage_full_path: fullpath,
      })
      .select()
      .single();

    handleSupabaseError(error);
    return data;
  }

  private async deleteDocumentEntry(documentId: string): Promise<void> {
    const { error } = await this.client
      .from(DOCUMENTS_TABLE)
      .delete()
      .eq("id", documentId);
    handleSupabaseError(error);
  }

  /* Public Files & Document Methods */
  async uploadFile(
    userId: string,
    file: File,
    propertyId?: string,
    documentType?: string
  ): Promise<DocumentRow> {
    const fullpath = await this.uploadToStorage(userId, file, propertyId);
    return await this.createDocumentEntry({
      userId,
      propertyId,
      file,
      fullpath,
      documentType,
    });
  }

  async deleteDocumentAndFile(documentId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from(DOCUMENTS_TABLE)
      .select("storage_full_path, uploaded_by")
      .eq("id", documentId)
      .single();
    handleSupabaseError(error);

    if (!data?.storage_full_path) throw new Error("File path not found");
    if (!data?.uploaded_by) throw new Error("Invalid user ownership");

    await this.deleteFileFromStorage(data.storage_full_path);
    await this.deleteDocumentEntry(documentId);
    return true;
  }

  async listStorageFiles(
    userId: string,
    propertyId?: string
  ): Promise<{ data: any[] | null; error: PostgrestError | null }> {
    const child_folder = propertyId ?? "general";
    const path = `${userId}/${child_folder}`;
    return this.client.storage.from(STORAGE_BUCKET).list(path);
  }

  async shareFile(
    userId: string,
    filename: string,
    timeInSec: number,
    forDownload: boolean = false,
    propertyId?: string
  ): Promise<{
    data: { signedUrl: string } | null;
    error: PostgrestError | null;
  }> {
    const child_folder = propertyId ?? "general";
    const fullPath = `${userId}/${child_folder}/${filename}`;
    const signedUrl = await this.generateSignedUrl(
      fullPath,
      timeInSec,
      forDownload
    );
    return { data: { signedUrl }, error: null };
  }

  async updateDocument(
    documentId: string,
    update: DocumentUpdate
  ): Promise<DocumentRow | null> {
    const { data, error } = await this.client
      .from(DOCUMENTS_TABLE)
      .update(update)
      .eq("id", documentId)
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async getDocumentsByProperty(propertyId: string): Promise<DocumentRow[]> {
    const { data, error } = await this.client
      .from(DOCUMENTS_TABLE)
      .select("*")
      .eq("property_id", propertyId);
    handleSupabaseError(error);
    return data || [];
  }

  async deleteDocumentsOfProperty(propertyId: string): Promise<void> {
    try {
      const documents = await this.getDocumentsByProperty(propertyId);
      if (documents.length === 0) {
        console.log("[deleteDocumentsOfProperty]: No documents for property");
        return;
      }
      for (const doc of documents) {
        await this.deleteDocumentAndFile(doc.id);
      }
      console.log(
        "[deleteDocumentsOfProperty]: Deleted all documents and files for property"
      );
    } catch (err) {
      console.error("[deleteDocumentsOfProperty]: Unexpected error:", err);
      throw err;
    }
  }

  /* PROPERTIES METHODS */
  async createProperty(
    userId: string,
    property: PropertyInsert
  ): Promise<PropertyRow | null> {
    const { data, error } = await this.client
      .from(PROPERTIES_TABLE)
      .insert({ ...property, user_id: userId })
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async getPropertiesByUser(
    userId: string,
    order: string = "created_at"
  ): Promise<PropertyRow[]> {
    const { data, error } = await this.client
      .from(PROPERTIES_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order(order);
    handleSupabaseError(error);
    return data || [];
  }

  async getProperty(
    userId: string,
    propertyId: string
  ): Promise<PropertyRow | null> {
    const { data, error } = await this.client
      .from(PROPERTIES_TABLE)
      .select("*")
      .eq("user_id", userId)
      .eq("id", propertyId)
      .single();
    handleSupabaseError(error);
    return data;
  }

  async updateProperty(
    userId: string,
    propertyId: string,
    update: PropertyUpdate
  ): Promise<PropertyRow | null> {
    const { data, error } = await this.client
      .from(PROPERTIES_TABLE)
      .update(update)
      .eq("user_id", userId)
      .eq("id", propertyId)
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async deleteProperty(userId: string, propertyId: string): Promise<boolean> {
    await this.deleteAddressOfProperty(propertyId);
    await this.deleteLeasesOfProperty(propertyId);
    await this.deleteTasksOfProperty(propertyId);
    await this.deleteTransactionsOfProperty(propertyId);
    await this.deleteDocumentsOfProperty(propertyId);

    const { error } = await this.client
      .from(PROPERTIES_TABLE)
      .delete()
      .eq("user_id", userId)
      .eq("id", propertyId);
    handleSupabaseError(error);
    return true;
  }

  /* LEASE METHODS */
  async createLease(
    propertyId: string,
    lease: LeaseInsert
  ): Promise<LeaseRow | null> {
    const { data, error } = await this.client
      .from(LEASES_TABLE)
      .insert({ ...lease, property_id: propertyId })
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async getCurrentLeaseByProperty(
    propertyId: string
  ): Promise<LeaseRow | null> {
    const { data, error } = await this.client
      .from(LEASES_TABLE)
      .select("*")
      .eq("property_id", propertyId)
      .eq("is_lease_active", true)
      .limit(1)
      .maybeSingle();

    handleSupabaseError(error);
    return data || null;
  }

  async getPastLeasesByProperty(propertyId: string): Promise<LeaseRow[]> {
    const { data, error } = await this.client
      .from(LEASES_TABLE)
      .select("*")
      .eq("property_id", propertyId)
      .eq("is_lease_active", false)
      .lte("lease_end", new Date().toISOString())
      .order("lease_start", { ascending: false });
    handleSupabaseError(error);
    return data || [];
  }

  async updateLease(
    leaseId: string,
    update: LeaseUpdate
  ): Promise<LeaseRow | null> {
    const { data, error } = await this.client
      .from(LEASES_TABLE)
      .update(update)
      .eq("id", leaseId)
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async deleteLease(leaseId: string): Promise<boolean> {
    const { error } = await this.client
      .from(LEASES_TABLE)
      .delete()
      .eq("id", leaseId);
    handleSupabaseError(error);
    return true;
  }

  private async deleteLeasesOfProperty(propertyId: string): Promise<void> {
    const { data: leases, error } = await this.client
      .from(LEASES_TABLE)
      .select("id")
      .eq("property_id", propertyId);
    handleSupabaseError(error);
    for (const lease of leases ?? []) {
      await this.deleteLease(lease.id);
    }
  }

  /* ADDRESS METHODS */
  async createAddress(address: AddressInsert): Promise<AddressRow | null> {
    const { data, error } = await this.client
      .from(ADDRESSES_TABLE)
      .insert({ ...address })
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async addAddressToProperty(
    propertyId: string,
    address: AddressInsert
  ): Promise<AddressRow | null> {
    const { data, error } = await this.client
      .from(ADDRESSES_TABLE)
      .insert(address)
      .select()
      .single();
    handleSupabaseError(error);

    if (data) {
      // Update property to link to new address_id
      const { error: propertyError } = await this.client
        .from(PROPERTIES_TABLE)
        .update({ address_id: data.id })
        .eq("id", propertyId);
      handleSupabaseError(propertyError);
    }

    return data;
  }

  // Delete address of property
  async deleteAddressOfProperty(propertyId: string): Promise<void> {
    try {
      // Step 1: Get the address_id from the property
      const { data: property, error } = await this.client
        .from(PROPERTIES_TABLE)
        .select("address_id")
        .eq("id", propertyId)
        .single();
      handleSupabaseError(error);

      const addressId = property?.address_id;
      if (!addressId) return;

      // Step 2: Nullify the address_id in the property to avoid FK violation
      const { error: updateError } = await this.client
        .from(PROPERTIES_TABLE)
        .update({ address_id: null })
        .eq("id", propertyId);
      handleSupabaseError(updateError);

      // Step 3: Now safely delete the address
      const { error: deleteError } = await this.client
        .from(ADDRESSES_TABLE)
        .delete()
        .eq("id", addressId);
      handleSupabaseError(deleteError);

      console.log(
        "[deleteAddressOfProperty]: Deleted address for property:",
        propertyId
      );
    } catch (err) {
      console.error("[deleteAddressOfProperty]: Unexpected error:", err);
      throw err;
    }
  }

  async updateAddress(
    addressId: string,
    update: AddressUpdate
  ): Promise<AddressRow | null> {
    const { data, error } = await this.client
      .from(ADDRESSES_TABLE)
      .update(update)
      .eq("id", addressId)
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async getAddressForProperty(propertyId: string): Promise<AddressRow | null> {
    const { data: property, error: propertyError } = await this.client
      .from(PROPERTIES_TABLE)
      .select("address_id")
      .eq("id", propertyId)
      .single();
    handleSupabaseError(propertyError);

    if (!property?.address_id) return null;

    const { data: address, error: addressError } = await this.client
      .from(ADDRESSES_TABLE)
      .select("*")
      .eq("id", property.address_id)
      .single();
    handleSupabaseError(addressError);

    return address;
  }

  /* MAINTENANCE TASKS */
  async addTask(propertyId: string, task: TaskInsert): Promise<TaskRow | null> {
    const { data, error } = await this.client
      .from(MAINTENANCE_TASKS_TABLE)
      .insert({ ...task, property_id: propertyId })
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async getTasksByProperty(propertyId: string): Promise<TaskRow[]> {
    const { data, error } = await this.client
      .from(MAINTENANCE_TASKS_TABLE)
      .select("*")
      .eq("property_id", propertyId)
      .order("due_date", { ascending: true });
    handleSupabaseError(error);
    return data || [];
  }

  async updateTask(
    taskId: string,
    update: TaskUpdate
  ): Promise<TaskRow | null> {
    const { data, error } = await this.client
      .from(MAINTENANCE_TASKS_TABLE)
      .update(update)
      .eq("id", taskId)
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const { error } = await this.client
      .from(MAINTENANCE_TASKS_TABLE)
      .delete()
      .eq("id", taskId);
    handleSupabaseError(error);
    return true;
  }

  private async deleteTasksOfProperty(propertyId: string): Promise<void> {
    console.log(
      "[deleteTasksOfProperty]: Deleting tasks for property:",
      propertyId
    );
    const tasks = await this.getTasksByProperty(propertyId);
    for (const task of tasks) {
      await this.deleteTask(task.id);
    }
  }

  /* TRANSACTION METHODS */
  async addTransaction(
    transaction: TransactionInsert
  ): Promise<TransactionRow | null> {
    const { data, error } = await this.client
      .from(TRANSACTIONS_TABLE)
      .insert(transaction)
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async getTransactionsByProperty(
    propertyId: string
  ): Promise<TransactionRow[]> {
    const { data, error } = await this.client
      .from(TRANSACTIONS_TABLE)
      .select("*")
      .eq("property_id", propertyId)
      .order("transaction_date", { ascending: false });
    handleSupabaseError(error);
    return data || [];
  }

  async updateTransaction(
    transactionId: string,
    update: TransactionUpdate
  ): Promise<TransactionRow | null> {
    const { data, error } = await this.client
      .from(TRANSACTIONS_TABLE)
      .update(update)
      .eq("id", transactionId)
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async deleteTransaction(transactionId: string): Promise<boolean> {
    console.log("[deleteTransaction]: Removing transaction:", transactionId);
    const { error } = await this.client
      .from(TRANSACTIONS_TABLE)
      .delete()
      .eq("id", transactionId);
    handleSupabaseError(error);
    return true;
  }

  private async deleteTransactionsOfProperty(
    propertyId: string
  ): Promise<void> {
    console.log(
      "[deleteTransactionsOfProperty]: Deleting transactions for property:",
      propertyId
    );
    const transactions = await this.getTransactionsByProperty(propertyId);
    for (const transaction of transactions) {
      await this.deleteTransaction(transaction.id);
    }
  }
}
