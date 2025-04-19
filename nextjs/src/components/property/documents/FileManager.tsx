"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Share2,
  Trash2,
  Loader2,
  FileIcon,
  AlertCircle,
  CheckCircle,
  Copy,
  Edit,
} from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import { FileObject } from "@supabase/storage-js";
import { Constants } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileManagerProps {
  userId: string;
  propertyId: string;
  title?: string;
  description?: string;
}

interface FileData {
  name: string;
  documentType: string;
}

export default function FileManager({
  userId,
  propertyId,
  title = "File Management",
  description = "Upload, download, and share your files",
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
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<string>("other");

  // Edit file state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<string | null>(null);
  const [editFileData, setEditFileData] = useState<FileData>({
    name: "",
    documentType: "other",
  });

  // Get document types from Constants
  const documentTypeEnum = Constants.public.Enums.document_type;

  useEffect(() => {
    if (userId && propertyId) {
      loadFiles();
    }
  }, [userId, propertyId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError("");
      const supabase = await createSPASassClient();
      const { data, error } = await supabase.getFiles(userId, propertyId);

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      setError("Failed to load files");
      console.error("Error loading files:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      // Guard against missing propertyId
      if (!propertyId) {
        setError("Cannot upload file: Property ID is missing");
        return;
      }

      setUploading(true);
      setError("");

      // Create a filename with document type as prefix
      const fileExtension = file.name.split(".").pop() || "";
      const baseFileName = file.name.split(".").slice(0, -1).join(".");
      const documentTypePrefix = selectedDocumentType || "other";
      const newFileName = `${documentTypePrefix}_${baseFileName}.${fileExtension}`;

      const supabase = await createSPASassClient();
      const { error } = await supabase.uploadFile(
        userId,
        propertyId,
        newFileName,
        file,
        selectedDocumentType
      );

      if (error) throw error;

      await loadFiles();
      setSuccess("File uploaded successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to upload file");
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    handleFileUpload(fileList[0]);
    event.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [userId, propertyId, selectedDocumentType]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDownload = async (filename: string) => {
    try {
      setError("");
      const supabase = await createSPASassClient();
      const { data, error } = await supabase.shareFile(
        userId,
        propertyId,
        filename,
        60,
        true
      );

      if (error) throw error;

      window.open(data.signedUrl, "_blank");
    } catch (err) {
      setError("Failed to download file");
      console.error("Error downloading file:", err);
    }
  };

  const handleShare = async (filename: string) => {
    try {
      setError("");
      const supabase = await createSPASassClient();
      const { data, error } = await supabase.shareFile(
        userId,
        propertyId,
        filename,
        24 * 60 * 60
      );

      if (error) throw error;

      setShareUrl(data.signedUrl);
      setSelectedFile(filename);
    } catch (err) {
      setError("Failed to generate share link");
      console.error("Error sharing file:", err);
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    try {
      setError("");
      const supabase = await createSPASassClient();
      const { error } = await supabase.deleteFile(
        userId,
        propertyId,
        fileToDelete
      );

      if (error) throw error;

      await loadFiles();
      setSuccess("File deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete file");
      console.error("Error deleting file:", err);
    } finally {
      setShowDeleteDialog(false);
      setFileToDelete(null);
    }
  };

  const handleEdit = (filename: string) => {
    const shortName = filename.split("/").pop() || "";

    // Parse document type from filename
    let documentType = "other";
    let baseName = shortName;

    // Try to extract document type prefix
    const parts = shortName.split("_");
    if (parts.length > 1 && documentTypeEnum.includes(parts[0] as any)) {
      documentType = parts[0];
      // Remove document type prefix and underscore to get base name
      baseName = shortName.substring(documentType.length + 1);
    }

    setFileToEdit(filename);
    setEditFileData({
      name: baseName,
      documentType: documentType,
    });
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    if (!fileToEdit) return;

    try {
      setError("");
      const supabase = await createSPASassClient();

      // Get the original filename path and parts
      const originalFilePath = fileToEdit;
      const originalFilename = originalFilePath.split("/").pop() || "";

      // Create new filename with updated document type prefix
      const fileExtension = originalFilename.includes(".")
        ? `.${originalFilename.split(".").pop()}`
        : "";

      const newFileName = `${editFileData.documentType}_${editFileData.name}${fileExtension}`;

      // Rename the file in storage and update document record
      const { error } = await supabase.renameFile(
        userId,
        propertyId,
        originalFilePath,
        newFileName,
        editFileData.documentType
      );

      if (error) throw error;

      await loadFiles();
      setSuccess("File updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update file");
      console.error("Error updating file:", err);
    } finally {
      setShowEditDialog(false);
      setFileToEdit(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy to clipboard");
    }
  };

  // Function to format document type for display
  const formatDocumentType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Function to extract document type from filename
  const getDocumentTypeFromFilename = (filename: string) => {
    const parts = filename.split("/").pop()?.split("_") || [];
    // Cast parts[0] to the proper type (string from the enum)
    if (
      parts.length > 1 &&
      documentTypeEnum.includes(parts[0] as (typeof documentTypeEnum)[number])
    ) {
      return formatDocumentType(parts[0]);
    }
    return "Other";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="document-type" className="text-sm font-medium">
              Document Type
            </label>
            <Select
              value={selectedDocumentType}
              onValueChange={setSelectedDocumentType}
            >
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypeEnum.map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatDocumentType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center w-full">
            <label
              className={`w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border-2 cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary-500 border-dashed bg-primary-50"
                  : "border-primary-600 hover:bg-primary-50"
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8" />
              <span className="mt-2 text-base">
                {uploading
                  ? "Uploading..."
                  : isDragging
                  ? "Drop your file here"
                  : "Drag and drop or click to select a file (max 50mb)"}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleInputChange}
                disabled={uploading}
                aria-label="Upload file"
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          {!loading && files.length === 0 ? (
            <p className="text-center text-gray-500">No files uploaded yet</p>
          ) : (
            files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-4 bg-white rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-6 w-6 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {file.name.split("/").pop()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getDocumentTypeFromFilename(file.name)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(file.name)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Edit"
                    aria-label={`Edit ${file.name.split("/").pop()}`}
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(file.name)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Download"
                    aria-label={`Download ${file.name.split("/").pop()}`}
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleShare(file.name)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Share"
                    aria-label={`Share ${file.name.split("/").pop()}`}
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setFileToDelete(file.name);
                      setShowDeleteDialog(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                    aria-label={`Delete ${file.name.split("/").pop()}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Share Dialog */}
        <Dialog
          open={Boolean(shareUrl)}
          onOpenChange={() => {
            setShareUrl("");
            setSelectedFile(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share {selectedFile?.split("/").pop()}</DialogTitle>
              <DialogDescription>
                Copy the link below to share your file. This link will expire in
                24 hours.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-2 border rounded bg-gray-50"
                aria-label="Share URL"
              />
              <button
                onClick={() => copyToClipboard(shareUrl)}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative"
                aria-label="Copy to clipboard"
              >
                <Copy className="h-5 w-5" />
                {showCopiedMessage && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit File Dialog */}
        <Dialog
          open={showEditDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowEditDialog(false);
              setFileToEdit(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit File</DialogTitle>
              <DialogDescription>
                Update the file name and document type
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="edit-file-name" className="text-sm font-medium">
                  File Name
                </label>
                <Input
                  id="edit-file-name"
                  value={editFileData.name}
                  onChange={(e) =>
                    setEditFileData({ ...editFileData, name: e.target.value })
                  }
                  placeholder="Enter file name"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="edit-document-type"
                  className="text-sm font-medium"
                >
                  Document Type
                </label>
                <Select
                  value={editFileData.documentType}
                  onValueChange={(value) =>
                    setEditFileData({ ...editFileData, documentType: value })
                  }
                >
                  <SelectTrigger id="edit-document-type">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypeEnum.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatDocumentType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setFileToEdit(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" onClick={handleEditSave}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete File</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this file? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
