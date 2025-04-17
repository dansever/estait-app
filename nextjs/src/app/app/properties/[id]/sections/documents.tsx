"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useGlobal } from "@/lib/context/GlobalContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  Download,
  File,
  FileText,
  FilePlus,
  Search,
  ChevronDown,
  Calendar,
  Upload,
  Trash2,
  Share2,
  Copy,
  Filter,
  FolderClosed,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FileManager from "@/components/FileManager";
import { Input } from "@/components/ui/input";

interface PropertyDocumentsProps {
  propertyId: string;
  isLoading: boolean;
}

interface Document {
  id: string;
  name: string;
  file_url: string;
  created_at: string;
  file_size?: number;
  document_type?: {
    id: string;
    name: string;
  } | null;
}

export default function PropertyDocuments({
  propertyId,
  isLoading,
}: PropertyDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const { user } = useGlobal();

  // Fetch all documents related to this property
  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoadingDocuments(true);

        const supabase = await createSPASassClient();
        // Fetch document types first
        const { data: typeData, error: typeError } = await supabase
          .from("document_types")
          .select("*");

        if (typeError) throw typeError;
        setDocumentTypes(typeData || []);

        // Fetch documents for this property
        const { data, error } = await supabase
          .from("documents")
          .select(
            `
            id,
            name,
            file_url,
            created_at,
            file_size,
            document_type:document_type_id (
              id,
              name
            )
          `
          )
          .eq("property_id", propertyId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setDocuments(data || []);
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoadingDocuments(false);
      }
    }

    if (propertyId) {
      fetchDocuments();
    }
  }, [propertyId]);

  // Filter documents based on search and type
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !selectedType || doc.document_type?.id === selectedType;

    return matchesSearch && matchesType;
  });

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Get document icon based on file extension
  const getDocumentIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase() || "";

    switch (extension) {
      case "pdf":
        return <File className="h-6 w-6 text-red-500" />;
      case "doc":
      case "docx":
        return <File className="h-6 w-6 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <File className="h-6 w-6 text-green-500" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <File className="h-6 w-6 text-purple-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleDownload = (document: Document) => {
    // Implement download functionality
    window.open(document.file_url, "_blank");
  };

  const handleShare = async (document: Document) => {
    try {
      setSelectedDocument(document);

      // In a real implementation, you might generate a sharing link here
      // This is a placeholder for demonstration purposes
      setShareUrl(document.file_url);
    } catch (error) {
      console.error("Error sharing document:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDelete = (document: Document) => {
    // Implement delete functionality
    console.log("Delete document:", document.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex space-x-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Documents header with upload button */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-bold flex items-center">
          <FileText className="h-5 w-5 mr-2" /> Property Documents
        </h2>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      </div>
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              {selectedType
                ? documentTypes.find((t) => t.id === selectedType)?.name ||
                  "Filter"
                : "Filter by Type"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => setSelectedType(null)}>
              All Documents
            </DropdownMenuItem>
            {documentTypes.map((type) => (
              <DropdownMenuItem
                key={type.id}
                onClick={() => setSelectedType(type.id)}
              >
                {type.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Documents list */}
      {loadingDocuments ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((document) => (
            <Card
              key={document.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-center">
                  {getDocumentIcon(document.name)}
                  <div className="ml-3">
                    <h3 className="font-medium text-sm line-clamp-1">
                      {document.name}
                    </h3>
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />{" "}
                        {formatDate(document.created_at)}
                      </span>
                      <span>{formatFileSize(document.file_size)}</span>
                    </div>
                    {document.document_type && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {document.document_type.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(document)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare(document)}
                    title="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(document)}
                    title="Delete"
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FolderClosed className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-1">No Documents Found</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">
              {searchQuery || selectedType
                ? "No documents match your search criteria."
                : "This property doesn't have any documents yet."}
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <FilePlus className="h-4 w-4 mr-2" /> Upload Document
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document for this property. Supported formats: PDF, DOC,
              DOCX, XLS, XLSX, JPG, PNG.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Select a document type</option>
                {documentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Document Name</label>
              <Input placeholder="Enter document name" />
            </div>

            <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                Drag and drop your file here, or click to browse
              </p>
              <input type="file" className="hidden" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
            >
              Cancel
            </Button>
            <Button>Upload Document</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Share Dialog */}
      <Dialog
        open={!!shareUrl}
        onOpenChange={() => {
          setShareUrl("");
          setSelectedDocument(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Copy the link below to share this document.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input type="text" value={shareUrl} readOnly className="flex-1" />
            <Button
              onClick={() => copyToClipboard(shareUrl)}
              className="relative"
            >
              <Copy className="h-4 w-4 mr-2" /> Copy
              {showCopiedMessage && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
                  Copied!
                </span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* File Management Section - Now using the reusable component */}
      {user?.id && <FileManager userId={user.id} />}
    </div>
  );
}
