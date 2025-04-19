import { createSPASassClient } from "@/lib/supabase/client";
import { FileObject } from "@supabase/storage-js";

/**
 * Service class for handling file operations with Supabase storage
 */
export class FileService {
  /**
   * Get all files for a specific property
   */
  static async getFiles(
    userId: string,
    propertyId: string
  ): Promise<FileObject[]> {
    if (!userId || !propertyId) {
      throw new Error(
        "User ID and Property ID are required for file operations"
      );
    }

    const supabase = await createSPASassClient();
    const { data, error } = await supabase.getFiles(userId, propertyId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Upload a file to a property folder
   */
  static async uploadFile(
    userId: string,
    propertyId: string,
    file: File
  ): Promise<void> {
    if (!userId || !propertyId || !file) {
      throw new Error(
        "User ID, Property ID, and file are required for upload operations"
      );
    }

    const supabase = await createSPASassClient();
    const { error } = await supabase.uploadFile(userId, propertyId, file);

    if (error) throw error;
  }

  /**
   * Generate a download URL for a file
   */
  static async getDownloadUrl(
    userId: string,
    propertyId: string,
    filename: string
  ): Promise<string> {
    if (!userId || !propertyId || !filename) {
      throw new Error(
        "User ID, Property ID, and filename are required for download operations"
      );
    }

    const supabase = await createSPASassClient();
    const { data, error } = await supabase.shareFile(
      userId,
      propertyId,
      filename,
      60, // 60 seconds expiry
      true // for download
    );

    if (error) throw error;
    return data.signedUrl;
  }

  /**
   * Generate a sharing URL for a file
   */
  static async getShareUrl(
    userId: string,
    propertyId: string,
    filename: string,
    expiryInSeconds = 86400
  ): Promise<string> {
    if (!userId || !propertyId || !filename) {
      throw new Error(
        "User ID, Property ID, and filename are required for sharing operations"
      );
    }

    const supabase = await createSPASassClient();
    const { data, error } = await supabase.shareFile(
      userId,
      propertyId,
      filename,
      expiryInSeconds,
      false // not for download
    );

    if (error) throw error;
    return data.signedUrl;
  }

  /**
   * Delete a file
   */
  static async deleteFile(
    userId: string,
    propertyId: string,
    filename: string
  ): Promise<void> {
    if (!userId || !propertyId || !filename) {
      throw new Error(
        "User ID, Property ID, and filename are required for delete operations"
      );
    }

    const supabase = await createSPASassClient();
    const { error } = await supabase.deleteFile(userId, propertyId, filename);

    if (error) throw error;
  }
}
