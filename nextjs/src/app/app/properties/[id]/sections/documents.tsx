"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { usePropertyDetails } from "@/hooks/use-property-details";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Filter,
  Search,
  Plus,
  Info,
  FileIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileManager } from "@/components/FileManager";
import { toast } from "sonner";

export default function DocumentsSection({
  propertyId,
  isLoading,
  onDataChanged,
}: {
  propertyId: string;
  isLoading: boolean;
  onDataChanged?: () => Promise<void>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { property, refreshProperty } = usePropertyDetails(propertyId);

  // Document categories (can be expanded)
  const documentCategories = [
    { id: "all", label: "All Documents" },
    { id: "legal", label: "Legal Documents" },
    { id: "financial", label: "Financial Records" },
    { id: "maintenance", label: "Maintenance Reports" },
    { id: "lease", label: "Lease Agreements" },
    { id: "insurance", label: "Insurance Documents" },
    { id: "photos", label: "Photos" },
  ];

  // Sample document data (to be replaced with actual property documents)
  const documents = [
    {
      id: "1",
      name: "Purchase Agreement.pdf",
      category: "legal",
      size: "2.4 MB",
      uploaded: "2024-01-15",
      uploadedBy: "John Doe",
    },
    {
      id: "2",
      name: "Insurance Policy 2024.pdf",
      category: "insurance",
      size: "1.8 MB",
      uploaded: "2024-02-03",
      uploadedBy: "John Doe",
    },
    {
      id: "3",
      name: "Tenant Lease Agreement.pdf",
      category: "lease",
      size: "3.1 MB",
      uploaded: "2024-02-10",
      uploadedBy: "John Doe",
    },
    {
      id: "4",
      name: "Property Tax Statement 2023.pdf",
      category: "financial",
      size: "0.9 MB",
      uploaded: "2023-12-15",
      uploadedBy: "John Doe",
    },
    {
      id: "5",
      name: "Plumbing Repair Invoice.pdf",
      category: "maintenance",
      size: "0.7 MB",
      uploaded: "2024-03-05",
      uploadedBy: "John Doe",
    },
    {
      id: "6",
      name: "Property Photos - Living Room.zip",
      category: "photos",
      size: "15.2 MB",
      uploaded: "2023-11-20",
      uploadedBy: "John Doe",
    },
  ];

  // Get filtered documents based on search query and selected category
  const getFilteredDocuments = () => {
    let filtered = documents;

    // Filter by category if not showing all
    if (activeTab !== "all") {
      filtered = filtered.filter((doc) => doc.category === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredDocuments = getFilteredDocuments();

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle document upload
  const handleUploadDocument = () => {
    // Implement document upload functionality
    toast.info("Document upload feature will be implemented soon.");
  };

  // Handle document download
  const handleDownloadDocument = (docId: string) => {
    // Implement document download functionality
    toast.success(`Document ${docId} download started.`);
  };

  // Handle document deletion
  const handleDeleteDocument = (docId: string) => {
    // Implement document deletion functionality
    toast.success(`Document ${docId} successfully deleted.`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">Property Documents</h2>
        <Button onClick={handleUploadDocument}>
          <Upload className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search documents..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem>Date (Newest First)</DropdownMenuItem>
            <DropdownMenuItem>Date (Oldest First)</DropdownMenuItem>
            <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
            <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
            <DropdownMenuItem>Size (Largest First)</DropdownMenuItem>
            <DropdownMenuItem>Size (Smallest First)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Document Categories Tabs */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-7 h-auto">
          {documentCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="py-2">
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab content - shared view for all tabs */}
        <TabsContent value={activeTab} className="mt-6">
          {filteredDocuments.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Category</th>
                        <th className="text-left p-4">Size</th>
                        <th className="text-left p-4">Uploaded</th>
                        <th className="text-left p-4">Uploaded By</th>
                        <th className="text-right p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center">
                              <FileIcon className="h-5 w-5 mr-2 text-blue-500" />
                              <span className="font-medium">{doc.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">
                              {doc.category.charAt(0).toUpperCase() +
                                doc.category.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-4">{doc.size}</td>
                          <td className="p-4">{formatDate(doc.uploaded)}</td>
                          <td className="p-4">{doc.uploadedBy}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadDocument(doc.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500"
                                onClick={() => handleDeleteDocument(doc.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : searchQuery ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <Search className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-1">
                No matching documents
              </h3>
              <p className="text-gray-500 mb-4">
                No documents match your search criteria. Try using different
                keywords.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <FileText className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-1">No documents found</h3>
              <p className="text-gray-500 mb-4">
                This property doesn't have any{" "}
                {activeTab !== "all"
                  ? documentCategories
                      .find((c) => c.id === activeTab)
                      ?.label.toLowerCase()
                  : "documents"}{" "}
                yet.
              </p>
              <Button onClick={handleUploadDocument}>
                <Plus className="h-4 w-4 mr-2" /> Upload Document
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Optional: Drag-and-Drop File Upload Area */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-xs text-gray-400">
              Supported files: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP (up to
              25MB)
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleUploadDocument}
            >
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Manager Integration */}
      {/* <FileManager 
        propertyId={propertyId} 
        onFileChange={() => {
          if (onDataChanged) {
            onDataChanged();
          }
        }} 
      /> */}
    </div>
  );
}
