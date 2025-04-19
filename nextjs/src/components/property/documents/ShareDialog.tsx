import { useState } from "react";
import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string | null;
  shareUrl: string;
}

export function ShareDialog({
  isOpen,
  onClose,
  fileName,
  shareUrl,
}: ShareDialogProps) {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {fileName?.split("/").pop()}</DialogTitle>
          <DialogDescription>
            Copy the link below to share your file. This link will expire in 24
            hours.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 p-2 border rounded bg-gray-50"
            aria-label="Share URL"
          />
          <button
            onClick={() => copyToClipboard(shareUrl)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative"
            aria-label="Copy to clipboard"
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
  );
}
