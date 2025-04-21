"use client";

import { EnrichedProperty } from "@/lib/enrichedPropertyType";

export default function Documents({ data }: { data: EnrichedProperty }) {
  const { rawDocuments } = data;

  if (!rawDocuments?.length) return <p>No documents uploaded.</p>;

  return (
    <ul className="space-y-2 text-sm">
      {rawDocuments.map((doc) => (
        <li key={doc.id} className="border-b pb-2">
          <p>
            <strong>{doc.document_type}</strong> – {doc.file_name}
          </p>
          <p className="text-xs text-gray-500">Uploaded at {doc.created_at}</p>
        </li>
      ))}
    </ul>
  );
}
