import { FileObject } from "@supabase/storage-js";
import { FileIcon, Download, Share2, Trash2, Loader2 } from "lucide-react";

interface FileListProps {
  files: FileObject[];
  loading: boolean;
  onDownload: (filename: string) => Promise<void>;
  onShare: (filename: string) => Promise<void>;
  onDelete: (filename: string) => void;
}

export function FileList({
  files,
  loading,
  onDownload,
  onShare,
  onDelete,
}: FileListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (files.length === 0) {
    return <p className="text-center text-gray-500">No files uploaded yet</p>;
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div
          key={file.name}
          className="flex items-center justify-between p-4 bg-white rounded-lg border"
        >
          <div className="flex items-center space-x-3">
            <FileIcon className="h-6 w-6 text-gray-400" />
            <span className="font-medium">{file.name.split("/").pop()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDownload(file.name)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Download"
              aria-label={`Download ${file.name.split("/").pop()}`}
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => onShare(file.name)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title="Share"
              aria-label={`Share ${file.name.split("/").pop()}`}
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(file.name)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete"
              aria-label={`Delete ${file.name.split("/").pop()}`}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
