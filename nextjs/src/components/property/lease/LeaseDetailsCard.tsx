import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, AlertCircle } from "lucide-react";
import { Lease } from "./lease-utils";
import {
  formatDate,
  formatCurrency,
  getDaysLeftInLease,
  getLeaseStatusBadge,
} from "./lease-utils";

interface LeaseDetailsCardProps {
  lease: Lease | null;
  onAddLeaseClick: () => void;
}

export default function LeaseDetailsCard({
  lease,
  onAddLeaseClick,
}: LeaseDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="h-5 w-5 mr-2" /> Lease Details
          </span>
          {lease ? (
            getLeaseStatusBadge(lease.status || "unknown")
          ) : (
            <Badge variant="outline">No Lease</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lease ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(lease.lease_start)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(lease.lease_end)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Rent Amount</p>
                <p className="font-medium flex items-center mt-1">
                  {formatCurrency(lease.rent_amount, lease.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Security Deposit</p>
                <p className="font-medium flex items-center mt-1">
                  {formatCurrency(lease.security_deposit, lease.currency)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Payment Frequency</p>
                <p className="font-medium mt-1 capitalize">
                  {lease.payment_frequency || "monthly"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Due</p>
                <p className="font-medium mt-1">
                  {lease.payment_due_day === 1
                    ? "1st"
                    : lease.payment_due_day === 2
                    ? "2nd"
                    : lease.payment_due_day === 3
                    ? "3rd"
                    : lease.payment_due_day
                    ? `${lease.payment_due_day}th`
                    : "1st"}{" "}
                  of the month
                </p>
              </div>
            </div>

            {lease.status === "active" && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Lease Remaining</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            (getDaysLeftInLease(lease.lease_end) / 365) * 100
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-right mt-1">
                    {getDaysLeftInLease(lease.lease_end)} days left
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <AlertCircle className="h-12 w-12 text-gray-400" />
            <p className="text-gray-500">
              No active lease found for this property
            </p>
            <Button onClick={onAddLeaseClick}>Create New Lease</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
