"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Trash2,
  AlertCircle,
  CheckCircle,
  Copy,
  Pencil,
  Eye,
  FileText,
  Search,
  Filter,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createSPASassClient } from "@/lib/supabase/client";
import { Constants } from "@/lib/types";
import { Button } from "@/components/ui/button";
import LoadingThreeDotsJumping from "@/components/general/LoadingJumpingDots";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { DocumentRow } from "@/lib/enrichedPropertyType";

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
  const allTypes = Constants.public.Enums.DOCUMENT_TYPE;
  const [selectedTypes, setSelectedTypes] = useState<DocumentType[]>([
    ...allTypes,
  ]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setLoading(true);
      setError("");

      const supabase = await createSPASassClient();
      await supabase.uploadFile(user!.id, file, false, rawProperty?.id);
      await onRefresh();
      setSuccess("File uploaded successfully");
    } catch (err) {
      setError("Failed to upload file");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) handleFileUpload(file);
    target.value = "";
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
      setLoading(true);
      setError("");
      setShowDeleteDialog(false); // Close the dialog immediately so loading indicator can be seen
      const supabase = await createSPASassClient();
      await supabase.deleteDocumentAndFile(fileToDelete.id, rawProperty?.id);
      await onRefresh();
      setSuccess("File deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete file");
    } finally {
      setLoading(false);
      setFileToDelete(null);
    }
  };

  const handleUpdateDocumentType = async (
    docId: string,
    newType: DocumentType
  ) => {
    try {
      setLoading(true);
      setError("");
      const supabase = await createSPASassClient();
      await supabase.updateDocument(docId, {
        document_type: newType,
      });
      setSuccess(`Document type updated to ${formatDocType(newType)}`);
      await onRefresh();
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update document type");
    } finally {
      setLoading(false);
    }
  };

  const formatDocType = (type: DocumentType): string => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const filteredDocuments = useMemo(() => {
    if (!rawDocuments) return [];
    return rawDocuments.filter(
      (doc) =>
        selectedTypes.includes(doc.document_type) &&
        (searchQuery === "" ||
          doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.document_type.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [rawDocuments, selectedTypes, searchQuery]);

  // Simplified badge color scheme - green for selected, gray for unselected
  const getDocTypeColor = (type: DocumentType, isSelected: boolean = true) => {
    return isSelected
      ? "bg-green-100 text-green-800 hover:bg-green-200"
      : "bg-gray-100 text-gray-500 hover:bg-gray-200";
  };

  return (
    <div className="space-y-4 text-sm text-gray-700">
      <Card className="overflow-hidden border-0 shadow-md bg-white">
        <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-xl text-primary-800 font-heading font-medium">
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                Document Library
              </CardTitle>
              <CardDescription className="text-primary-700/80 mt-1">
                Manage and organize property-related documents
              </CardDescription>
            </div>
            <div className="hidden md:block">
              <Button
                onClick={() => document.getElementById("fileInput")?.click()}
                className="relative overflow-hidden group transition-all"
                leftIcon={<Upload className="h-4 w-4" />}
              >
                Upload Document
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  onChange={handleInputChange}
                  disabled={uploading}
                />
                <span className="absolute inset-0 w-full h-full bg-white/0 group-hover:bg-white/10 transition-all duration-300"></span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 pb-0"
            >
              <Alert variant="destructive" className="border-0 shadow-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 pb-0"
            >
              <Alert
                variant="success"
                className="border-0 shadow-sm bg-green-50"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {loading && (
            <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <div className="pointer-events-none p-0 m-0 bg-transparent shadow-none border-none">
                <LoadingThreeDotsJumping />
              </div>
            </div>
          )}

          <div className="md:hidden p-4">
            <Button
              onClick={() =>
                document.getElementById("fileInputMobile")?.click()
              }
              variant="default"
              leftIcon={<Upload />}
            >
              Upload Document
              <input
                id="fileInputMobile"
                type="file"
                className="hidden"
                onChange={handleInputChange}
                disabled={uploading}
              />
              <span className="absolute inset-0 w-full h-full bg-white/0 group-hover:bg-white/10 transition-all duration-300"></span>
            </Button>
          </div>

          <div className="p-4 flex flex-col sm:flex-row gap-2 items-center border-b border-gray-100">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="pl-10 h-10 bg-gray-50 border-gray-200 focus:border-primary-300 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-auto flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto gap-1 group h-10 border-gray-200 transition-all"
                  >
                    <Filter className="h-4 w-4 text-gray-500 group-hover:text-primary-600 transition-colors" />
                    <span>Filter Types</span>
                    {selectedTypes.length !== allTypes.length && (
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-primary-100 text-primary-800 hover:bg-primary-200"
                      >
                        {selectedTypes.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white">
                  <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Document Types</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setSelectedTypes([...allTypes])}
                    >
                      Select All
                    </Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-72">
                    <div className="p-1">
                      {allTypes.map((type) => {
                        const isSelected = selectedTypes.includes(type);
                        return (
                          <DropdownMenuCheckboxItem
                            key={type}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              setSelectedTypes((prev) =>
                                checked
                                  ? [...prev, type]
                                  : prev.filter((t) => t !== type)
                              );
                            }}
                            className="my-1"
                            // Prevent the menu from closing after selection
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Badge
                              className={`${getDocTypeColor(type, isSelected)} 
                                transition-colors w-full justify-center`}
                            >
                              {formatDocType(type)}
                            </Badge>
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <label
            className={`mx-6 mt-6 flex flex-col items-center px-6 py-8 bg-white rounded-xl tracking-wide cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-2 border-dashed border-primary-400 bg-primary-50 shadow-md"
                : "border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-gray-50"
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
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDragging
                  ? "bg-primary-100 text-primary-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <Upload
                className={`w-8 h-8 transition-all duration-300 ${
                  isDragging ? "text-primary-500" : "text-gray-400"
                }`}
              />
            </div>
            <div className="mt-4 text-center">
              <h3
                className={`text-lg font-medium mb-1 transition-colors ${
                  isDragging ? "text-primary-700" : "text-gray-700"
                }`}
              >
                {uploading
                  ? "Uploading..."
                  : isDragging
                  ? "Drop your file here"
                  : "Drag & drop your files here"}
              </h3>
              <p className="text-sm text-gray-500">
                or <span className="text-primary-600 font-medium">browse</span>{" "}
                to upload (max 50MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleInputChange}
              disabled={uploading}
            />
          </label>

          <div className="p-6">
            <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-gray-500" />
              Documents ({filteredDocuments.length})
            </h3>

            {!filteredDocuments || filteredDocuments.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  No documents yet
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {searchQuery
                    ? "No documents match your search. Try different keywords or clear your filters."
                    : "Upload your first document to get started. You can upload leases, invoices, maintenance reports, and more."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTypes([...allTypes]);
                    }}
                    className="mt-4"
                    size="sm"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredDocuments.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`hidden sm:flex h-10 w-10 rounded-lg flex-shrink-0 items-center justify-center ${getDocTypeColor(
                            doc.document_type
                          )}`}
                        >
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 group-hover:text-primary-800 transition-colors">
                              {doc.file_name}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge
                                  className={`${getDocTypeColor(
                                    doc.document_type
                                  )} transition-colors text-xs cursor-pointer px-2 flex items-center gap-1`}
                                >
                                  {formatDocType(doc.document_type)}
                                  <ChevronDown className="h-3 w-3 opacity-70" />
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="start"
                                className="w-48 bg-white"
                              >
                                <DropdownMenuLabel>
                                  Change Document Type
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <ScrollArea className="h-60">
                                  {allTypes.map((type) => (
                                    <DropdownMenuItem
                                      key={type}
                                      className={`flex items-center gap-2 my-0.5 ${
                                        type === doc.document_type
                                          ? "bg-primary-50"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handleUpdateDocumentType(doc.id, type)
                                      }
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Badge
                                        className={`${getDocTypeColor(
                                          type,
                                          type === doc.document_type
                                        )} transition-colors`}
                                      >
                                        {formatDocType(type)}
                                      </Badge>
                                      {type === doc.document_type && (
                                        <Check className="h-3.5 w-3.5 ml-auto text-primary-600" />
                                      )}
                                    </DropdownMenuItem>
                                  ))}
                                </ScrollArea>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>
                              Uploaded{" "}
                              {new Date(doc.created_at).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center mt-3 sm:mt-0 justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingDoc(doc);
                            setUpdatedName(doc.file_name);
                            setUpdatedType(doc.document_type);
                          }}
                          className="h-8 w-8 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
                          title="Edit document info"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            const supabase = await createSPASassClient();
                            const signedUrl =
                              await supabase.getDocumentDownloadUrl(
                                doc.storage_full_path,
                                60
                              );
                            if (signedUrl) {
                              window.open(signedUrl, "_blank");
                            } else {
                              setError("Failed to open document");
                            }
                          }}
                          className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          title="View document"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            try {
                              const supabase = await createSPASassClient();
                              const { data, error } = await supabase.shareFile(
                                user!.id,
                                doc.file_name,
                                60,
                                true,
                                rawProperty?.id
                              );

                              if (!data?.signedUrl) {
                                setError("Failed to generate download link");
                                return;
                              }

                              const link = document.createElement("a");
                              link.href = data.signedUrl;
                              link.download = doc.file_name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } catch (err) {
                              console.error("Download error:", err);
                              setError("Failed to download file");
                            }
                          }}
                          className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          title="Download document"
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFileToDelete(doc);
                            setShowDeleteDialog(true);
                          }}
                          className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50"
                          title="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <Dialog
            open={!!shareUrl}
            onOpenChange={() => {
              setShareUrl("");
              setSelectedFile(null);
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5 text-primary-500" />
                  Share {selectedFile}
                </DialogTitle>
                <DialogDescription>
                  Copy the link below to share this document.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="w-full pr-10 pl-3 py-2 border rounded-md bg-gray-50 text-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <button
                    onClick={() => copyToClipboard(shareUrl)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {showCopiedMessage && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 text-green-700 rounded text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Copied to clipboard!</span>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-600 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Delete Document
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-900">
                    {fileToDelete?.file_name}
                  </strong>
                  ? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleFileDelete}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingDoc} onOpenChange={() => setEditingDoc(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-primary-500" />
                  Edit Document
                </DialogTitle>
                <DialogDescription>
                  Update the document information below
                </DialogDescription>
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
                className="space-y-4 mt-4"
              >
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Document Name
                  </label>
                  <Input
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Document Type
                  </label>
                  <div className="relative">
                    <select
                      value={updatedType}
                      onChange={(e) =>
                        setUpdatedType(e.target.value as DocumentType)
                      }
                      className="w-full h-10 pl-3 pr-10 py-2 border border-input bg-background rounded-md appearance-none focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 text-sm"
                    >
                      {allTypes.map((type) => (
                        <option key={type} value={type}>
                          {type
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingDoc(null)}
                    className="border-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
