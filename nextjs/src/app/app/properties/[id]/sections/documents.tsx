"use client";

import React, { useState, useCallback } from "react";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { useGlobal } from "@/lib/context/GlobalContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Upload,
  Download,
  Share2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Copy,
  Pencil,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createSPASassClient } from "@/lib/supabase/client";
import { DocumentRow } from "@/lib/types"; // adjust import if needed
import { Constants } from "@/lib/types";

type DocumentType = (typeof Constants.public.Enums.DOCUMENT_TYPE)[number];

export default function FileManagement({
  data,
  onRefresh,
}: {
  data: EnrichedProperty;
  onRefresh: () => void;
}) {
  const { rawDocuments, rawProperty } = data;
  const { user } = useGlobal();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<DocumentRow | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRow | null>(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedType, setUpdatedType] = useState<DocumentType>("other");

  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 8000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setError("");

      const supabase = await createSPASassClient();
      await supabase.uploadFile(user!.id, file, rawProperty?.id);
      await onRefresh(); // refresh parent to get latest rawDocuments

      setSuccess("File uploaded successfully");
    } catch (err) {
      setError("Failed to upload file");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = "";
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  const handleDrag = useCallback((state: boolean) => {
    setIsDragging(state);
  }, []);

  const handleFileDelete = async () => {
    if (!fileToDelete || !user) return;

    try {
      setError("");
      const supabase = await createSPASassClient();

      await supabase.deleteDocument(fileToDelete.id);

      await onRefresh();
      setSuccess("File deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete file");
    } finally {
      setShowDeleteDialog(false);
      setFileToDelete(null);
    }
  };

  return (
    <div className="space-y-4 text-sm text-gray-700">
      <Card>
        <CardHeader>
          <CardTitle>File Management</CardTitle>
          <CardDescription>
            Upload and manage documents related to this property.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <label
            className={`w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border-2 cursor-pointer transition-colors ${
              isDragging
                ? "border-primary-500 border-dashed bg-primary-50"
                : "border-primary-600 hover:bg-primary-50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              handleDrag(true);
            }}
            onDragLeave={() => handleDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              handleDrag(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFileUpload(file);
            }}
          >
            <Upload className="w-8 h-8" />
            <span className="mt-2 text-base">
              {uploading
                ? "Uploading..."
                : isDragging
                ? "Drop your file here"
                : "Drag & drop or click to upload (max 50MB)"}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleInputChange}
              disabled={uploading}
            />
          </label>

          <div className="space-y-4">
            {!rawDocuments || rawDocuments.length === 0 ? (
              <p className="text-center text-gray-500">
                No documents uploaded yet.
              </p>
            ) : (
              rawDocuments.map((doc: DocumentRow) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border"
                >
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{doc.file_name}</span>
                    <span className="text-xs text-gray-500">
                      <Badge variant="secondary">{doc.document_type}</Badge>
                      Uploaded at {new Date(doc.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingDoc(doc);
                        setUpdatedName(doc.file_name);
                        setUpdatedType(doc.document_type);
                      }}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => window.open(doc.file_url, "_blank")}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(doc.file_name);
                        setShareUrl(doc.file_url);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setFileToDelete(doc);
                        setShowDeleteDialog(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Share Dialog */}
          <Dialog
            open={!!shareUrl}
            onOpenChange={() => {
              setShareUrl("");
              setSelectedFile(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share {selectedFile}</DialogTitle>
                <DialogDescription>
                  Copy the link below to share this document.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 p-2 border rounded bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-full relative"
                >
                  <Copy className="h-4 w-4" />
                  {showCopiedMessage && (
                    <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete File</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{" "}
                  <strong>{fileToDelete?.file_name}</strong>? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 rounded border text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileDelete}
                  className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Document Dialog */}
          <Dialog open={!!editingDoc} onOpenChange={() => setEditingDoc(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Document</DialogTitle>
              </DialogHeader>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!editingDoc) return;
                  try {
                    const supabase = await createSPASassClient();
                    await supabase.updateDocument(editingDoc.id, {
                      file_name: updatedName,
                      document_type: updatedType,
                    });

                    setSuccess("Document updated successfully");
                    setEditingDoc(null);
                    await onRefresh();
                  } catch (err) {
                    console.error("Update error:", err);
                    setError("Failed to update document");
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium">File Name</label>
                  <input
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Document Type
                  </label>
                  <select
                    value={updatedType}
                    onChange={(e) =>
                      setUpdatedType(e.target.value as DocumentType)
                    }
                    className="w-full border rounded px-2 py-1"
                  >
                    {Constants.public.Enums.DOCUMENT_TYPE.map((type) => (
                      <option key={type} value={type}>
                        {type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDoc(null)}
                    className="px-4 py-2 rounded border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
