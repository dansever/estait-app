"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  formatCurrency,
  formatPaymentFrequency,
} from "@/lib/formattingHelpers";
import { Constants } from "@/lib/types";

type PaymentFrequency =
  (typeof Constants.public.Enums.PAYMENT_FREQUENCY)[number];

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  address: string;
  status: string;
  rentalPrice: number;
  rentalCurrency: string;
  paymentFrequency: PaymentFrequency;
}

export default function PropertyCard({
  id,
  image,
  title,
  address,
  status,
  rentalPrice,
  rentalCurrency,
  paymentFrequency,
}: PropertyCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/app/properties/${id}`);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "vacant":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Vacant
          </Badge>
        );
      case "occupied":
        return <Badge className="bg-green-600">Occupied</Badge>;
      case "maintenance":
        return <Badge className="bg-orange-600">Maintenance</Badge>;
      case "listed":
        return <Badge className="bg-blue-600">Listed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col h-[360px] bg-white"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-md">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <CardHeader className="flex-grow">
        <CardTitle className="line-clamp-1">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardDescription className="line-clamp-2">
                {address}
              </CardDescription>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{address}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <CardContent>
        <p className="text-lg font-medium">
          {formatCurrency(rentalPrice, rentalCurrency)}{" "}
          {formatPaymentFrequency(paymentFrequency)}
        </p>
      </CardContent>

      <CardFooter className="border-t pt-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">Tap to view details</p>
        {getStatusBadge()}
      </CardFooter>
    </Card>
  );
}
