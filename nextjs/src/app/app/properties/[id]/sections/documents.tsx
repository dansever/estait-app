"use client";

import { useEffect, useState } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { Skeleton } from "@/components/ui/skeleton";
import FileManager from "@/components/property/documents/FileManager";
import { FileText } from "lucide-react";

interface PropertyDocumentsProps {
  propertyId: string;
  isLoading: boolean;
  onDataChanged?: () => Promise<void>;
}

export default function DocumentSection({
  propertyId,
  isLoading,
  onDataChanged,
}: PropertyDocumentsProps) {
  const { user } = useGlobal();

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
      </div>

      {user && (
        <FileManager
          userId={user.id}
          propertyId={propertyId}
          onFileChange={onDataChanged}
        />
      )}
    </div>
  );
}
