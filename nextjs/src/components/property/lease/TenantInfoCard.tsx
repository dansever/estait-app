import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Phone, Mail, UserCog } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Lease, Tenant, formatDate, getTenantFullName } from "./lease-utils";

interface TenantInfoCardProps {
  tenant: Tenant | null;
  lease: Lease | null;
  loading: boolean;
  onAddLeaseClick: () => void;
}

export default function TenantInfoCard({
  tenant,
  lease,
  loading,
  onAddLeaseClick,
}: TenantInfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <User className="h-5 w-5 mr-2" /> Tenant
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : tenant ? (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-3">
                    {tenant.first_name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">
                        {getTenantFullName(tenant)}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      {lease?.lease_start
                        ? `Moved in: ${formatDate(lease.lease_start)}`
                        : "Move-in date not set"}
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="ml-2" size="sm">
                  <UserCog className="h-4 w-4" />
                  <span className="sr-only">Manage</span>
                </Button>
              </div>

              <div className="space-y-3 mt-4 text-sm">
                {/* Email */}
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  {tenant.email ? (
                    <a
                      href={`mailto:${tenant.email}`}
                      className="hover:underline hover:text-primary"
                    >
                      {tenant.email}
                    </a>
                  ) : (
                    <span>No email</span>
                  )}
                </div>

                {/* Phone */}
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  {tenant.phone ? (
                    <a
                      href={`tel:${tenant.phone}`}
                      className="hover:underline hover:text-primary"
                    >
                      {tenant.phone}
                    </a>
                  ) : (
                    <span>No phone</span>
                  )}
                </div>

                {/* WhatsApp */}
                {tenant.phone && (
                  <div className="flex items-center text-green-600 hover:text-green-700">
                    <FaWhatsapp className="h-4 w-4 mr-2" />
                    <a
                      href={`https://wa.me/${tenant.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Send WhatsApp
                    </a>
                  </div>
                )}
              </div>

              {tenant.notes && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm mt-1">{tenant.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <User className="h-12 w-12 text-gray-400" />
            <p className="text-gray-500">No tenant assigned to this property</p>
            <Button onClick={onAddLeaseClick}>Create New Lease</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
