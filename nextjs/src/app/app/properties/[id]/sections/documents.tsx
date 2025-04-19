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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FileManager from "@/components/property/documents/FileManager";
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

  // Initialize document types from the enum in Constants
  useEffect(() => {
    // Use the document_type enum values from Constants
    const documentTypeEnum = Constants.public.Enums.document_type;

    // Transform the enum values into a format similar to what we'd get from the database
    const formattedDocumentTypes = documentTypeEnum.map((type, index) => ({
      id: String(index + 1),
      name: type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      value: type,
    }));

    setDocumentTypes(formattedDocumentTypes);
  }, []);

  // Fetch all documents related to this property
  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoadingDocuments(true);

        const supabase = await createSPASassClient();

        // Fetch documents for this property
        const { data, error } = await supabase
          .from("documents")
          .select(
            `
            id,
            title as name,
            file_url,
            created_at,
            file_size,
            document_types!inner(id, name)
          `
          )
          .eq("property_id", propertyId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Map the data to match the Document interface
        const formattedData = (data || []).map((doc) => ({
          id: doc.id,
          name: doc.name,
          file_url: doc.file_url,
          created_at: doc.created_at,
          file_size: doc.file_size,
          document_type: doc.document_types
            ? {
                id: doc.document_types.id,
                name: doc.document_types.name,
              }
            : null,
        }));

        setDocuments(formattedData);
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

      {/* File Management Section - Now using the reusable component */}
      {user?.id && <FileManager userId={user.id} propertyId={propertyId} />}
    </div>
  );
}
