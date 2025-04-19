"use client";

import { useEffect, useState } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createSPASassClient } from "@/lib/supabase/client";
import { Constants } from "@/lib/types";
import {
  File,
  FileText,
  Search,
  ChevronDown,
  Upload,
  Filter,
  Download,
  Share,
  Trash2,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FileManager from "@/components/property/documents/FileManager";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

interface PropertyDocumentsProps {
  propertyId: string;
  isLoading: boolean;
}

interface Document {
  id: string;
  name: string;
  file_url: string;
  created_at: string;
  file_size_kb?: number;
  document_type?: string;
}

export default function DocumentSection({
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

  // Initialize document types from the enum in Constants
  useEffect(() => {
    const documentTypeEnum =
      Constants.public.Enums.document_type ||
      Constants.public.Enums.DOCUMENT_TYPE;

    const formattedDocumentTypes = Object.values(documentTypeEnum).map(
      (type, index) => ({
        id: String(index + 1),
        name: type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        value: type,
      })
    );

    setDocumentTypes(formattedDocumentTypes);
  }, []);

  // Fetch all documents related to this property
  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);

      const supabase = await createSPASassClient();

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((doc) => ({
        id: doc.id,
        name: doc.file_name,
        file_url: doc.file_url,
        created_at: doc.created_at,
        file_size_kb: doc.file_size_kb,
        document_type: doc.document_type,
      }));

      setDocuments(formattedData);
    } catch (err) {
      console.error("Error fetching documents:", err);
      toast.error("Failed to load documents");
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchDocuments();
    }
  }, [propertyId]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      !selectedType ||
      documentTypes.find((t) => t.value === doc.document_type)?.id ===
        selectedType;

    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

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
    window.open(document.file_url, "_blank");
  };

  const handleShare = async (document: Document) => {
    try {
      setSelectedDocument(document);
      setShareUrl(document.file_url);
      await copyToClipboard(document.file_url);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Error sharing document:", error);
      toast.error("Failed to share document");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      throw err;
    }
  };

  const handleDelete = async (document: Document) => {
    try {
      const supabase = await createSPASassClient();

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);

      if (error) throw error;

      toast.success("Document deleted successfully");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
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
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-bold flex items-center">
          <FileText className="h-5 w-5 mr-2" /> Property Documents
        </h2>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      </div>

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

      {loadingDocuments ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="p-4 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  {getDocumentIcon(doc.name)}
                  <div>
                    <h3 className="font-medium text-sm line-clamp-1">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(doc.created_at)} ·{" "}
                      {doc.file_size_kb
                        ? `${formatFileSize(doc.file_size_kb * 1024)}`
                        : "Unknown size"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {documentTypes.find((t) => t.value === doc.document_type)
                        ?.name || "Other"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(doc)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare(doc)}
                    title="Share"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-lg font-medium">No documents found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery || selectedType
              ? "Try adjusting your filters"
              : "Upload your first document"}
          </p>
        </div>
      )}

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <button
            onClick={() => setShowUploadDialog(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {user && (
            <FileManager
              userId={user.id}
              propertyId={propertyId}
              title="Upload Property Documents"
              description="Upload and organize your property-related files"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
