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
const TENANTS_TABLE = "tenants";
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

type TenantRow = Database["public"]["Tables"][typeof TENANTS_TABLE]["Row"];
type TenantInsert =
  Database["public"]["Tables"][typeof TENANTS_TABLE]["Insert"];
type TenantUpdate =
  Database["public"]["Tables"][typeof TENANTS_TABLE]["Update"];

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

  /* STORAGE & FILE METHODS */
  async uploadFile(
    userId: string,
    propertyId: string,
    file: File
  ): Promise<{ data: any; error: PostgrestError | null }> {
    const filename = file.name.replace(/[^0-9a-zA-Z!\-_.*'()]/g, "_");
    const fullPath = `${userId}/${propertyId}/${filename}`;
    return this.client.storage.from(STORAGE_BUCKET).upload(fullPath, file);
  }

  async getFiles(
    userId: string,
    propertyId: string
  ): Promise<{ data: any[] | null; error: PostgrestError | null }> {
    const path = `${userId}/${propertyId}`;
    return this.client.storage.from(STORAGE_BUCKET).list(path);
  }

  async deleteFile(
    userId: string,
    propertyId: string,
    filename: string
  ): Promise<{ data: any; error: PostgrestError | null }> {
    const fullPath = `${userId}/${propertyId}/${filename}`;
    return this.client.storage.from(STORAGE_BUCKET).remove([fullPath]);
  }

  async shareFile(
    userId: string,
    propertyId: string,
    filename: string,
    timeInSec: number,
    forDownload: boolean = false
  ): Promise<{
    data: { signedUrl: string } | null;
    error: PostgrestError | null;
  }> {
    const fullPath = `${userId}/${propertyId}/${filename}`;
    return this.client.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(fullPath, timeInSec, { download: forDownload });
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

  async removeProperty(userId: string, propertyId: string): Promise<boolean> {
    const { error } = await this.client
      .from(PROPERTIES_TABLE)
      .delete()
      .eq("user_id", userId)
      .eq("id", propertyId);
    handleSupabaseError(error);
    return true;
  }

  /* LEASE METHODS */
  async addLease(
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

  async getCurrentLeaseByProperty(propertyId: string): Promise<LeaseRow[]> {
    const { data, error } = await this.client
      .from(LEASES_TABLE)
      .select("*")
      .eq("property_id", propertyId)
      .eq("is_lease_active", true);
    handleSupabaseError(error);
    return data || [];
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

  async removeLease(leaseId: string): Promise<boolean> {
    const { error } = await this.client
      .from(LEASES_TABLE)
      .delete()
      .eq("id", leaseId);
    handleSupabaseError(error);
    return true;
  }

  /* ADDRESS METHODS */
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

  // Get the address for a specific property
  async getAddressForProperty(propertyId: string): Promise<AddressRow | null> {
    const { data, error } = await this.client
      .from(PROPERTIES_TABLE)
      .select(`address:address_id (*)`)
      .eq("id", propertyId)
      .single();
    handleSupabaseError(error);
    return data?.address || null;
  }

  /* TENANT METHODS */
  async addTenant(tenant: TenantInsert): Promise<TenantRow | null> {
    const { data, error } = await this.client
      .from(TENANTS_TABLE)
      .insert(tenant)
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async getTenant(tenantId: string): Promise<TenantRow | null> {
    const { data, error } = await this.client
      .from(TENANTS_TABLE)
      .select("*")
      .eq("id", tenantId)
      .single();
    handleSupabaseError(error);
    return data;
  }

  async updateTenant(
    tenantId: string,
    update: TenantUpdate
  ): Promise<TenantRow | null> {
    const { data, error } = await this.client
      .from(TENANTS_TABLE)
      .update(update)
      .eq("id", tenantId)
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async removeTenant(tenantId: string): Promise<boolean> {
    const { error } = await this.client
      .from(TENANTS_TABLE)
      .delete()
      .eq("id", tenantId);
    handleSupabaseError(error);
    return true;
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

  async removeTask(taskId: string): Promise<boolean> {
    const { error } = await this.client
      .from(MAINTENANCE_TASKS_TABLE)
      .delete()
      .eq("id", taskId);
    handleSupabaseError(error);
    return true;
  }

  /* DOCUMENT METHODS */
  async addDocument(document: DocumentInsert): Promise<DocumentRow | null> {
    const { data, error } = await this.client
      .from(DOCUMENTS_TABLE)
      .insert(document)
      .select()
      .single();
    handleSupabaseError(error);
    return data;
  }

  async getDocumentsByProperty(propertyId: string): Promise<DocumentRow[]> {
    const { data, error } = await this.client
      .from(DOCUMENTS_TABLE)
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });
    handleSupabaseError(error);
    return data || [];
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

  async removeDocument(
    userId: string,
    propertyId: string,
    documentId: string,
    filename: string
  ): Promise<boolean> {
    const { error: storageError } = await this.deleteFile(
      userId,
      propertyId,
      filename
    );
    handleSupabaseError(storageError);

    const { error: dbError } = await this.client
      .from(DOCUMENTS_TABLE)
      .delete()
      .eq("user_id", userId)
      .eq("id", documentId);
    handleSupabaseError(dbError);
    return true;
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

  async removeTransaction(transactionId: string): Promise<boolean> {
    const { error } = await this.client
      .from(TRANSACTIONS_TABLE)
      .delete()
      .eq("id", transactionId);
    handleSupabaseError(error);
    return true;
  }
}
