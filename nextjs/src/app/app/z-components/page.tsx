"use client";

import React from "react";
import { AppTabs, TabItem } from "@/components/layout/AppTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";

const buttonVariants = ["default", "secondary", "destructive", "outline"];
const badgeVariants = ["default", "secondary", "destructive", "outline"];
const alertVariants: {
  icon: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  label: string;
  message: string;
}[] = [
  {
    icon: <AlertCircle className="h-4 w-4" />,
    variant: "destructive",
    label: "Error",
    message: "Something went wrong.",
  },
  {
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    variant: "success",
    label: "Success",
    message: "Your action was successful.",
  },
  {
    icon: <Info className="h-4 w-4" />,
    variant: "default",
    label: "Info",
    message: "Here’s some information.",
  },
];

const ComponentsPage = () => {
  const tabs: TabItem[] = [
    {
      id: "buttons",
      label: "Buttons",
      content: (
        <div className="space-x-4 space-y-2">
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant as any}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Button>
          ))}
        </div>
      ),
    },
    {
      id: "badges",
      label: "Badges",
      content: (
        <div className="space-x-4 space-y-2">
          {badgeVariants.map((variant) => (
            <Badge key={variant} variant={variant as any}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "alerts",
      label: "Alerts",
      content: (
        <div className="space-y-4">
          {alertVariants.map(({ icon, variant, label, message }, i) => (
            <Alert key={i} variant={variant as any}>
              {icon}
              <AlertDescription>
                <strong>{label}:</strong> {message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      ),
    },
    {
      id: "cards",
      label: "Cards",
      content: (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sample Card</CardTitle>
          </CardHeader>
          <CardContent>
            This is a card component with a title and content. Use cards to
            group related information.
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Component Showcase</h1>
      <AppTabs tabs={tabs} />
    </div>
  );
};

export default ComponentsPage;
