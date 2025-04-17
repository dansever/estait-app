"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

// Define an enum for property status for better type safety
export enum PropertyStatus {
  VACANT = "vacant",
  RENTED = "rented",
}

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  address: string;
  status: PropertyStatus | "vacant" | "rented"; // Support both enum and string for backwards compatibility
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
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    router.push(`/app/properties/${id}`);
  };

  const handleImageError = () => {
    setImgError(true);
  };

  return (
    <Card
      className="cursor-pointer transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-green-500 hover:bg-primary-50 flex flex-col h-[360px]"
      onClick={handleClick}
    >
      {/* Image with error handling */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-md bg-gray-100">
        {!imgError ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gray-100">
            <Home className="h-12 w-12 text-gray-400" aria-hidden="true" />
            <span className="sr-only">Property image unavailable</span>
          </div>
        )}
      </div>

      {/* Card Header - Fixed height with truncated address */}
      <CardHeader className="flex-grow">
        <CardTitle className="line-clamp-1 pb-1 overflow-hidden">
          {title}
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardDescription className="line-clamp-2 h-10">
                {address}
              </CardDescription>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{address}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      {/* Card Content - Fixed height for price */}
      <CardContent>
        <p className="text-lg font-medium text-gray-900">
          ${rentalPrice} / month
        </p>
      </CardContent>

      {/* Card Footer with Status Badge positioned at bottom */}
      <CardFooter className="relative border-t pt-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">Tap to view details</p>
        {status === PropertyStatus.VACANT || status === "vacant" ? (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Vacant
          </Badge>
        ) : (
          <Badge className="bg-green-600">Rented</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
