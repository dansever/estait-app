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
  async uploadFile(
    userId: string,
    propertyId: string,
    filename: string,
    file: File,
    documentType?: string
  ) {
    const safeFilename = filename.replace(/[^0-9a-zA-Z!\-_.*'()]/g, "_");
    const path = `${userId}/${propertyId}/${safeFilename}`;

    // Upload file to storage
    const uploadResult = await this.client.storage
      .from("files")
      .upload(path, file);

    // If upload was successful and document type is provided, store file metadata
    if (!uploadResult.error && documentType) {
      // Get the public URL for the file
      const {
        data: { publicUrl },
      } = this.client.storage.from("files").getPublicUrl(path);

      // Create a record in the documents table
      await this.client.from("documents").insert({
        file_name: safeFilename,
        file_url: publicUrl,
        document_type: documentType,
        uploaded_by: userId,
        property_id: propertyId,
        mime_type: file.type,
        "file_size(mb)": +(file.size / (1024 * 1024)).toFixed(2),
      });
    }

    return uploadResult;
  }

  async getFiles(userId: string, propertyId: string) {
    return this.client.storage.from("files").list(`${userId}/${propertyId}`);
  }

  async deleteFile(userId: string, propertyId: string, filename: string) {
    // Extract just the filename part without the folder path
    const baseFilename = filename.split("/").pop() || filename;
    const path = `${userId}/${propertyId}/${baseFilename}`;

    // Delete the document record if it exists
    if (baseFilename) {
      await this.client
        .from("documents")
        .delete()
        .eq("file_name", baseFilename)
        .eq("uploaded_by", userId)
        .eq("property_id", propertyId);
    }

    // Then delete the file from storage
    return this.client.storage.from("files").remove([path]);
  }

  async renameFile(
    userId: string,
    propertyId: string,
    oldFilePath: string,
    newFileName: string,
    documentType: string
  ) {
    try {
      // Extract just the filename part without the folder path
      const oldBaseName = oldFilePath.split("/").pop() || oldFilePath;
      const fullOldPath = `${userId}/${propertyId}/${oldBaseName}`;
      const fullNewPath = `${userId}/${propertyId}/${newFileName}`;

      // 1. First download the old file
      const { data: fileData, error: downloadError } = await this.client.storage
        .from("files")
        .download(fullOldPath);

      if (downloadError) throw downloadError;
      if (!fileData) throw new Error("Could not download file");

      // Convert Blob to File with the new name
      const file = new File([fileData], newFileName, {
        type: fileData.type,
      });

      // 2. Upload the file with new name
      const { error: uploadError } = await this.client.storage
        .from("files")
        .upload(fullNewPath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 3. Delete the old file
      const { error: deleteError } = await this.client.storage
        .from("files")
        .remove([fullOldPath]);

      if (deleteError) throw deleteError;

      // 4. Update or create document record in the database
      if (oldBaseName) {
        // Get public URL for the new file
        const {
          data: { publicUrl },
        } = this.client.storage.from("files").getPublicUrl(fullNewPath);

        // Check if there's a document record for the old file
        const { data: existingDocs, error: queryError } = await this.client
          .from("documents")
          .select()
          .eq("file_name", oldBaseName)
          .eq("uploaded_by", userId)
          .eq("property_id", propertyId);

        if (queryError) throw queryError;

        if (existingDocs && existingDocs.length > 0) {
          // Update existing document record
          const { error: updateError } = await this.client
            .from("documents")
            .update({
              file_name: newFileName,
              file_url: publicUrl,
              document_type: documentType,
              updated_at: new Date().toISOString(),
            })
            .eq("file_name", oldBaseName)
            .eq("uploaded_by", userId)
            .eq("property_id", propertyId);

          if (updateError) throw updateError;
        } else {
          // Create new document record if one doesn't exist
          const { error: insertError } = await this.client
            .from("documents")
            .insert({
              file_name: newFileName,
              file_url: publicUrl,
              document_type: documentType,
              uploaded_by: userId,
              property_id: propertyId,
              mime_type: file.type,
              "file_size(mb)": +(file.size / (1024 * 1024)).toFixed(2),
            });

          if (insertError) throw insertError;
        }
      }

      return { error: null };
    } catch (error) {
      console.error("Error renaming file:", error);
      return { error };
    }
  }

  async shareFile(
    userId: string,
    propertyId: string,
    filename: string,
    timeInSec: number,
    forDownload = false
  ) {
    // Extract just the filename part without the folder path
    const baseFilename = filename.split("/").pop() || filename;
    const path = `${userId}/${propertyId}/${baseFilename}`;

    return this.client.storage.from("files").createSignedUrl(path, timeInSec, {
      download: forDownload,
    });
  }
}
