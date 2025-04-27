"use client";

import React, { useState } from "react";
import { AppTabs, TabItem } from "@/components/layout/AppTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Info,
  CheckCircle,
  Home,
  Building,
  Settings,
  Plus,
  Trash,
  Search,
  LoaderCircle,
} from "lucide-react";
import SearchBar from "@/components/layout/SearchBar";
import PropertyCard from "@/components/property/PropertyCard";

const ComponentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Button showcase
  const buttonShowcase = () => {
    const variants = [
      "default",
      "secondary",
      "destructive",
      "outline",
      "ghost",
      "link",
    ];
    const sizes = ["default", "sm", "lg", "icon"];

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-3">Button Variants</h3>
          <div className="flex flex-wrap gap-4">
            {variants.map((variant) => (
              <Button
                key={variant}
                variant={variant as any}
                className="capitalize"
              >
                {variant}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Button Sizes</h3>
          <div className="flex flex-wrap items-center gap-4">
            {sizes
              .filter((size) => size !== "icon")
              .map((size) => (
                <Button key={size} size={size as any} className="capitalize">
                  {size} button
                </Button>
              ))}
            <Button size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Button States</h3>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Button with Icons</h3>
          <div className="flex flex-wrap gap-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
            <Button variant="destructive">
              <Trash className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Badge showcase
  const badgeShowcase = () => {
    const variants = [
      "default",
      "secondary",
      "destructive",
      "outline",
      "success",
      "warning",
      "info",
    ];

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-3">Badge Variants</h3>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <Badge
                key={variant}
                variant={variant as any}
                className="capitalize"
              >
                {variant}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Status Badges</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2"></div>
              <Badge variant="outline">Pending</Badge>
            </div>
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></div>
              <Badge variant="outline">Offline</Badge>
            </div>
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-500 mr-2"></div>
              <Badge variant="outline">Inactive</Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Badge Usage Examples</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <Badge variant="success" className="mr-2">
                New
              </Badge>
              <span>Property listing created 2 days ago</span>
            </div>
            <div className="flex items-center">
              <Badge variant="warning" className="mr-2">
                Due Soon
              </Badge>
              <span>Rent payment due in 3 days</span>
            </div>
            <div className="flex items-center">
              <Badge variant="destructive" className="mr-2">
                Overdue
              </Badge>
              <span>Maintenance request needs attention</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Alert showcase
  const alertShowcase = () => {
    const alertVariants = [
      {
        icon: <AlertCircle className="h-4 w-4" />,
        variant: "destructive",
        title: "Error",
        message:
          "Your payment was declined. Please check your card details and try again.",
      },
      {
        icon: <CheckCircle className="h-4 w-4" />,
        variant: "success",
        title: "Success",
        message:
          "Your property was successfully listed. It will be visible to tenants shortly.",
      },
      {
        icon: <Info className="h-4 w-4" />,
        variant: "warning",
        title: "Warning",
        message:
          "Your subscription will expire in 7 days. Please renew to avoid service interruption.",
      },
      {
        icon: <Info className="h-4 w-4" />,
        variant: "info",
        title: "Information",
        message:
          "The system will be under maintenance on Sunday from 2AM to 4AM.",
      },
    ];

    return (
      <div className="space-y-4">
        {alertVariants.map(({ icon, variant, title, message }, i) => (
          <Alert key={i} variant={variant as any}>
            {icon}
            <AlertTitle className="font-semibold">{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };

  // Card showcase
  const cardShowcase = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Standard Card</h3>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Property Overview</CardTitle>
              <CardDescription>
                Summary of your property portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                This is a standard card component with header, title,
                description, and content sections.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Interactive Card</h3>
          <Card className="w-full hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-primary-100">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Monthly Report</span>
                <Badge>New</Badge>
              </CardTitle>
              <CardDescription>
                Your property performance for March 2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Interactive cards can have hover effects, clickable areas, and
                other interactive elements.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View Full Report</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-medium mb-3">Property Card Example</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <PropertyCard
                key={i}
                property={{
                  id: `property-${i}`,
                  title: `Example Property ${i}`,
                  address: `123 Sample St, City ${i}`,
                  images: [`/stock-photos/apartment_${(i % 4) + 1}.jpg`],
                  bedrooms: i + 1,
                  bathrooms: i,
                  size: 800 + i * 100,
                  size_unit: i === 2 ? "ft²" : "m²",
                  propertyType: i === 1 ? "apartment" : "house",
                  rental_status: i === 1 ? "occupied" : "vacant",
                  rentalPrice: 1500 + i * 200,
                  rentalCurrency: "USD",
                  paymentFrequency: i === 2 ? "weekly" : "monthly",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Dialog showcase
  const dialogShowcase = () => {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-3">Basic Dialog</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile information here. Click save when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    defaultValue="John Doe"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    defaultValue="john.doe@example.com"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Confirmation Dialog</h3>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Delete Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  };

  // Form Controls showcase
  const formControlsShowcase = () => {
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(250000);
    const [rating, setRating] = useState(4.5);

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-3">Input Fields</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="standard">Standard Input</Label>
              <Input id="standard" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input
                id="disabled"
                disabled
                placeholder="This input is disabled"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="with-icon">Input with Icon</Label>
              <div className="relative">
                <Input
                  id="with-icon"
                  placeholder="Search..."
                  className="pl-9"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="with-button">Input with Button</Label>
              <div className="flex space-x-2">
                <Input id="with-button" placeholder="Enter email address" />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Numeric Inputs</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity-input">Quantity Input</Label>
              <div className="flex h-10 w-full max-w-[180px] rounded-md border border-input overflow-hidden">
                <button
                  type="button"
                  className="flex items-center justify-center h-full aspect-square border-r border-input bg-transparent hover:bg-muted transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <span className="sr-only">Decrease</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.25 7.5H12.75"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  id="quantity-input"
                  className="w-full h-full border-0 text-center focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
                <button
                  type="button"
                  className="flex items-center justify-center h-full aspect-square border-l border-input bg-transparent hover:bg-muted transition-colors"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <span className="sr-only">Increase</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.5 2.25V12.75M2.25 7.5H12.75"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-input">Price Input with Formatting</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 font-medium">$</span>
                </div>
                <input
                  type="text"
                  id="price-input"
                  className="pl-7 pr-12 h-10 rounded-md border border-input w-full focus:ring-primary-500 focus:border-primary-500"
                  value={price.toLocaleString()}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, "");
                    setPrice(parseInt(rawValue) || 0);
                  }}
                />
                <div className="absolute inset-y-0 right-0 flex">
                  <button
                    type="button"
                    className="flex items-center justify-center h-full px-2 border-l border-input bg-transparent hover:bg-muted transition-colors"
                    onClick={() => setPrice(Math.max(0, price - 1000))}
                  >
                    <span className="sr-only">Decrease</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.25 7.5H12.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center h-full px-2 border-l border-input bg-transparent hover:bg-muted transition-colors"
                    onClick={() => setPrice(price + 1000)}
                  >
                    <span className="sr-only">Increase</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.5 2.25V12.75M2.25 7.5H12.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Formatted price with increment/decrement buttons
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating-input">Rating Input</Label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="rating-input"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  min="0"
                  max="5"
                  step="0.5"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                />
                <span className="flex items-center bg-primary-50 text-primary-700 font-medium rounded-full px-2 py-1 text-xs ml-3 min-w-[2.5rem] justify-center">
                  {rating}
                </span>
              </div>
              <div className="flex mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="text-gray-300 hover:text-yellow-400 transition-colors"
                    onClick={() => setRating(star)}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        rating >= star ? "text-yellow-400" : ""
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Search Components</h3>
          <div className="space-y-4 max-w-xl">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search for properties, tenants, or settings..."
              actions={[
                {
                  id: "search1",
                  label: "Search properties",
                  icon: <Building className="h-4 w-4 text-blue-500" />,
                  description: "Find all properties",
                  short: "⌘P",
                  end: "Search",
                },
                {
                  id: "search2",
                  label: "View dashboard",
                  icon: <Home className="h-4 w-4 text-green-500" />,
                  description: "Go to dashboard",
                  short: "⌘D",
                  end: "Navigation",
                },
              ]}
            />
          </div>
        </div>
      </div>
    );
  };

  // Navigation showcase
  const navigationShowcase = () => {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-3">Tab Navigation Variants</h3>

          <div className="space-y-10">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Default Underline Style
              </h4>
              <AppTabs
                tabs={[
                  {
                    id: "tab1",
                    label: "Overview",
                    content: (
                      <div className="p-4 border rounded-lg">
                        Overview Content
                      </div>
                    ),
                  },
                  {
                    id: "tab2",
                    label: "Analytics",
                    content: (
                      <div className="p-4 border rounded-lg">
                        Analytics Content
                      </div>
                    ),
                  },
                  {
                    id: "tab3",
                    label: "Reports",
                    content: (
                      <div className="p-4 border rounded-lg">
                        Reports Content
                      </div>
                    ),
                  },
                ]}
                variant="underline"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Pills Style
              </h4>
              <AppTabs
                tabs={[
                  {
                    id: "tab1",
                    label: "Day",
                    content: (
                      <div className="p-4 border rounded-lg">
                        Day View Content
                      </div>
                    ),
                  },
                  {
                    id: "tab2",
                    label: "Week",
                    content: (
                      <div className="p-4 border rounded-lg">
                        Week View Content
                      </div>
                    ),
                  },
                  {
                    id: "tab3",
                    label: "Month",
                    content: (
                      <div className="p-4 border rounded-lg">
                        Month View Content
                      </div>
                    ),
                  },
                ]}
                variant="pills"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Bordered Style
              </h4>
              <AppTabs
                tabs={[
                  {
                    id: "tab1",
                    label: "Personal Info",
                    content: (
                      <div className="p-4 border rounded-lg">
                        Personal Information Content
                      </div>
                    ),
                  },
                  {
                    id: "tab2",
                    label: "Preferences",
                    content: (
                      <div className="p-4 border rounded-lg">
                        Preferences Content
                      </div>
                    ),
                  },
                  {
                    id: "tab3",
                    label: "Notifications",
                    content: (
                      <div className="p-4 border rounded-lg">
                        Notification Settings Content
                      </div>
                    ),
                  },
                  {
                    id: "tab4",
                    label: "Disabled Tab",
                    content: <div>Disabled Content</div>,
                    disabled: true,
                  },
                ]}
                variant="bordered"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Standard Tabs Component</h3>
          <Tabs defaultValue="account" className="w-full max-w-xl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="p-4 border rounded-lg mt-2">
              <h4 className="font-medium">Account Settings</h4>
              <p className="text-sm text-gray-500 mt-1">
                Manage your account information and preferences here.
              </p>
            </TabsContent>
            <TabsContent
              value="password"
              className="p-4 border rounded-lg mt-2"
            >
              <h4 className="font-medium">Password Settings</h4>
              <p className="text-sm text-gray-500 mt-1">
                Change your password and security settings.
              </p>
            </TabsContent>
            <TabsContent
              value="settings"
              className="p-4 border rounded-lg mt-2"
            >
              <h4 className="font-medium">Notification Settings</h4>
              <p className="text-sm text-gray-500 mt-1">
                Configure how you receive notifications and updates.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Breadcrumbs</h3>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a
                  href="#"
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 text-gray-400 mx-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <a
                    href="#"
                    className="ml-1 text-sm font-medium text-gray-700 hover:text-primary-600 md:ml-2"
                  >
                    Properties
                  </a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 text-gray-400 mx-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Property Details
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    );
  };

  const tabs: TabItem[] = [
    { id: "buttons", label: "Buttons", content: buttonShowcase() },
    { id: "badges", label: "Badges", content: badgeShowcase() },
    { id: "alerts", label: "Alerts", content: alertShowcase() },
    { id: "cards", label: "Cards", content: cardShowcase() },
    { id: "dialogs", label: "Dialogs", content: dialogShowcase() },
    {
      id: "form-controls",
      label: "Form Controls",
      content: formControlsShowcase(),
    },
    { id: "navigation", label: "Navigation", content: navigationShowcase() },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Estait UI Components</h1>
        <p className="text-gray-500">
          Design system and component playground for consistent UI across the
          application.
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This component library is for development
                purposes only and will not be included in the production build.
                Use this page to explore and test components for consistent
                styling across the application.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AppTabs tabs={tabs} />
    </div>
  );
};

export default ComponentsPage;
