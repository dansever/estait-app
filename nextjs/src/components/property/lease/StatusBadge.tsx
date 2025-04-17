import { Badge } from "@/components/ui/badge";

export type Status =
  | "vacant"
  | "occupied"
  | "maintenance"
  | "listed"
  | "unknown";

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "vacant":
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
          Vacant
        </Badge>
      );
    case "occupied":
      return <Badge className="bg-green-600 text-white">Occupied</Badge>;
    case "maintenance":
      return <Badge className="bg-orange-600 text-white">Maintenance</Badge>;
    case "listed":
      return <Badge className="bg-blue-600 text-white">Listed</Badge>;
    default:
      return <Badge className="bg-gray-400 text-white">Unknown</Badge>;
  }
}
