"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
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
} from "@/components/ui/dialog";
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
  Plus,
} from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import { FileObject } from "@supabase/storage-js";
import PropertyCard from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Define the Property interface based on the PropertyCard props
interface Property {
  id: string;
  image: string;
  title: string;
  address: string;
  status: "vacant" | "rented";
  rentalPrice: number;
}

export default function PropertiesPage() {
  const { user } = useGlobal();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState("");

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

  useEffect(() => {
    if (user?.id) {
      loadProperties();
      loadFiles();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      setPropertiesLoading(true);
      setPropertiesError("");
      const supabase = await createSPASassClient();

      // Fetch properties from the properties table
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user!.id);

      if (error) throw error;

      // Transform data to match PropertyCard props if needed
      const formattedProperties: Property[] =
        data?.map((property) => ({
          id: property.id,
          image: property.image_url || "/placeholder-property.jpg", // Fallback image
          title: property.title || property.name,
          address: property.address,
          status: property.status || "vacant",
          rentalPrice: property.rental_price || 0,
        })) || [];

      setProperties(formattedProperties);
    } catch (err) {
      setPropertiesError("Failed to load properties");
      console.error("Error loading properties:", err);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const handleAddProperty = () => {
    router.push("/app/properties/new");
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError("");
      const supabase = await createSPASassClient();
      const { data, error } = await supabase.getFiles(user!.id);

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      setError("Failed to load files");
      console.error("Error loading files:", err);
    } finally {
      setLoading(false);
    }
  };

  // File management handlers
  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setError("");

      console.log(user);

      const supabase = await createSPASassClient();
      const { error } = await supabase.uploadFile(user!.id!, file.name, file);

      if (error) throw error;

      await loadFiles();
      setSuccess("File uploaded successfully");
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

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
        user!.id!,
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
        user!.id!,
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
      const { error } = await supabase.deleteFile(user!.id!, fileToDelete);

      if (error) throw error;

      await loadFiles();
      setSuccess("File deleted successfully");
    } catch (err) {
      setError("Failed to delete file");
      console.error("Error deleting file:", err);
    } finally {
      setShowDeleteDialog(false);
      setFileToDelete(null);
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

  return (
    <div className="space-y-6 p-6">
      {/* Properties Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Properties</h2>
          <Button
            onClick={handleAddProperty}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        </div>

        {propertiesError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{propertiesError}</AlertDescription>
          </Alert>
        )}

        {propertiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-[320px] animate-pulse">
                <div className="h-48 w-full bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                image={property.image}
                title={property.title}
                address={property.address}
                status={property.status}
                rentalPrice={property.rentalPrice}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-10">
              <p className="text-gray-500 mb-4">No properties found</p>
              <Button onClick={handleAddProperty}>
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* File Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>File Management</CardTitle>
          <CardDescription>
            Upload, download, and share your files
          </CardDescription>
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
              />
            </label>
          </div>

          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            {files.length === 0 ? (
              <p className="text-center text-gray-500">No files uploaded yet</p>
            ) : (
              files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <FileIcon className="h-6 w-6 text-gray-400" />
                    <span className="font-medium">
                      {file.name.split("/").pop()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(file.name)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Download"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleShare(file.name)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Share"
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
                <DialogTitle>
                  Share {selectedFile?.split("/").pop()}
                </DialogTitle>
                <DialogDescription>
                  Copy the link below to share your file. This link will expire
                  in 24 hours.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 p-2 border rounded bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative"
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

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete File</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this file? This action cannot
                  be undone.
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
    </div>
  );
}
