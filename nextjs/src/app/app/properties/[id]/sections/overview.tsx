"use client";

import { EnrichedProperty } from "@/lib/enrichedPropertyType";

export default function Overview({ data }: { data: EnrichedProperty }) {
  const { rawProperty, rawAddress } = data;

  return (
    <div className="space-y-4 text-sm text-gray-700">
      <p>
        <strong>Title:</strong> {rawProperty.title}
      </p>
      <p>
        <strong>Description:</strong> {rawProperty.description || "—"}
      </p>
      <p>
        <strong>Type:</strong> {rawProperty.property_type || "—"}
      </p>
      <p>
        <strong>Size:</strong>{" "}
        {rawProperty.size
          ? `${rawProperty.size} ${
              rawProperty.unit_system === "metric" ? "m²" : "sq ft"
            }`
          : "N/A"}
      </p>
      <p>
        <strong>Bedrooms:</strong> {rawProperty.bedrooms ?? "N/A"}
      </p>
      <p>
        <strong>Bathrooms:</strong> {rawProperty.bathrooms ?? "N/A"}
      </p>
      <p>
        <strong>Year Built:</strong> {rawProperty.year_built ?? "N/A"}
      </p>
      <p>
        <strong>Address:</strong>{" "}
        {rawAddress
          ? `${rawAddress.street}, ${rawAddress.city}, ${rawAddress.country}`
          : "Not set"}
      </p>
    </div>
  );
}
