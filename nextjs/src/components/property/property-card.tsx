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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-[360px]"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-md">
        <img src={image} alt={title} className="h-full w-full object-cover" />
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
        {status === "vacant" ? (
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
