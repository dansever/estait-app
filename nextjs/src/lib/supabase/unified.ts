import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types";

export enum ClientType {
  SERVER = "server",
  SPA = "spa",
}

export class SassClient {
  private client: SupabaseClient<Database>;
  private clientType: ClientType;

  constructor(client: SupabaseClient<Database>, clientType: ClientType) {
    this.client = client;
    this.clientType = clientType;
  }

  from<TableName extends keyof Database["public"]["Tables"]>(table: TableName) {
    return this.client.from(table);
  }

  getSupabaseClient() {
    return this.client;
  }

  // Auth methods
  async loginEmail(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  async registerEmail(email: string, password: string) {
    return this.client.auth.signUp({ email, password });
  }

  async exchangeCodeForSession(code: string) {
    return this.client.auth.exchangeCodeForSession(code);
  }

  async resendVerificationEmail(email: string) {
    return this.client.auth.resend({ email, type: "signup" });
  }

  async logout() {
    const { error } = await this.client.auth.signOut({ scope: "local" });
    if (error) throw error;
    if (this.clientType === ClientType.SPA) {
      window.location.href = "/auth/login";
    }
  }

  // Storage helpers
  async uploadFile(myId: string, filename: string, file: File) {
    const safeFilename = filename.replace(/[^0-9a-zA-Z!\-_.*'()]/g, "_");
    const path = `${myId}/${safeFilename}`;
    return this.client.storage.from("files").upload(path, file);
  }

  async getFiles(myId: string) {
    return this.client.storage.from("files").list(myId);
  }

  async deleteFile(myId: string, filename: string) {
    const path = `${myId}/${filename}`;
    return this.client.storage.from("files").remove([path]);
  }

  async shareFile(
    myId: string,
    filename: string,
    timeInSec: number,
    forDownload = false
  ) {
    const path = `${myId}/${filename}`;
    return this.client.storage.from("files").createSignedUrl(path, timeInSec, {
      download: forDownload,
    });
  }
}
