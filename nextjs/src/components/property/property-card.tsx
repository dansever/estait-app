"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  address: string;
  status: "vacant" | "rented";
  rentalPrice: number;
}

export default function PropertyCard({
  id,
  image,
  title,
  address,
  status,
  rentalPrice,
}: PropertyCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/properties/${id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-md">
        <img src={image} alt={title} className="h-full w-full object-cover" />
        <Badge
          className={`absolute top-3 left-3 text-sm ${
            status === "vacant"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </Badge>
      </div>

      {/* Card Header */}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{address}</CardDescription>
      </CardHeader>

      {/* Card Content */}
      <CardContent>
        <p className="text-lg font-medium text-gray-900">
          ${rentalPrice} / month
        </p>
      </CardContent>

      {/* Card Footer */}
      <CardFooter>
        <p className="text-sm text-gray-500">Tap to view details</p>
      </CardFooter>
    </Card>
  );
}
