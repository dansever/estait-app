"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { FileService } from "@/lib/services/FileService";
import { FileObject } from "@supabase/storage-js";
import { ErrorAlert } from "./alerts/ErrorAlert";
import { SuccessAlert } from "./alerts/SuccessAlert";
import { FileUploader } from "./FileUploader";
import { FileList } from "./FileList";
import { ShareDialog } from "./ShareDialog";
import { DeleteDialog } from "./DeleteDialog";

interface FileManagerProps {
  userId: string;
  propertyId: string;
  title?: string;
  description?: string;
  onFileChange?: () => Promise<void>;
}

export default function FileManager({
  userId,
  propertyId,
  title = "File Management",
  description = "Upload, download, and share your files",
  onFileChange,
}: FileManagerProps) {
  // File management state
  const [files, setFiles] = useState<FileObject[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (userId && propertyId) {
      loadFiles();
    }
  }, [userId, propertyId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError("");
      const files = await FileService.getFiles(userId, propertyId);
      setFiles(files);
    } catch (err) {
      setError("Failed to load files");
      console.error("Error loading files:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setError("");

      await FileService.uploadFile(userId, propertyId, file);
      await loadFiles();
      setSuccess("File uploaded successfully");

      // Notify parent component of file changes
      if (onFileChange) {
        await onFileChange();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to upload file");
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      setError("");
      const signedUrl = await FileService.getDownloadUrl(userId, propertyId, filename);
      window.open(signedUrl, "_blank");
    } catch (err) {
      setError("Failed to download file");
      console.error("Error downloading file:", err);
    }
  };

  const handleShare = async (filename: string) => {
    try {
      setError("");
      const signedUrl = await FileService.getShareUrl(userId, propertyId, filename);
      setShareUrl(signedUrl);
      setSelectedFile(filename);
    } catch (err) {
      setError("Failed to generate share link");
      console.error("Error sharing file:", err);
    }
  };

  const prepareDelete = (filename: string) => {
    setFileToDelete(filename);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    try {
      setError("");
      const filename = fileToDelete.split("/").pop() || "";
      await FileService.deleteFile(userId, propertyId, filename);
      await loadFiles();
      setSuccess("File deleted successfully");

      // Notify parent component of file changes
      if (onFileChange) {
        await onFileChange();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete file");
      console.error("Error deleting file:", err);
    }
  };

  const closeShareDialog = () => {
    setShareUrl("");
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ErrorAlert message={error} />
        <SuccessAlert message={success} />

        <FileUploader onFileUpload={handleFileUpload} isUploading={uploading} />

        <FileList
          files={files}
          loading={loading}
          onDownload={handleDownload}
          onShare={handleShare}
          onDelete={prepareDelete}
        />

        <ShareDialog
          isOpen={Boolean(shareUrl)}
          onClose={closeShareDialog}
          fileName={selectedFile}
          shareUrl={shareUrl}
        />

        <DeleteDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
        />
      </CardContent>
    </Card>
  );
}
