import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, FileText } from "lucide-react";
import { Lease } from "./lease-utils";

interface LeaseHistoryCardProps {
  lease: Lease | null;
}

export default function LeaseHistoryCard({ lease }: LeaseHistoryCardProps) {
  if (!lease) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <History className="h-5 w-5 mr-2" /> Lease History
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <p className="text-gray-500">View past leases and amendment history</p>
        <Button
          variant="outline"
          className="mt-3 w-full text-left justify-start"
        >
          <FileText className="h-4 w-4 mr-2" /> View Lease History
        </Button>
      </CardContent>
    </Card>
  );
}
