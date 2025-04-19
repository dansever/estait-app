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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCurrencySymbol } from "@/components/property/lease/lease-utils";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import StatusBadge from "@/components/property/lease/StatusBadge";
import { formatPaymentFrequency } from "@/lib/utils/formatters";

// Define an enum for property status for better type safety
export enum PropertyStatus {
  VACANT = "vacant",
  OCCUPIED = "occupied",
  MAINTENANCE = "maintenance",
  LISTED = "listed",
}

export interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  address: string;
  status: PropertyStatus;
  rentalPrice: number;
  currency: string;
  payment_frequency: string;
}

export default function PropertyCard({
  id,
  image,
  title,
  address,
  status,
  rentalPrice,
  currency,
  payment_frequency,
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
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={handleImageError}
            priority={false}
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
          {getCurrencySymbol(currency)}
          {rentalPrice.toLocaleString()}{" "}
          <span className="text-sm text-gray-500">
            / {formatPaymentFrequency(payment_frequency)}
          </span>
        </p>
      </CardContent>

      {/* Card Footer with Status Badge positioned at bottom */}
      <CardFooter className="relative border-t pt-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">Tap to view details</p>
        <StatusBadge status={status} />
      </CardFooter>
    </Card>
  );
}
