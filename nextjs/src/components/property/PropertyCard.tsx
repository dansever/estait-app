"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Eye,
  Heart,
  Bookmark,
  Bed,
  Bath,
  ArrowUpRight,
  Ban,
  MapPin,
  Expand,
} from "lucide-react";

type PaymentFrequency =
  (typeof Constants.public.Enums.PAYMENT_FREQUENCY)[number];

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    address: string;
    images?: string[];
    bedrooms?: number;
    bathrooms?: number;
    size?: number; // updated: was `sqft`
    size_unit?: string; // new field (example: 'ft²', 'm²')
    isPublished?: boolean;
    propertyType?: string;
    rental_status?: string; // updated: was `status`
    rentalPrice?: number;
    rentalCurrency?: string;
    paymentFrequency?: PaymentFrequency;
  };
  onSave?: () => void;
  onLike?: () => void;
  variant?: "default" | "compact";
  className?: string;
}

export default function PropertyCard({
  property,
  onSave,
  onLike,
  variant = "default",
  className = "",
}: PropertyCardProps) {
  const {
    id,
    title,
    address,
    images = [],
    bedrooms,
    bathrooms,
    size,
    size_unit = "m²",
    propertyType,
    rental_status = "unknown",
    rentalPrice,
    rentalCurrency = "USD",
    paymentFrequency = "monthly",
  } = property;

  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleClick = () => {
    router.push(`/properties/${id}`);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.();
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.();
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

  const getStatusBadge = () => {
    if (rental_status === "occupied") {
      return <Badge variant="success">Occupied</Badge>;
    }
    if (rental_status === "vacant") {
      return <Badge variant="warning">Vacant</Badge>;
    }

    return (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-500 border-gray-300"
      >
        Unknown
      </Badge>
    );
  };

  const propertyTypeIcon = propertyType === "apartment" ? "🏢" : "🏠";

  const cardHeight = variant === "compact" ? "h-[320px]" : "h-[380px]";

  return (
    <Card
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group cursor-pointer overflow-hidden transition-all duration-300 flex flex-col ${cardHeight} bg-white dark:bg-gray-900 rounded-xl border-0 shadow-sm hover:shadow-md dark:shadow-gray-800 ${className}`}
    >
      <div className="relative h-48 w-full overflow-hidden">
        {images.length > 0 ? (
          <>
            <motion.div
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <Image
                src={images[currentImageIndex]}
                alt={title}
                fill
                className="object-cover transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>

            {/* Image navigation controls */}
            {images.length > 1 && (
              <AnimatePresence>
                {isHovered && (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm hover:bg-black/50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm hover:bg-black/50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </motion.button>
                  </>
                )}
              </AnimatePresence>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <Ban className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Property badges and actions */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
          <div className="flex gap-1.5">
            {getStatusBadge()}
            {propertyType && (
              <Badge
                variant="outline"
                className="bg-white/90 backdrop-blur-sm dark:bg-black/50"
              >
                {propertyTypeIcon}{" "}
                {propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}
              </Badge>
            )}
          </div>

          <div className="flex gap-1.5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className={`rounded-full p-1.5 ${
                isSaved
                  ? "bg-primary-500 text-white"
                  : "bg-white/90 text-gray-700 hover:bg-white dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-700"
              } backdrop-blur-sm shadow transition-colors duration-200`}
            >
              <Bookmark
                className="h-4 w-4"
                fill={isSaved ? "currentColor" : "none"}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`rounded-full p-1.5 ${
                isLiked
                  ? "bg-red-500 text-white"
                  : "bg-white/90 text-gray-700 hover:bg-white dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-700"
              } backdrop-blur-sm shadow transition-colors duration-200`}
            >
              <Heart
                className="h-4 w-4"
                fill={isLiked ? "currentColor" : "none"}
              />
            </motion.button>
          </div>
        </div>
      </div>

      <CardHeader className="pb-2 pt-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold line-clamp-1 font-heading">
              {title}
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardDescription className="line-clamp-1 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    {address}
                  </CardDescription>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 pt-0">
        <p className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-3">
          {formatCurrency(rentalPrice, rentalCurrency)}{" "}
          <span className="text-sm font-normal text-gray-500">
            {formatPaymentFrequency(paymentFrequency)}
          </span>
        </p>

        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          {bedrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>
                {bedrooms} {bedrooms === 1 ? "Bed" : "Beds"}
              </span>
            </div>
          )}

          {bathrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>
                {bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}
              </span>
            </div>
          )}

          {size && (
            <div className="flex items-center gap-1">
              <Expand className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span>
                {size.toLocaleString()} {size_unit}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto border-t pt-3 flex items-center justify-between border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Eye className="h-4 w-4" />
          <span>View details</span>
        </div>
        <motion.div
          className="text-primary-600 dark:text-primary-400 flex items-center gap-0.5 text-sm font-medium"
          animate={{ x: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          See more <ArrowUpRight className="h-3.5 w-3.5" />
        </motion.div>
      </CardFooter>
    </Card>
  );
}
