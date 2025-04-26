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
    router.push(`/properties/${id}`);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "vacant":
        return <Badge className="bg-warning text-black">Vacant</Badge>;
      case "occupied":
        return <Badge className="bg-success text-white">Occupied</Badge>;
      default:
        return <Badge className="bg-gray-300 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col h-[360px] bg-card rounded-xl"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <CardHeader className="flex-grow text-headline">
        <CardTitle className="line-clamp-1">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardDescription className="line-clamp-2 text-subhead">
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
        <p className="text-lg font-medium text-headline">
          {formatCurrency(rentalPrice, rentalCurrency)}{" "}
          {formatPaymentFrequency(paymentFrequency)}
        </p>
      </CardContent>

      <CardFooter className="border-t pt-3 flex items-center justify-between border-divider">
        <p className="text-sm text-subhead">Tap to view details</p>
        {getStatusBadge()}
      </CardFooter>
    </Card>
  );
}
