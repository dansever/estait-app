"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, AlertCircle, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Script from "next/script";

declare global {
  interface Window {
    google: any;
  }
}

interface AddressInputProps {
  defaultValue?: string;
  placeholder?: string;
  name: string;
  required?: boolean;
  onSelect?: (place: any) => void;
  className?: string;
  label?: string;
}

export default function AddressInput({
  defaultValue = "",
  placeholder = "Enter address",
  name,
  required = false,
  onSelect,
  className,
  label,
}: AddressInputProps) {
  const [address, setAddress] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [verified, setVerified] = useState(!!defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);
  const geocoder = useRef<any>(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      geocoder.current = new window.google.maps.Geocoder();
      setGoogleReady(true);
    }
  }, [googleReady]);

  const fetchSuggestions = useCallback((input: string) => {
    if (!autocompleteService.current || input.length < 3) return;
    setLoading(true);
    autocompleteService.current.getPlacePredictions(
      { input, types: ["address"] },
      (predictions: any[], status: string) => {
        setLoading(false);
        if (status === "OK") {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, []);

  const handleSelect = useCallback(
    (placeId: string, description: string) => {
      if (!geocoder.current) return;
      setLoading(true);
      geocoder.current.geocode(
        { placeId },
        (results: any[], status: string) => {
          setLoading(false);
          if (status === "OK" && results.length > 0) {
            const result = results[0];
            setAddress(result.formatted_address);
            setSuggestions([]);
            setVerified(true);

            const components: Record<string, string> = {};
            result.address_components.forEach((comp: any) => {
              const type = comp.types[0];
              if (type === "street_number")
                components.street_number = comp.long_name;
              if (type === "route") components.route = comp.long_name;
              if (type === "subpremise")
                components.apartment_number = comp.long_name;
              if (type === "locality") components.city = comp.long_name;
              if (type === "administrative_area_level_1")
                components.state = comp.short_name;
              if (type === "country") components.country = comp.long_name;
              if (type === "postal_code") components.zip_code = comp.long_name;
            });

            const parsed = {
              placeId,
              formattedAddress: result.formatted_address,
              street: `${components.route || ""}`.trim(),
              street_number: components.street_number || "",
              apartment_number: components.apartment_number || "",
              city: components.city || "",
              state: components.state || "",
              zip_code: components.zip_code || "",
              country: components.country || "",
            };

            onSelect?.(parsed);
          } else {
            setError("Could not verify address");
            setVerified(false);
          }
        }
      );
    },
    [onSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setVerified(false);
    if (value.length >= 3) fetchSuggestions(value);
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setGoogleReady(true)}
      />

      <div className="space-y-2">
        {label && <label className="text-sm font-medium">{label}</label>}

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            type="text"
            name={name}
            placeholder={placeholder}
            required={required}
            value={address}
            onChange={handleChange}
            className={`pl-10 ${className}`}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
          {verified && !loading && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 h-4 w-4" />
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto">
            {suggestions.map((sug) => (
              <div
                key={sug.place_id}
                className="cursor-pointer p-2 text-sm hover:bg-gray-100"
                onClick={() => handleSelect(sug.place_id, sug.description)}
              >
                {sug.description}
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <input
          type="hidden"
          name="address_verified"
          value={verified.toString()}
        />
      </div>
    </>
  );
}
