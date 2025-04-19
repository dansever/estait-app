import { useState, useCallback } from "react";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export function FileUploader({ onFileUpload, isUploading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    onFileUpload(fileList[0]);
    event.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFileUpload(files[0]);
      }
    },
    [onFileUpload]
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

  return (
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
          {isUploading
            ? "Uploading..."
            : isDragging
            ? "Drop your file here"
            : "Drag and drop or click to select a file (max 50mb)"}
        </span>
        <input
          type="file"
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
          aria-label="Upload file"
        />
      </label>
    </div>
  );
}
