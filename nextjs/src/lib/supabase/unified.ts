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
  async uploadFile(userID: string, propertyId: string, file: File) {
    if (!userID || !propertyId) {
      throw new Error(
        "User ID and Property ID are required for file operations"
      );
    }

    // Verify authentication
    const {
      data: { session },
    } = await this.client.auth.getSession();
    if (!session) {
      throw new Error("Authentication required for file operations");
    }

    // Ensure userID is the authenticated user's ID to match RLS policy
    const authenticatedUserId = session.user.id;
    if (userID !== authenticatedUserId) {
      console.warn(
        "Adjusting userID to match authenticated user for RLS policy compliance"
      );
      userID = authenticatedUserId;
    }

    const safeFilename = file.name.replace(/[^0-9a-zA-Z!\-_.*'()]/g, "_");
    // Format path to match RLS policy pattern: must start with auth.uid
    const path = `${userID}/${propertyId}/${safeFilename}`;

    try {
      console.log(`Uploading file to path: ${path}`);
      return this.client.storage.from("files").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  async getFiles(userId: string, propertyId: string) {
    if (!userId || !propertyId) {
      throw new Error(
        "User ID and Property ID are required for file operations"
      );
    }

    // Verify authentication and ensure userId matches authenticated user
    const {
      data: { session },
    } = await this.client.auth.getSession();
    if (!session) {
      throw new Error("Authentication required for file operations");
    }

    // Ensure userId is the authenticated user's ID to match RLS policy
    const authenticatedUserId = session.user.id;
    if (userId !== authenticatedUserId) {
      console.warn(
        "Adjusting userId to match authenticated user for RLS policy compliance"
      );
      userId = authenticatedUserId;
    }

    const path = `${userId}/${propertyId}`;
    try {
      return this.client.storage.from("files").list(path);
    } catch (error) {
      console.error("List files error:", error);
      throw error;
    }
  }

  async deleteFile(
    userID: string,
    propertyId: string,
    filenameToDelete: string
  ) {
    if (!userID || !propertyId) {
      throw new Error(
        "User ID and Property ID are required for file operations"
      );
    }

    // Verify authentication and ensure userID matches authenticated user
    const {
      data: { session },
    } = await this.client.auth.getSession();
    if (!session) {
      throw new Error("Authentication required for file operations");
    }

    // Ensure userID is the authenticated user's ID to match RLS policy
    const authenticatedUserId = session.user.id;
    if (userID !== authenticatedUserId) {
      console.warn(
        "Adjusting userID to match authenticated user for RLS policy compliance"
      );
      userID = authenticatedUserId;
    }

    const path = `${userID}/${propertyId}/${filenameToDelete}`;
    try {
      return this.client.storage.from("files").remove([path]);
    } catch (error) {
      console.error("Delete file error:", error);
      throw error;
    }
  }

  async shareFile(
    userID: string,
    propertyId: string,
    filename: string,
    timeInSec: number,
    forDownload = false
  ) {
    if (!userID || !propertyId) {
      throw new Error(
        "User ID and Property ID are required for file operations"
      );
    }

    // Verify authentication and ensure userID matches authenticated user
    const {
      data: { session },
    } = await this.client.auth.getSession();
    if (!session) {
      throw new Error("Authentication required for file operations");
    }

    // Ensure userID is the authenticated user's ID to match RLS policy
    const authenticatedUserId = session.user.id;
    if (userID !== authenticatedUserId) {
      console.warn(
        "Adjusting userID to match authenticated user for RLS policy compliance"
      );
      userID = authenticatedUserId;
    }

    const path = `${userID}/${propertyId}/${filename}`;
    try {
      return this.client.storage
        .from("files")
        .createSignedUrl(path, timeInSec, {
          download: forDownload,
        });
    } catch (error) {
      console.error("Share file error:", error);
      throw error;
    }
  }
}
